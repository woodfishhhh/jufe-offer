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
