import type { RepositoryProfileDto, ResourceDto } from "@/lib/resources";
import { parseGitHubRepositoryUrl } from "@/lib/github-repository";

export const CAMPUS_PROJECT_CATEGORY = "校内开源项目";
export const SITE_REPOSITORY_URL = "https://github.com/woodfishhhh/jufe-offer";
export const DEFAULT_REPOSITORY_AVATAR = "/repository-avatar-placeholder.svg";

export type RepositoryCardData = {
  href: string;
  owner: string;
  name: string;
  description: string;
  stars: number | null;
  avatarPath: string;
  avatarLogin: string;
  primaryLanguage: string | null;
};

type RepositoryResource = Pick<ResourceDto, "title" | "description" | "url"> & {
  repository?: RepositoryProfileDto | null;
};

export function repositoryCardFromResource(
  resource: RepositoryResource,
): RepositoryCardData {
  const parsed = parseGitHubRepositoryUrl(resource.url);
  const repository = resource.repository;

  return {
    href: repository?.repositoryUrl ?? parsed?.canonicalUrl ?? resource.url,
    owner: repository?.owner ?? parsed?.owner ?? new URL(resource.url).hostname,
    name: repository?.name ?? parsed?.repository ?? resource.title,
    description: repository?.description?.trim() || resource.description,
    stars: repository?.stars ?? null,
    avatarPath: repository?.avatarPath ?? DEFAULT_REPOSITORY_AVATAR,
    avatarLogin:
      repository?.avatarLogin ?? repository?.owner ?? parsed?.owner ?? resource.title,
    primaryLanguage: repository?.primaryLanguage ?? null,
  };
}

export function repositoryCardFromProfile(
  profile: RepositoryProfileDto,
): RepositoryCardData {
  return {
    href: profile.repositoryUrl,
    owner: profile.owner,
    name: profile.name,
    description: profile.description?.trim() || `${profile.owner}/${profile.name}`,
    stars: profile.stars,
    avatarPath: profile.avatarPath ?? DEFAULT_REPOSITORY_AVATAR,
    avatarLogin: profile.avatarLogin ?? profile.owner,
    primaryLanguage: profile.primaryLanguage,
  };
}

export function formatRepositoryStars(stars: number | null) {
  if (stars === null) return "—";
  if (stars < 1_000) return stars.toString();

  const value = stars / 1_000;
  return `${value >= 10 ? Math.round(value) : value.toFixed(1).replace(/\.0$/, "")}k`;
}
