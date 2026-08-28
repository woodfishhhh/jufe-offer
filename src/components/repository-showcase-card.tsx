/* eslint-disable @next/next/no-img-element */
import { Star } from "lucide-react";

import { formatRepositoryStars, type RepositoryCardData } from "@/lib/repository-card";
import { cn } from "@/lib/utils";

type RepositoryShowcaseCardProps = {
  repository: RepositoryCardData;
  variant: "wall" | "resource-feed" | "resource-grid";
};

export function RepositoryShowcaseCard({
  repository,
  variant,
}: RepositoryShowcaseCardProps) {
  const compact = variant === "wall";
  const feed = variant === "resource-feed";

  return (
    <span
      className={cn(
        "repository-showcase-card relative flex min-w-0 flex-col overflow-hidden bg-[#101010] text-white",
        "before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_12%_0%,rgba(255,255,255,0.1),transparent_42%)] before:content-['']",
        compact
          ? "h-full p-3"
          : "min-h-[228px] rounded-[1.5rem] border border-white/12 p-5",
        feed && "min-h-[210px] sm:min-h-[190px]",
      )}
    >
      <span className="relative z-[1] flex min-w-0 items-center justify-between gap-3">
        <span className="flex min-w-0 items-center gap-2.5">
          <img
            src={repository.avatarPath}
            alt={`${repository.avatarLogin} 的 GitHub 头像`}
            width={compact ? 30 : 42}
            height={compact ? 30 : 42}
            loading="lazy"
            decoding="async"
            draggable={false}
            className={cn(
              "repository-showcase-card__avatar shrink-0 rounded-full border border-white/15 bg-white/[0.06] object-cover",
              compact ? "size-[30px]" : "size-[42px]",
            )}
          />
          <span className="min-w-0">
            <span
              className={cn(
                "block truncate font-mono tracking-[0.08em] text-white/44 uppercase",
                compact ? "text-[7px]" : "text-[9px]",
              )}
            >
              {repository.avatarLogin === repository.owner
                ? "Repository owner"
                : "Contributor"}
            </span>
            <span
              className={cn(
                "mt-0.5 block truncate font-mono text-white/72",
                compact ? "text-[9px]" : "text-xs",
              )}
            >
              @{repository.avatarLogin}
            </span>
          </span>
        </span>

        <span
          className={cn(
            "inline-flex shrink-0 items-center rounded-full border border-white/10 bg-white/[0.045] font-mono text-white/74",
            compact ? "gap-1 px-1.5 py-1 text-[8px]" : "gap-1.5 px-2.5 py-1.5 text-xs",
          )}
          aria-label={`${formatRepositoryStars(repository.stars)} 个 Star`}
        >
          <Star
            className={cn(
              "fill-[#f6c453] text-[#f6c453]",
              compact ? "size-2.5" : "size-3.5",
            )}
            aria-hidden="true"
          />
          {formatRepositoryStars(repository.stars)}
        </span>
      </span>

      <span className={cn("relative z-[1] block min-w-0", compact ? "mt-2" : "mt-5")}>
        <strong
          className={cn(
            "font-display block truncate font-semibold tracking-[-0.035em]",
            compact ? "text-[13px]" : "text-xl sm:text-2xl",
          )}
        >
          {repository.name}
        </strong>
        <small
          className={cn(
            "mt-1 block overflow-hidden text-white/52",
            compact
              ? "line-clamp-2 text-[8px] leading-[1.35]"
              : "line-clamp-3 text-sm leading-6",
          )}
        >
          {repository.description}
        </small>
      </span>

      <span
        className={cn(
          "relative z-[1] mt-auto flex min-w-0 items-center gap-2 border-t border-white/9 font-mono tracking-[0.08em] text-white/34 uppercase",
          compact ? "pt-1.5 text-[7px]" : "pt-3.5 text-[9px]",
        )}
      >
        <span className="truncate">
          {repository.owner} / {repository.name}
        </span>
        {repository.primaryLanguage ? (
          <>
            <span className="ml-auto" aria-hidden="true">
              /
            </span>
            <span className="shrink-0">{repository.primaryLanguage}</span>
          </>
        ) : null}
      </span>
    </span>
  );
}
