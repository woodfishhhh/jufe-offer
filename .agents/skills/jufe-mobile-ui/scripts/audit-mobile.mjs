import { spawn, spawnSync } from "node:child_process";
import { createWriteStream, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { chromium } from "playwright";

const root = process.cwd();
const outputDir = path.join(root, ".cache", "mobile-audit");
mkdirSync(outputDir, { recursive: true });

function option(name, fallback) {
  const direct = process.argv.find((argument) => argument.startsWith(`${name}=`));
  if (direct) return direct.slice(name.length + 1);
  const index = process.argv.indexOf(name);
  return index >= 0 ? (process.argv[index + 1] ?? fallback) : fallback;
}

const launchServer = process.argv.includes("--launch");
const mode = option("--mode", "ci");
const port = Number(option("--port", "3111"));
const baseUrl = option("--base-url", `http://127.0.0.1:${port}`).replace(/\/$/, "");
const routes = [
  "/1",
  "/2",
  "/3",
  "/4",
  "/5",
  "/6",
  "/resources",
  "/friends",
  "/friends/orbit",
];
const ciViewports = [
  { name: "phone-320", width: 320, height: 700, touch: true },
  { name: "phone-390", width: 390, height: 844, touch: true },
  { name: "tablet-768", width: 768, height: 1024, touch: true },
  { name: "desktop-1024", width: 1024, height: 768, touch: false },
];
const fullViewports = [
  ...ciViewports,
  { name: "phone-412", width: 412, height: 915, touch: true },
  { name: "edge-639", width: 639, height: 820, touch: true },
  { name: "edge-640", width: 640, height: 820, touch: true },
  { name: "edge-767", width: 767, height: 900, touch: true },
  { name: "edge-1023", width: 1023, height: 768, touch: true },
  { name: "desktop-1440", width: 1440, height: 900, touch: false },
];
const viewports = mode === "full" ? fullViewports : ciViewports;

let server;
let serverLog;

function stopServer() {
  if (!server || server.exitCode !== null) return;
  if (process.platform === "win32") {
    spawnSync("taskkill", ["/pid", String(server.pid), "/t", "/f"], {
      stdio: "ignore",
    });
  } else {
    try {
      process.kill(-server.pid, "SIGTERM");
    } catch {
      server.kill("SIGTERM");
    }
  }
  serverLog?.end();
}

async function waitForServer() {
  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${baseUrl}/api/health`, {
        signal: AbortSignal.timeout(2_500),
      });
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Timed out waiting for ${baseUrl}`);
}

function safeName(route) {
  return route === "/" ? "home" : route.slice(1).replaceAll("/", "-");
}

