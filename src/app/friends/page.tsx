import { ArrowUpRight } from "lucide-react";
import { ExternalLink } from "@/components/external-link";
import { FlowingWaves } from "@/components/flowing-waves";
import { FriendMark } from "@/components/friend-mark";
import { ScrollReveal } from "@/components/scroll-reveal";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FRIEND_CATEGORIES, friends } from "@/data/friends";
import { site } from "@/data/site";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "友链",
  description: `${site.name}友链。`,
};

export default function FriendsPage() {
  return (
    <div className="bg-background">
      <section className="border-border relative overflow-hidden border-b">
        <FlowingWaves className="opacity-70" />
        <div className="relative mx-auto max-w-[1280px] px-5 py-16 sm:px-8 sm:py-24">
          <ScrollReveal className="flex items-end justify-between gap-6">
            <div>
              <p className="text-muted-foreground font-mono text-xs tracking-[0.16em] uppercase">
                External index
              </p>
              <h1 className="font-display mt-5 text-6xl font-bold tracking-[-0.065em] sm:text-8xl">
                友链
              </h1>
            </div>
            <Badge variant="outline" className="mb-2">
              {friends.length} 个站点
            </Badge>
          </ScrollReveal>
        </div>
      </section>

      <div className="mx-auto max-w-[1280px] space-y-16 px-5 py-16 sm:px-8 sm:py-24">
        {FRIEND_CATEGORIES.map((category, categoryIndex) => {
          const items = friends.filter((friend) => friend.category === category);
          if (items.length === 0) return null;
          return (
            <ScrollReveal key={category} delay={Math.min(categoryIndex * 35, 140)}>
              <section className="grid gap-6 lg:grid-cols-[220px_1fr] lg:gap-12">
                <div className="border-foreground border-t pt-4">
                  <span className="text-muted-foreground font-mono text-[10px]">
                    {String(categoryIndex + 1).padStart(2, "0")}
                  </span>
                  <h2 className="font-display mt-3 text-xl font-semibold tracking-[-0.025em]">
                    {category}
                  </h2>
                  <span className="text-muted-foreground mt-1 block text-xs">
                    {items.length}
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {items.map((friend) => (
                    <ExternalLink
                      key={friend.url}
                      href={friend.url}
                      aria-label={`访问${friend.name}`}
                      className="group block min-w-0"
                    >
                      <Card className="studio-card hover:border-foreground h-full gap-0 p-5 py-5">
                        <span className="flex items-start gap-4">
                          <FriendMark name={friend.name} icon={friend.icon} />
                          <span className="min-w-0 flex-1">
                            <span className="flex items-start justify-between gap-2">
                              <span className="text-[15px] font-semibold">
                                {friend.name}
                              </span>
                              <ArrowUpRight className="text-muted-foreground group-hover:text-foreground size-4 shrink-0 transition-transform duration-150 ease-[var(--ease-out)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                            </span>
                            <span className="text-muted-foreground mt-2 line-clamp-2 block text-sm leading-6">
                              {friend.description}
                            </span>
                          </span>
                        </span>
                      </Card>
                    </ExternalLink>
                  ))}
                </div>
              </section>
            </ScrollReveal>
          );
        })}

        <ScrollReveal>
          <div className="border-border flex flex-col gap-5 border-t pt-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-muted-foreground text-sm">
              交换友链请在 QQ 群联系维护者。
            </p>
            <ExternalLink
              href={site.qqGroupJoinUrl}
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              加入群聊
              <ArrowUpRight />
            </ExternalLink>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
