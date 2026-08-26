"use client";

import { ArrowUpRight, Pencil, Trash2 } from "lucide-react";
import { ExternalLink } from "@/components/external-link";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ResourceDto } from "@/lib/resources";
import { cn } from "@/lib/utils";

type ResourceCardProps = {
  resource: ResourceDto;
  authenticated: boolean;
  onEdit: (resource: ResourceDto) => void;
  onDelete: (resource: ResourceDto) => void;
};

export function ResourceCard({
  resource,
  authenticated,
  onEdit,
  onDelete,
}: ResourceCardProps) {
  return (
    <article className="h-full min-w-0">
      <Card className="studio-card hover:border-foreground h-full min-w-0 gap-0 py-0">
        <CardHeader className="border-border border-b px-5 py-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {resource.isFeatured ? <Badge>精选</Badge> : null}
              <Badge variant="outline">{resource.category}</Badge>
            </div>

            {authenticated ? (
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onEdit(resource)}
                  aria-label={`编辑「${resource.title}」`}
                >
                  <Pencil />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onDelete(resource)}
                  aria-label={`删除「${resource.title}」`}
                >
                  <Trash2 />
                </Button>
              </div>
            ) : null}
          </div>
          <CardTitle className="font-display mt-4 text-lg font-semibold tracking-[-0.025em]">
            {resource.title}
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-1 flex-col px-5 py-5">
          <p className="text-muted-foreground line-clamp-3 text-sm leading-6">
            {resource.description}
          </p>
          {resource.tags.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {resource.tags.slice(0, 4).map((tag) => (
                <Badge key={tag} variant="secondary" className="font-normal">
                  #{tag}
                </Badge>
              ))}
            </div>
          ) : null}
        </CardContent>

        <CardFooter className="justify-between gap-3 bg-transparent px-5 py-4">
          <span className="text-muted-foreground truncate font-mono text-xs">
            {new URL(resource.url).hostname}
          </span>
          <ExternalLink
            href={resource.url}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "group")}
          >
            打开链接
            <ArrowUpRight className="transition-transform duration-150 ease-[var(--ease-out)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </ExternalLink>
        </CardFooter>
      </Card>
    </article>
  );
}
