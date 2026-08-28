import { FriendDirectory } from "@/components/friend-directory";
import { FriendsSurface } from "@/components/friends-surface";
import { friends } from "@/data/friends";
import { site } from "@/data/site";

export const metadata = {
  title: "友链",
  description: `${site.name} 的友链目录与互动星图，探索值得访问的官方站点与个人博客。`,
};

export default async function FriendsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string | string[] }>;
}) {
  const params = await searchParams;
  const forceDirectory = params.view === "directory";

  return (
    <FriendsSurface friends={friends} forceDirectory={forceDirectory}>
      <FriendDirectory friends={friends} />
    </FriendsSurface>
  );
}
