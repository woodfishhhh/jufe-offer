import { ArrowUpRight } from "lucide-react";
import { ExternalLink } from "@/components/external-link";
import { FlowingWaves } from "@/components/flowing-waves";
import { FriendMark } from "@/components/friend-mark";
import { ScrollReveal } from "@/components/scroll-reveal";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { FRIEND_GROUPS, friends } from "@/data/friends";
import { site } from "@/data/site";

export const metadata = {
  title: "友链",
  description: `${site.name}收录的官方站点与个人博客。`,
};

export default function FriendsPage() {
  return (
    <div className="bg-background">
      <section className="border-border relative overflow-hidden border-b">
        <FlowingWaves className="opacity-70" />
        <div className="relative mx-auto max-w-[1280px] px-5 pt-24 pb-16 sm:px-8 sm:pt-28 sm:pb-20">
          <ScrollReveal className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="text-muted-foreground font-mono text-xs tracking-[0.16em] uppercase">
                Friend links
              </p>
              <h1 className="font-display mt-5 text-6xl font-bold tracking-[-0.065em] sm:text-8xl">
                友链
              </h1>
              <p className="text-muted-foreground mt-6 max-w-xl text-base leading-7 sm:text-lg">
                收录值得访问的官方站点与个人博客。
              </p>
            </div>
            <Badge variant="outline" className="w-fit lg:mb-2">
              {friends.length} 张卡片
            </Badge>
          </ScrollReveal>
        </div>
      </section>

      <div className="mx-auto max-w-[1280px] space-y-20 px-5 py-16 sm:px-8 sm:py-24">
        {FRIEND_GROUPS.map((group, groupIndex) => {
          const items = friends.filter((friend) => friend.group === group.id);

          return (
            <ScrollReveal key={group.id} delay={Math.min(groupIndex * 50, 100)}>
              <section aria-labelledby={`${group.id}-friends`}>
                <div className="border-foreground grid gap-4 border-t pt-5 sm:grid-cols-[1fr_auto] sm:items-end">
                  <div>
                    <p className="text-muted-foreground font-mono text-[10px] tracking-[0.16em] uppercase">
                      {String(groupIndex + 1).padStart(2, "0")} / {group.eyebrow}
                    </p>
                    <h2
                      id={`${group.id}-friends`}
                      className="font-display mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl"
                    >
                      {group.title}
                    </h2>
                    <p className="text-muted-foreground mt-2 text-sm leading-6">
                      {group.description}
                    </p>
                  </div>
                  <span className="text-muted-foreground font-mono text-xs">
                    {String(items.length).padStart(2, "0")}
                  </span>
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {items.map((friend) => (
                    <ExternalLink
                      key={friend.url}
                      href={friend.url}
                      className="group block min-w-0"
                    >
                      <Card className="studio-card hover:border-foreground relative h-full min-h-48 gap-0 overflow-hidden p-6 py-6">
                        <span className="flex items-start justify-between gap-5">
                          <FriendMark name={friend.name} icon={friend.icon} />
                          <ArrowUpRight className="text-muted-foreground group-hover:text-foreground size-5 shrink-0 transition-transform duration-150 ease-[var(--ease-out)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </span>

                        <span className="mt-8 block min-w-0">
                          <span className="text-muted-foreground block truncate font-mono text-[10px] tracking-[0.12em] uppercase">
                            {friend.domain}
                          </span>
                          <span className="font-display mt-2 block text-xl font-semibold tracking-[-0.025em]">
                            {friend.name}
                          </span>
                          <span className="text-muted-foreground mt-2 block text-sm leading-6">
                            {friend.description}
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
      </div>
    </div>
  );
}