async function inspectPage(page, route, viewport) {
  const consoleErrors = [];
  const pageErrors = [];
  const responseErrors = [];

  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("response", (response) => {
    if (response.url().startsWith(baseUrl) && response.status() >= 400) {
      responseErrors.push(`${response.status()} ${response.url()}`);
    }
  });

  await page.goto(`${baseUrl}${route}`, {
    waitUntil: "domcontentloaded",
    timeout: 30_000,
  });
  await page.locator("main").first().waitFor({ state: "attached", timeout: 10_000 });
  if (route === "/resources") {
    await page.locator('[data-testid="resource-toolbar"]').waitFor({ timeout: 10_000 });
    await page.waitForFunction(
      () => {
        const toolbar = document.querySelector('[data-testid="resource-toolbar"]');
        return toolbar && !toolbar.textContent?.includes("正在整理资源");
      },
      undefined,
      { timeout: 10_000 },
    );
  }
  await page.waitForTimeout(650);

  const metrics = await page.evaluate(
    ({ route, width }) => {
      const root = document.documentElement;
      const visible = (element) => {
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return (
          style.display !== "none" &&
          style.visibility !== "hidden" &&
          Number(style.opacity) > 0 &&
          rect.width > 0 &&
          rect.height > 0 &&
          rect.bottom > 0 &&
          rect.top < innerHeight
        );
      };
      const smallTargets =
        width <= 767
          ? Array.from(
              document.querySelectorAll(
                "a, button, input, select, textarea, [role='button']",
              ),
            )
              .filter(
                (element) =>
                  visible(element) && !element.closest("[inert], [aria-hidden='true']"),
              )
              .map((element) => {
                const rect = element.getBoundingClientRect();
                return {
                  label:
                    element.getAttribute("aria-label") ||
                    element.textContent?.trim().replace(/\s+/g, " ").slice(0, 80) ||
                    element.tagName,
                  width: Math.round(rect.width),
                  height: Math.round(rect.height),
                };
              })
              .filter((target) => target.width < 44 || target.height < 44)
          : [];
      return {
        horizontalOverflow: root.scrollWidth > root.clientWidth + 1,
        scrollWidth: root.scrollWidth,
        clientWidth: root.clientWidth,
        canvasCount: document.querySelectorAll("canvas").length,
        resourceCardCount: document.querySelectorAll(
          '[data-testid="resource-result-card"]',
        ).length,
        lazySentinelPresent: Boolean(
          document.querySelector('[data-testid="resource-lazy-sentinel"]'),
        ),
        smallTargets,
        route,
      };
    },
    { route, width: viewport.width },
  );

  const failures = [];
  if (metrics.horizontalOverflow) {
    failures.push(`horizontal overflow ${metrics.scrollWidth}/${metrics.clientWidth}`);
  }
  const constrained = viewport.width < 1024 || viewport.touch;
  if (route === "/resources" && metrics.canvasCount !== 0) {
    failures.push(`resources rendered ${metrics.canvasCount} canvas elements`);
  } else if (route === "/friends/orbit" && metrics.canvasCount > 1) {
    failures.push(`orbit rendered ${metrics.canvasCount} canvas elements`);
  } else if (constrained && route !== "/friends/orbit" && metrics.canvasCount !== 0) {
    failures.push(
      `${route} rendered ${metrics.canvasCount} canvas elements in lite mode`,
    );
  }
  if (route === "/resources" && metrics.resourceCardCount > 20) {
    failures.push(`resources initially rendered ${metrics.resourceCardCount} cards`);
  }
  if (metrics.smallTargets.length > 0) {
    failures.push(
      `small targets: ${metrics.smallTargets
        .slice(0, 8)
        .map((target) => `${target.label}(${target.width}x${target.height})`)
        .join(", ")}`,
    );
  }
  const screenshot = path.join(outputDir, `${viewport.name}-${safeName(route)}.png`);
  await page.screenshot({
    path: screenshot,
    fullPage: mode === "full" && route !== "/friends/orbit",
  });

  if (route === "/resources" && metrics.lazySentinelPresent) {
    await page.locator('[data-testid="resource-lazy-sentinel"]').scrollIntoViewIfNeeded();
    try {
      await page.waitForFunction(
        (initialCount) =>
          document.querySelectorAll('[data-testid="resource-result-card"]').length >
          initialCount,
        metrics.resourceCardCount,
        { timeout: 5_000 },
      );
    } catch {
      failures.push("resource lazy sentinel did not append the next batch");
    }
    metrics.lazyLoadedCardCount = await page
      .locator('[data-testid="resource-result-card"]')
      .count();
  }

  failures.push(...consoleErrors.map((error) => `console: ${error}`));
  failures.push(...pageErrors.map((error) => `page: ${error}`));
  failures.push(...responseErrors.map((error) => `response: ${error}`));

  return {
    route,
    viewport,
    metrics,
    consoleErrors,
    pageErrors,
    responseErrors,
    failures,
    screenshot: path.relative(root, screenshot),
  };
}

async function main() {
  if (launchServer) {
    const nextCli = path.join(root, "node_modules", "next", "dist", "bin", "next");
    serverLog = createWriteStream(path.join(outputDir, "server.log"), { flags: "w" });
    server = spawn(
      process.execPath,
      [nextCli, "dev", "--hostname", "127.0.0.1", "--port", String(port)],
      {
        cwd: root,
        detached: process.platform !== "win32",
        stdio: ["ignore", "pipe", "pipe"],
      },
    );
    server.stdout.pipe(serverLog);
    server.stderr.pipe(serverLog);
  }

  await waitForServer();
  const browser = await chromium.launch({ headless: true });
  const results = [];

  try {
    for (const viewport of viewports) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        hasTouch: viewport.touch,
        isMobile: viewport.touch && viewport.width < 768,
        deviceScaleFactor: viewport.touch ? 2 : 1,
        reducedMotion: "no-preference",
      });
      for (const route of routes) {
        const page = await context.newPage();
        results.push(await inspectPage(page, route, viewport));
        await page.close();
      }
      await context.close();
    }
  } finally {
    await browser.close();
    stopServer();
  }

  const failures = results.flatMap((result) =>
    result.failures.map(
      (failure) => `${result.viewport.name} ${result.route}: ${failure}`,
    ),
  );
  const report = {
    generatedAt: new Date().toISOString(),
    baseUrl,
    mode,
    results,
    failures,
  };
  const reportPath = path.join(outputDir, "report.json");
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  if (failures.length > 0) {
    console.error(`Mobile UI audit failed with ${failures.length} issue(s):`);
    failures.forEach((failure) => console.error(`- ${failure}`));
    process.exitCode = 1;
    return;
  }
  console.log(`Mobile UI audit passed: ${results.length} route/viewport checks.`);
  console.log(path.relative(root, reportPath));
}

process.on("SIGINT", () => {
  stopServer();
  process.exit(130);
});
process.on("SIGTERM", () => {
  stopServer();
  process.exit(143);
});

main().catch((error) => {
  stopServer();
  console.error(error);
  process.exitCode = 1;
});
