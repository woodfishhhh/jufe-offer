"use client";

import { ArrowUpRight, CalendarClock, Clock3, Pencil, Star, Trash2 } from "lucide-react";
import { FlameWrap } from "@/components/canvasui/FlameWrap";
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
import {
  formatResourceDateTime,
  isPastDeadline,
  type ResourceDto,
} from "@/lib/resources";
import { cn } from "@/lib/utils";

export type ResourceView = "feed" | "masonry";

type ResourceCardProps = {
  resource: ResourceDto;
  view: ResourceView;
  authenticated: boolean;
  onEdit: (resource: ResourceDto) => void;
  onDelete: (resource: ResourceDto) => void;
};

function ResourceTimeMeta({
  resource,
  compact = false,
}: {
  resource: ResourceDto;
  compact?: boolean;
}) {
  if (!resource.startsAt && !resource.deadlineAt) return null;

  const deadlinePassed = resource.deadlineAt
    ? isPastDeadline(resource.deadlineAt)
    : false;

  return (
    <div
      className={cn(
        "text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-xs leading-5",
        compact ? "font-mono" : "border-border bg-muted/45 rounded-xl border px-3 py-2.5",
      )}
    >
      {resource.startsAt ? (
        <span className="inline-flex items-center gap-1.5">
          <CalendarClock className="size-3.5" aria-hidden="true" />
          <span>开始</span>
          <time dateTime={resource.startsAt}>
            {formatResourceDateTime(resource.startsAt)}
          </time>
        </span>
      ) : null}
      {resource.deadlineAt ? (
        <span
          className={cn(
            "inline-flex items-center gap-1.5",
            deadlinePassed && "text-muted-foreground/75",
          )}
        >
          <Clock3 className="size-3.5" aria-hidden="true" />
          <span>{deadlinePassed ? "已截止" : "截止"}</span>
          <time dateTime={resource.deadlineAt}>
            {formatResourceDateTime(resource.deadlineAt)}
          </time>
        </span>
      ) : null}
    </div>
  );
}

function ResourceBadges({ resource }: { resource: ResourceDto }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {resource.isFeatured ? (
        <Badge className="gap-1">
          <Star className="size-3 fill-current" aria-hidden="true" />
          精选
        </Badge>
      ) : null}
      <Badge variant="outline">{resource.category}</Badge>
    </div>
  );
}

function ResourceTags({ resource, limit }: { resource: ResourceDto; limit?: number }) {
  const tags = typeof limit === "number" ? resource.tags.slice(0, limit) : resource.tags;
  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <Badge key={tag} variant="secondary" className="font-normal">
          #{tag}
        </Badge>
      ))}
    </div>
  );
}

function AdminActions({
  resource,
  onEdit,
  onDelete,
}: Pick<ResourceCardProps, "resource" | "onEdit" | "onDelete">) {
  return (
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
  );
}

function ResourceLink({
  resource,
  compact = false,
}: {
  resource: ResourceDto;
  compact?: boolean;
}) {
  return (
    <ExternalLink
      href={resource.url}
      aria-label={`打开「${resource.title}」`}
      className={cn(
        buttonVariants({ variant: "outline", size: compact ? "icon-sm" : "sm" }),
        "group/link shrink-0",
      )}
    >
      {compact ? <span className="sr-only">打开链接</span> : "打开链接"}
      <ArrowUpRight className="transition-transform duration-150 ease-[var(--ease-out)] group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
    </ExternalLink>
  );
}

function FeedCard(props: ResourceCardProps) {
  const { resource, authenticated, onEdit, onDelete } = props;
  return (
    <article className="group/feed border-border hover:bg-muted/45 grid min-w-0 gap-4 border-b px-4 py-5 transition-colors last:border-b-0 sm:grid-cols-[3rem_minmax(0,1fr)_auto] sm:px-5">
      <div
        className="bg-foreground text-background hidden size-11 items-center justify-center rounded-full font-mono text-sm font-semibold sm:flex"
        aria-hidden="true"
      >
        {resource.category.slice(0, 1)}
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{resource.category}</Badge>
          {resource.isFeatured ? <Badge>精选</Badge> : null}
          <ResourceTimeMeta resource={resource} compact />
        </div>
        <h2 className="font-display mt-2 text-lg font-semibold tracking-[-0.025em] sm:text-xl">
          {resource.title}
        </h2>
        <p className="text-muted-foreground mt-1.5 line-clamp-2 text-sm leading-6">
          {resource.description}
        </p>
        <div className="mt-3">
          <ResourceTags resource={resource} limit={4} />
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 sm:justify-end sm:self-center">
        <span className="text-muted-foreground min-w-0 truncate font-mono text-[11px] sm:hidden">
          {new URL(resource.url).hostname}
        </span>
        {authenticated ? (
          <AdminActions resource={resource} onEdit={onEdit} onDelete={onDelete} />
        ) : null}
        <ResourceLink resource={resource} compact />
      </div>
    </article>
  );
}

function MasonryCard(props: ResourceCardProps) {
  const { resource, authenticated, onEdit, onDelete } = props;
  const card = (
    <Card className="studio-card hover:border-foreground gap-0 py-0">
      <CardHeader className="px-5 pt-5 pb-4">
        <div className="flex items-start justify-between gap-3">
          <ResourceBadges resource={resource} />
          {authenticated ? (
            <AdminActions resource={resource} onEdit={onEdit} onDelete={onDelete} />
          ) : null}
        </div>
        <CardTitle className="font-display mt-5 text-xl font-semibold tracking-[-0.03em]">
          {resource.title}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 px-5 pb-5">
        <ResourceTimeMeta resource={resource} />
        <p className="text-muted-foreground text-sm leading-7">{resource.description}</p>
        <ResourceTags resource={resource} />
      </CardContent>

      <CardFooter className="justify-between gap-3 px-5 py-4">
        <span className="text-muted-foreground min-w-0 truncate font-mono text-xs">
          {new URL(resource.url).hostname}
        </span>
        <ResourceLink resource={resource} compact />
      </CardFooter>
    </Card>
  );

  return (
    <article className="w-full">
      {resource.isFeatured ? (
        <FlameWrap
          color={[0.76, 0.1, 0.14]}
          intensity={0.42}
          height={42}
          spread={5}
          radius={16}
          speed={0.2}
          scale={0.45}
          turbulence={0.28}
          turbulenceScale={0.65}
          turbulenceReach={10}
          sparks={0.65}
          sparkSize={0.3}
          sparkDensity={0.6}
          sparkSpeed={0.7}
          rim={1.3}
          melt={1.2}
          distortion={2.5}
          smoke={0.25}
          ember={1.1}
          scorch={0.2}
          className="rounded-2xl"
        >
          {card}
        </FlameWrap>
      ) : (
        card
      )}
    </article>
  );
}

export function ResourceCard(props: ResourceCardProps) {
  if (props.view === "feed") return <FeedCard {...props} />;
  return <MasonryCard {...props} />;
}
