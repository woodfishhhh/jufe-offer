import { ArrowUpRight } from "lucide-react";
import { ExternalLink } from "@/components/external-link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  formatResourceDateTime,
  formatUpdatedAt,
  isPastDeadline,
  type ResourceDto,
} from "@/lib/resources";
import { cn } from "@/lib/utils";

type ResourcePreviewCardProps = {
  resource: ResourceDto;
  showFeaturedBadge?: boolean;
  prominent?: boolean;
  compact?: boolean;
};

export function ResourcePreviewCard({
  resource,
  showFeaturedBadge = false,
  prominent = false,
  compact = false,
}: ResourcePreviewCardProps) {
  return (
    <article className="h-full min-w-0">
      <Card className="studio-card hover:border-foreground h-full min-w-0 gap-0 py-0">
        <div className="flex h-full min-h-0 items-center gap-3 px-4 sm:flex-col sm:items-stretch sm:justify-between sm:p-5 lg:hidden">
          <div className="flex min-w-0 flex-1 items-center gap-3 sm:block sm:flex-none">
            <span className="text-muted-foreground max-w-20 shrink-0 truncate text-[10px] tracking-[0.08em] sm:hidden">
              {resource.category}
            </span>
            <div className="hidden items-center gap-2 sm:flex">
              <Badge variant="outline">{resource.category}</Badge>
              {showFeaturedBadge ? <Badge>精选</Badge> : null}
            </div>
            <h3 className="font-display min-w-0 truncate text-sm font-semibold tracking-[-0.025em] sm:mt-4 sm:line-clamp-2 sm:text-xl sm:whitespace-normal">
              {resource.title}
            </h3>
          </div>
          <ExternalLink
            href={resource.url}
            aria-label={`访问${resource.title}`}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "group size-8 shrink-0 px-0 sm:size-auto sm:self-end sm:px-3",
            )}
          >
            <span className="hidden sm:inline">访问</span>
            <ArrowUpRight className="transition-transform duration-150 ease-[var(--ease-out)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </ExternalLink>
        </div>

        <div className="home-feature-card__full hidden h-full min-h-0 flex-col lg:flex">
          <CardHeader
            className={cn(
              "home-feature-card__header border-border border-b px-5 sm:px-6",
              compact ? "py-4" : "py-5",
              !prominent && "flex-1 content-center",
            )}
          >
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{resource.category}</Badge>
              {showFeaturedBadge ? <Badge>精选</Badge> : null}
            </div>
            <CardTitle
              className={cn(
                "font-display font-semibold tracking-[-0.025em]",
                compact ? "mt-3" : "mt-5",
                prominent
                  ? compact
                    ? "text-xl sm:text-2xl"
                    : "text-2xl sm:text-3xl"
                  : "text-lg",
              )}
            >
              {resource.title}
            </CardTitle>
          </CardHeader>

          {prominent ? (
            <CardContent
              className={cn(
                "home-feature-card__content flex min-h-0 flex-1 flex-col px-5 sm:px-6",
                compact ? "py-3" : "py-5",
              )}
            >
              <p
                className={cn(
                  "text-muted-foreground max-w-2xl text-base leading-7",
                  compact && "line-clamp-1",
                )}
              >
                {resource.description}
              </p>

              {resource.tags.length > 0 ? (
                <div
                  className={cn(
                    "flex min-w-0 flex-nowrap gap-1.5 overflow-hidden",
                    compact ? "mt-2" : "mt-5",
                  )}
                >
                  {resource.tags.slice(0, 4).map((tag) => (
                    <Badge key={tag} variant="secondary" className="font-normal">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              ) : null}
            </CardContent>
          ) : null}

          <CardFooter
            className={cn(
              "home-feature-card__footer justify-between gap-3 bg-transparent px-5 sm:px-6",
              compact ? "py-3" : "py-4",
            )}
          >
            <div className="text-muted-foreground flex min-w-0 flex-col gap-0.5 text-xs">
              {resource.startsAt ? (
                <span className="truncate">
                  开始{" "}
                  <time dateTime={resource.startsAt}>
                    {formatResourceDateTime(resource.startsAt)}
                  </time>
                </span>
              ) : null}
              {resource.deadlineAt ? (
                <span className="truncate">
                  {isPastDeadline(resource.deadlineAt) ? "已截止" : "截止"}{" "}
                  <time dateTime={resource.deadlineAt}>
                    {formatResourceDateTime(resource.deadlineAt)}
                  </time>
                </span>
              ) : null}
              {!resource.startsAt && !resource.deadlineAt ? (
                <time dateTime={resource.updatedAt}>
                  {formatUpdatedAt(resource.updatedAt)}
                </time>
              ) : null}
            </div>
            <ExternalLink
              href={resource.url}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "group")}
            >
              访问
              <ArrowUpRight className="transition-transform duration-150 ease-[var(--ease-out)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </ExternalLink>
          </CardFooter>
        </div>
      </Card>
    </article>
  );
}
