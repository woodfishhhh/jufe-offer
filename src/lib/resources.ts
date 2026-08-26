import type { Resource } from "@prisma/client";
import { parseTags } from "@/lib/tags";

export type ResourceDto = {
  id: string;
  title: string;
  description: string;
  url: string;
  category: string;
  tags: string[];
  isFeatured: boolean;
  startsAt: string | null;
  deadlineAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export function toResourceDto(resource: Resource): ResourceDto {
  return {
    id: resource.id,
    title: resource.title,
    description: resource.description,
    url: resource.url,
    category: resource.category,
    tags: parseTags(resource.tags),
    isFeatured: resource.isFeatured,
    startsAt: resource.startsAt?.toISOString() ?? null,
    deadlineAt: resource.deadlineAt?.toISOString() ?? null,
    createdAt: resource.createdAt.toISOString(),
    updatedAt: resource.updatedAt.toISOString(),
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
