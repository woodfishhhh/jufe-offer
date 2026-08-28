import type { RepositoryProfile, Resource, ResourceOrigin } from "@prisma/client";
import { parseTags } from "@/lib/tags";

export type RepositoryProfileDto = {
  repositoryUrl: string;
  owner: string;
  name: string;
  description: string | null;
  stars: number;
  avatarPath: string | null;
  avatarLogin: string | null;
  primaryLanguage: string | null;
  syncedAt: string;
};

export type ResourceDto = {
  id: string;
  title: string;
  description: string;
  url: string;
  category: string;
  tags: string[];
  isFeatured: boolean;
  origin: ResourceOrigin;
  startsAt: string | null;
  deadlineAt: string | null;
  createdAt: string;
  updatedAt: string;
  repository: RepositoryProfileDto | null;
};

type ResourceWithRepositoryProfile = Resource & {
  repositoryProfile?: RepositoryProfile | null;
};

function toRepositoryProfileDto(
  profile: RepositoryProfile | null | undefined,
): RepositoryProfileDto | null {
  if (!profile) return null;

  return {
    repositoryUrl: profile.repositoryUrl,
    owner: profile.owner,
    name: profile.name,
    description: profile.description,
    stars: profile.stars,
    avatarPath: profile.avatarPath,
    avatarLogin: profile.avatarLogin,
    primaryLanguage: profile.primaryLanguage,
    syncedAt: profile.syncedAt.toISOString(),
  };
}

export function toResourceDto(resource: ResourceWithRepositoryProfile): ResourceDto {
  return {
    id: resource.id,
    title: resource.title,
    description: resource.description,
    url: resource.url,
    category: resource.category,
    tags: parseTags(resource.tags),
    isFeatured: resource.isFeatured,
    origin: resource.origin,
    startsAt: resource.startsAt?.toISOString() ?? null,
    deadlineAt: resource.deadlineAt?.toISOString() ?? null,
    createdAt: resource.createdAt.toISOString(),
    updatedAt: resource.updatedAt.toISOString(),
    repository: toRepositoryProfileDto(resource.repositoryProfile),
  };
}

export function formatUpdatedAt(iso: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(iso));
}

export function formatResourceDateTime(iso: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(iso));
}

export function isPastDeadline(iso: string) {
  return new Date(iso).getTime() < Date.now();
}
