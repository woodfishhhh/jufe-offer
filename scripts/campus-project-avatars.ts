#!/usr/bin/env node
import { execFile } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

import type { PrismaClient } from "@prisma/client";
import sharp from "sharp";

import {
  isValidGitHubOwner,
  parseGitHubRepositoryUrl,
} from "../src/lib/github-repository";

export { parseGitHubRepositoryUrl } from "../src/lib/github-repository";

const AVATAR_EDGE = 320;
const MAX_DOWNLOAD_BYTES = 8 * 1024 * 1024;
const MAX_INPUT_PIXELS = 4096 * 4096;
const FETCH_TIMEOUT_MS = 30_000;
const CAMPUS_PROJECT_AVATARS_PATH = path.join("public", "campus-project-avatars");
const CAMPUS_PROJECT_CATEGORY = "校内开源项目";
const execFileAsync = promisify(execFile);

export type CampusProjectSubmission = {
  projectName: string;
  projectUrl: string;
  tags: string[];
};

export type RepositorySnapshot = {
  repositoryUrl: string;
  owner: string;
  name: string;
  description: string | null;
  stars: number;
  avatarPath: string;
  avatarLogin: string;
  primaryLanguage: string | null;
};

export type AvatarSyncResult = {
  absolutePath: string;
  byteLength: number;
  changed: boolean;
  login: string;
  publicPath: string;
  relativePath: string;
};

export type CampusProjectSyncResult = {
  avatar: AvatarSyncResult;
  repository: RepositorySnapshot;
  relativePaths: string[];
};

type GitHubFetchOptions = {
  avatarLogin?: string;
  fetchImpl?: typeof fetch;
  githubToken?: string;
};

function isAllowedAvatarResponseUrl(value: string) {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return false;
  }

  const hostname = parsed.hostname.toLowerCase();
  return (
    parsed.protocol === "https:" &&
    (hostname === "github.com" || hostname === "avatars.githubusercontent.com")
  );
}

function isAllowedApiResponseUrl(value: string) {
  try {
    const parsed = new URL(value);
    return (
      parsed.protocol === "https:" && parsed.hostname.toLowerCase() === "api.github.com"
    );
  } catch {
    return false;
  }
}

async function readResponseWithLimit(response: Response) {
  const declaredLength = Number(response.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_DOWNLOAD_BYTES) {
    throw new Error(`GitHub avatar is larger than ${MAX_DOWNLOAD_BYTES} bytes.`);
  }

  if (!response.body) {
    throw new Error("GitHub avatar response has no body.");
  }

  const chunks: Buffer[] = [];
  const reader = response.body.getReader();
  let total = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_DOWNLOAD_BYTES) {
        await reader.cancel();
        throw new Error(`GitHub avatar is larger than ${MAX_DOWNLOAD_BYTES} bytes.`);
      }
      chunks.push(Buffer.from(value));
    }
  } finally {
    reader.releaseLock();
  }

  return Buffer.concat(chunks, total);
}

async function downloadAvatarWithCurl(sourceUrl: string) {
  const marker = "\n__JUFE_AVATAR_META__";
  const { stdout } = await execFileAsync(
    "curl",
    [
      "--fail",
      "--location",
      "--silent",
      "--show-error",
      "--max-time",
      String(FETCH_TIMEOUT_MS / 1_000),
      "--max-filesize",
      String(MAX_DOWNLOAD_BYTES),
      "--proto",
      "=https",
      "--proto-redir",
      "=https",
      "--user-agent",
      "jufe-offer-avatar-sync/1.0",
      "--header",
      "Accept: image/avif,image/webp,image/png,image/jpeg,*/*;q=0.5",
      "--write-out",
      `${marker}%{url_effective}|%{content_type}`,
      sourceUrl,
    ],
    {
      encoding: "buffer",
      maxBuffer: MAX_DOWNLOAD_BYTES + 64 * 1024,
      windowsHide: true,
    },
  );
  const output = Buffer.isBuffer(stdout) ? stdout : Buffer.from(stdout);
  const markerIndex = output.lastIndexOf(Buffer.from(marker));
  if (markerIndex < 0) {
    throw new Error("GitHub avatar download did not return response metadata.");
  }

  const downloaded = output.subarray(0, markerIndex);
  const [responseUrl, contentType] = output
    .subarray(markerIndex + Buffer.byteLength(marker))
    .toString("utf8")
    .split("|");
  if (!responseUrl || !isAllowedAvatarResponseUrl(responseUrl)) {
    throw new Error(
      `GitHub avatar redirected to an unexpected URL: ${responseUrl ?? ""}`,
    );
  }
  if (!contentType?.toLowerCase().startsWith("image/")) {
    throw new Error(
      `GitHub avatar returned an unexpected content type: ${contentType ?? ""}`,
    );
  }
  if (!downloaded.length || downloaded.length > MAX_DOWNLOAD_BYTES) {
    throw new Error("GitHub avatar download is empty or exceeds the size limit.");
  }

  return downloaded;
}

