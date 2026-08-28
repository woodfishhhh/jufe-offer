#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const AVATAR_EDGE = 320;
const MAX_DOWNLOAD_BYTES = 8 * 1024 * 1024;
const MAX_INPUT_PIXELS = 4096 * 4096;
const FETCH_TIMEOUT_MS = 15_000;
const CAMPUS_PROJECTS_DATA_PATH = path.join("src", "data", "campus-projects.json");
const CAMPUS_PROJECT_AVATARS_PATH = path.join("public", "campus-project-avatars");

export type CampusProjectRecord = {
  title: string;
  subtitle?: string;
  href: string;
  image: string;
};

export type CampusProjectSubmission = {
  projectName: string;
  projectUrl: string;
  tags: string[];
};

export type GitHubRepository = {
  owner: string;
  repository: string;
  canonicalUrl: string;
};

export type AvatarSyncResult = {
  absolutePath: string;
  byteLength: number;
  changed: boolean;
  owner: string;
  publicPath: string;
  relativePath: string;
};

export type CampusProjectSyncResult = {
  avatar: AvatarSyncResult;
  dataChanged: boolean;
  relativePaths: string[];
};

type FetchAvatarOptions = {
  fetchImpl?: typeof fetch;
};

function isValidGitHubOwner(value: string) {
  return (
    value.length >= 1 &&
    value.length <= 39 &&
    /^[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?$/.test(value)
  );
}

function isValidGitHubRepository(value: string) {
  return (
    value.length >= 1 &&
    value.length <= 100 &&
    value !== "." &&
    value !== ".." &&
    /^[A-Za-z0-9._-]+$/.test(value)
  );
}

export function parseGitHubRepositoryUrl(value: string): GitHubRepository | null {
  let parsed: URL;
  try {
    parsed = new URL(value.trim());
  } catch {
    return null;
  }

  if (
    parsed.protocol !== "https:" ||
    !["github.com", "www.github.com"].includes(parsed.hostname.toLowerCase()) ||
    parsed.port ||
    parsed.username ||
    parsed.password ||
    parsed.search ||
    parsed.hash
  ) {
    return null;
  }

  const segments = parsed.pathname.split("/").filter(Boolean);
  if (segments.length !== 2) {
    return null;
  }

  const owner = segments[0];
  const rawRepository = segments[1];
  if (!owner || !rawRepository) {
    return null;
  }

  const repository = rawRepository.toLowerCase().endsWith(".git")
    ? rawRepository.slice(0, -4)
    : rawRepository;
  if (!isValidGitHubOwner(owner) || !isValidGitHubRepository(repository)) {
    return null;
  }

  return {
    owner,
    repository,
    canonicalUrl: `https://github.com/${owner}/${repository}`,
  };
}

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

export async function syncGitHubAvatar(
  repoRoot: string,
  projectUrl: string,
  options: FetchAvatarOptions = {},
): Promise<AvatarSyncResult> {
  const repository = parseGitHubRepositoryUrl(projectUrl);
  if (!repository) {
    throw new Error(`Not a supported GitHub repository URL: ${projectUrl}`);
  }

  const fetchImpl = options.fetchImpl ?? fetch;
  const sourceUrl = `https://github.com/${repository.owner}.png?size=460`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  let downloaded: Buffer;

  try {
    const response = await fetchImpl(sourceUrl, {
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

  const compressed = await compressCampusProjectAvatar(downloaded);
  const owner = repository.owner.toLowerCase();
  const relativePath = path.join(CAMPUS_PROJECT_AVATARS_PATH, `${owner}.webp`);
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
    owner,
    publicPath: `/campus-project-avatars/${owner}.webp`,
    relativePath,
  };
}

function normalizeSubtitle(tags: string[]) {
  const usefulTags = tags
    .map((tag) => tag.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .filter((tag) => !["开源", "校园", "github"].includes(tag.toLowerCase()))
    .slice(0, 2);
  return usefulTags.length ? usefulTags.join(" · ") : "校内开源项目";
}

function sameRepository(left: string, right: string) {
  const leftGitHub = parseGitHubRepositoryUrl(left);
  const rightGitHub = parseGitHubRepositoryUrl(right);
  if (leftGitHub && rightGitHub) {
    return (
      leftGitHub.canonicalUrl.toLowerCase() === rightGitHub.canonicalUrl.toLowerCase()
    );
  }
  return (
    left.replace(/\/+$/, "").toLowerCase() === right.replace(/\/+$/, "").toLowerCase()
  );
}

export function mergeCampusProjectRecord(
  records: CampusProjectRecord[],
  submission: CampusProjectSubmission,
  image: string,
) {
  const repository = parseGitHubRepositoryUrl(submission.projectUrl);
  if (!repository) {
    throw new Error(`Not a supported GitHub repository URL: ${submission.projectUrl}`);
  }

  const nextRecord: CampusProjectRecord = {
    title: submission.projectName.replace(/\s+/g, " ").trim(),
    subtitle: normalizeSubtitle(submission.tags),
    href: repository.canonicalUrl,
    image,
  };
  const index = records.findIndex((record) =>
    sameRepository(record.href, repository.canonicalUrl),
  );
  const nextRecords = records.map((record) => ({ ...record }));

  if (index === -1) {
    nextRecords.push(nextRecord);
  } else {
    nextRecords[index] = {
      ...nextRecord,
      href: records[index]!.href,
    };
  }

  return {
    changed: JSON.stringify(records) !== JSON.stringify(nextRecords),
    records: nextRecords,
  };
}

function parseCampusProjectRecords(value: string) {
  const parsed: unknown = JSON.parse(value);
  if (!Array.isArray(parsed)) {
    throw new Error(`${CAMPUS_PROJECTS_DATA_PATH} must contain an array.`);
  }

  return parsed.map((record, index) => {
    if (
      !record ||
      typeof record !== "object" ||
      typeof record.title !== "string" ||
      typeof record.href !== "string" ||
      typeof record.image !== "string" ||
      (record.subtitle !== undefined && typeof record.subtitle !== "string")
    ) {
      throw new Error(`Invalid campus project record at index ${index}.`);
    }
    return record as CampusProjectRecord;
  });
}

function formatCampusProjectRecords(records: CampusProjectRecord[]) {
  return `${JSON.stringify(records, null, 2)}\n`;
}

export async function syncCampusProjectSubmission(
  repoRoot: string,
  submission: CampusProjectSubmission,
  options: FetchAvatarOptions = {},
): Promise<CampusProjectSyncResult | null> {
  if (!parseGitHubRepositoryUrl(submission.projectUrl)) {
    return null;
  }

  const avatar = await syncGitHubAvatar(repoRoot, submission.projectUrl, options);
  const dataPath = path.join(repoRoot, CAMPUS_PROJECTS_DATA_PATH);
  const records = parseCampusProjectRecords(await readFile(dataPath, "utf8"));
  const merged = mergeCampusProjectRecord(records, submission, avatar.publicPath);

  if (merged.changed) {
    await writeFile(dataPath, formatCampusProjectRecords(merged.records), "utf8");
  }

  return {
    avatar,
    dataChanged: merged.changed,
    relativePaths: [CAMPUS_PROJECTS_DATA_PATH, avatar.relativePath],
  };
}

export async function syncAllCampusProjectAvatars(
  repoRoot: string,
  options: FetchAvatarOptions = {},
) {
  const dataPath = path.join(repoRoot, CAMPUS_PROJECTS_DATA_PATH);
  const records = parseCampusProjectRecords(await readFile(dataPath, "utf8"));
  const repositoriesByOwner = new Map<string, GitHubRepository>();
  let changed = false;

  for (const record of records) {
    const repository = parseGitHubRepositoryUrl(record.href);
    if (!repository) {
      continue;
    }
    repositoriesByOwner.set(repository.owner.toLowerCase(), repository);
  }

  const syncedAvatars = await Promise.all(
    [...repositoriesByOwner.values()].map((repository) =>
      syncGitHubAvatar(repoRoot, repository.canonicalUrl, options),
    ),
  );
  const avatars = new Map(syncedAvatars.map((avatar) => [avatar.owner, avatar] as const));

  for (const record of records) {
    const repository = parseGitHubRepositoryUrl(record.href);
    if (!repository) {
      continue;
    }
    const avatar = avatars.get(repository.owner.toLowerCase());
    if (!avatar) {
      continue;
    }
    if (record.image !== avatar.publicPath) {
      record.image = avatar.publicPath;
      changed = true;
    }
  }

  if (changed) {
    await writeFile(dataPath, formatCampusProjectRecords(records), "utf8");
  }

  return { avatars: [...avatars.values()], dataChanged: changed };
}

async function main() {
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const projectUrls = process.argv.slice(2);

  if (projectUrls.length) {
    for (const projectUrl of projectUrls) {
      const result = await syncGitHubAvatar(repoRoot, projectUrl);
      console.log(
        `${result.changed ? "Updated" : "Unchanged"} ${result.publicPath} (${result.byteLength} bytes)`,
      );
    }
    return;
  }

  const result = await syncAllCampusProjectAvatars(repoRoot);
  for (const avatar of result.avatars) {
    console.log(
      `${avatar.changed ? "Updated" : "Unchanged"} ${avatar.publicPath} (${avatar.byteLength} bytes)`,
    );
  }
}

const entryPath = process.argv[1] ? path.resolve(process.argv[1]).toLowerCase() : "";
if (entryPath === fileURLToPath(import.meta.url).toLowerCase()) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
