import Link from "next/link";
import { ArrowUpRight, Orbit, Sparkles } from "lucide-react";
import { FriendLinkApplication } from "@/components/friend-link-application";
import { ResilientImage } from "@/components/resilient-image";
import { FRIEND_GROUPS, type FriendGroup, type FriendLink } from "@/data/friends";

function FriendCard({ friend }: { friend: FriendLink }) {
  return (
    <a
      href={friend.url}
      target="_blank"
      rel="noopener noreferrer"
      className="friend-directory-card"
      aria-label={`访问友链：${friend.name}`}
    >
      <span className="friend-directory-card__avatar">
        {friend.icon ? (
          <ResilientImage
            src={friend.icon}
            alt=""
            fill
            sizes="56px"
            loading="lazy"
            className="object-cover"
          />
        ) : (
          <span aria-hidden="true">{friend.name.slice(0, 1).toUpperCase()}</span>
        )}
      </span>
      <span className="friend-directory-card__copy">
        <span className="friend-directory-card__topline">
          <strong>{friend.name}</strong>
          <ArrowUpRight aria-hidden="true" />
        </span>
        <span>{friend.description}</span>
        <small>{friend.domain}</small>
      </span>
    </a>
  );
}

function FriendGroupSection({
  group,
  friends,
}: {
  group: FriendGroup;
  friends: readonly FriendLink[];
}) {
  const meta = FRIEND_GROUPS.find((item) => item.id === group);
  const groupFriends = friends.filter((friend) => friend.group === group);

  return (
    <section className="friend-directory-group" aria-labelledby={`friends-${group}`}>
      <header>
        <span>{meta?.eyebrow}</span>
        <h2 id={`friends-${group}`}>{meta?.title}</h2>
        <p>{meta?.description}</p>
      </header>
      <div className="friend-directory-grid">
        {groupFriends.map((friend) => (
          <FriendCard key={friend.url} friend={friend} />
        ))}
      </div>
    </section>
  );
}

export function FriendDirectory({ friends }: { friends: readonly FriendLink[] }) {
  return (
    <div className="friend-directory">
      <div className="friend-directory__glow" aria-hidden="true" />
      <header className="friend-directory__hero">
        <div>
          <p>
            <Sparkles aria-hidden="true" /> JUFE / Friend network
          </p>
          <h1>从一张名片，走进同学们的互联网。</h1>
          <span>
            这里收录学校组织、校友与朋友的站点。默认以轻量目录呈现，也可以主动进入互动星图。
          </span>
        </div>
        <div className="friend-directory__actions">
          <Link href="/friends/orbit" prefetch={false}>
            <Orbit aria-hidden="true" />
            进入互动星图
          </Link>
          <FriendLinkApplication
            className="friend-directory__submit"
            iconClassName="friend-directory__submit-icon"
          />
        </div>
      </header>

      <div
        className="friend-directory__count"
        aria-label={`共收录 ${friends.length} 个友链`}
      >
        <strong>{String(friends.length).padStart(2, "0")}</strong>
        <span>sites in orbit</span>
      </div>

      <div className="friend-directory__groups">
        <FriendGroupSection group="official" friends={friends} />
        <FriendGroupSection group="personal" friends={friends} />
      </div>
    </div>
  );
}