export async function compressCampusProjectAvatar(input: Buffer) {
  return sharp(input, {
    limitInputPixels: MAX_INPUT_PIXELS,
    sequentialRead: true,
  })
    .rotate()
    .resize(AVATAR_EDGE, AVATAR_EDGE, {
      fit: "cover",
      position: "attention",
    })
    .webp({
      alphaQuality: 80,
      effort: 6,
      quality: 76,
      smartSubsample: true,
    })
    .toBuffer();
}

async function readFileIfPresent(filePath: string) {
  try {
    return await readFile(filePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

function githubHeaders(token?: string) {
  return {
    Accept: "application/vnd.github+json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    "User-Agent": "jufe-offer-repository-sync/1.0",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

export async function fetchGitHubRepositoryMetadata(
  projectUrl: string,
  options: GitHubFetchOptions = {},
): Promise<Omit<RepositorySnapshot, "avatarPath" | "avatarLogin">> {
  const repository = parseGitHubRepositoryUrl(projectUrl);
  if (!repository) {
    throw new Error(`Not a supported GitHub repository URL: ${projectUrl}`);
  }

  const fetchImpl = options.fetchImpl ?? fetch;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetchImpl(
      `https://api.github.com/repos/${encodeURIComponent(repository.owner)}/${encodeURIComponent(repository.repository)}`,
      {
        headers: githubHeaders(options.githubToken),
        redirect: "follow",
        signal: controller.signal,
      },
    );

    if (!response.ok) {
      throw new Error(`GitHub repository request failed with HTTP ${response.status}.`);
    }
    if (!isAllowedApiResponseUrl(response.url)) {
      throw new Error(
        `GitHub repository request returned an unexpected URL: ${response.url}`,
      );
    }

    const data = (await response.json()) as {
      description?: unknown;
      html_url?: unknown;
      language?: unknown;
      name?: unknown;
      owner?: { login?: unknown };
      stargazers_count?: unknown;
    };
    const canonical =
      typeof data.html_url === "string" ? parseGitHubRepositoryUrl(data.html_url) : null;
    const owner = typeof data.owner?.login === "string" ? data.owner.login : null;
    const name = typeof data.name === "string" ? data.name : null;
    const stars = data.stargazers_count;

    if (
      !canonical ||
      !owner ||
      !isValidGitHubOwner(owner) ||
      !name ||
      !Number.isSafeInteger(stars) ||
      (stars as number) < 0
    ) {
      throw new Error("GitHub repository metadata is incomplete or invalid.");
    }

    return {
      repositoryUrl: canonical.canonicalUrl,
      owner,
      name,
      description: typeof data.description === "string" ? data.description : null,
      stars: stars as number,
      primaryLanguage: typeof data.language === "string" ? data.language : null,
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function syncGitHubAvatar(
  repoRoot: string,
  projectUrl: string,
  options: GitHubFetchOptions = {},
): Promise<AvatarSyncResult> {
  const repository = parseGitHubRepositoryUrl(projectUrl);
  if (!repository) {
    throw new Error(`Not a supported GitHub repository URL: ${projectUrl}`);
  }

  const avatarLogin = options.avatarLogin ?? repository.owner;
  if (!isValidGitHubOwner(avatarLogin)) {
    throw new Error(`Not a valid GitHub avatar login: ${avatarLogin}`);
  }

  const sourceUrl = `https://github.com/${avatarLogin}.png?size=460`;
  let downloaded: Buffer;

  if (options.fetchImpl) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      const response = await options.fetchImpl(sourceUrl, {
        headers: {
          Accept: "image/avif,image/webp,image/png,image/jpeg,*/*;q=0.5",
          "User-Agent": "jufe-offer-avatar-sync/1.0",
        },
        redirect: "follow",
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`GitHub avatar request failed with HTTP ${response.status}.`);
      }
      if (!isAllowedAvatarResponseUrl(response.url)) {
        throw new Error(`GitHub avatar redirected to an unexpected URL: ${response.url}`);
      }

      const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
      if (!contentType.startsWith("image/")) {
        throw new Error(
          `GitHub avatar returned an unexpected content type: ${contentType}`,
        );
      }

      downloaded = await readResponseWithLimit(response);
    } finally {
      clearTimeout(timeout);
    }
  } else {
    downloaded = await downloadAvatarWithCurl(sourceUrl);
  }

  const compressed = await compressCampusProjectAvatar(downloaded);
  const login = avatarLogin.toLowerCase();
  const relativePath = path.join(CAMPUS_PROJECT_AVATARS_PATH, `${login}.webp`);
  const absolutePath = path.join(repoRoot, relativePath);
  const previous = await readFileIfPresent(absolutePath);
  const changed = !previous?.equals(compressed);

  if (changed) {
    await mkdir(path.dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, compressed);
  }

  return {
    absolutePath,
    byteLength: compressed.byteLength,
    changed,
    login,
    publicPath: `/campus-project-avatars/${login}.webp`,
    relativePath,
  };
}

export async function syncCampusProjectSubmission(
  repoRoot: string,
  submission: CampusProjectSubmission,
  options: GitHubFetchOptions = {},
): Promise<CampusProjectSyncResult | null> {
  if (!parseGitHubRepositoryUrl(submission.projectUrl)) {
    return null;
  }

  const metadata = await fetchGitHubRepositoryMetadata(submission.projectUrl, options);
  const avatarLogin = options.avatarLogin ?? metadata.owner;
  const avatar = await syncGitHubAvatar(repoRoot, metadata.repositoryUrl, {
    ...options,
    avatarLogin,
  });

  return {
    avatar,
    repository: {
      ...metadata,
      avatarPath: avatar.publicPath,
      avatarLogin,
    },
    relativePaths: [avatar.relativePath],
  };
}

function normalizedUrl(value: string) {
  return value.replace(/\/+$/, "").toLowerCase();
}

async function upsertRepositoryProfile(
  prisma: PrismaClient,
  snapshot: RepositorySnapshot,
) {
  const [resources, profiles] = await Promise.all([
    prisma.resource.findMany({
      where: { category: CAMPUS_PROJECT_CATEGORY },
      select: { id: true, url: true },
    }),
    prisma.repositoryProfile.findMany({
      select: { id: true, repositoryUrl: true },
    }),
  ]);
  const resource = resources.find(
    (candidate) => normalizedUrl(candidate.url) === normalizedUrl(snapshot.repositoryUrl),
  );
  const existing = profiles.find(
    (candidate) =>
      normalizedUrl(candidate.repositoryUrl) === normalizedUrl(snapshot.repositoryUrl),
  );
  const data = {
    repositoryUrl: snapshot.repositoryUrl,
    owner: snapshot.owner,
    name: snapshot.name,
    description: snapshot.description,
    stars: snapshot.stars,
    avatarPath: snapshot.avatarPath,
    avatarLogin: snapshot.avatarLogin,
    primaryLanguage: snapshot.primaryLanguage,
    resourceId: resource?.id ?? null,
    syncedAt: new Date(),
  };

  if (existing) {
    await prisma.repositoryProfile.update({ where: { id: existing.id }, data });
  } else {
    await prisma.repositoryProfile.create({ data });
  }
}

async function syncRepositoryToDatabase(
  prisma: PrismaClient,
  repoRoot: string,
  repositoryUrl: string,
  githubToken?: string,
) {
  const result = await syncCampusProjectSubmission(
    repoRoot,
    { projectName: repositoryUrl, projectUrl: repositoryUrl, tags: [] },
    { githubToken },
  );
  if (!result) {
    throw new Error(`Not a supported GitHub repository URL: ${repositoryUrl}`);
  }

  await upsertRepositoryProfile(prisma, result.repository);
  return result;
}

async function main() {
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const requestedUrls = process.argv.slice(2);
  const githubToken = process.env.GITHUB_TOKEN?.trim() || process.env.GH_TOKEN?.trim();
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();

  try {
    const repositoryUrls = requestedUrls.length
      ? requestedUrls
      : (
          await prisma.repositoryProfile.findMany({
            orderBy: { repositoryUrl: "asc" },
            select: { repositoryUrl: true },
          })
        ).map((profile) => profile.repositoryUrl);

    if (!repositoryUrls.length) {
      console.log("No repository profiles found to sync.");
      return;
    }

    for (const repositoryUrl of repositoryUrls) {
      const result = await syncRepositoryToDatabase(
        prisma,
        repoRoot,
        repositoryUrl,
        githubToken,
      );
      console.log(
        `${result.avatar.changed ? "Updated" : "Unchanged"} ${result.repository.owner}/${result.repository.name}: ${result.repository.stars} stars, ${result.avatar.byteLength} avatar bytes`,
      );
    }
  } finally {
    await prisma.$disconnect();
  }
}

const entryPath = process.argv[1] ? path.resolve(process.argv[1]).toLowerCase() : "";
if (entryPath === fileURLToPath(import.meta.url).toLowerCase()) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
