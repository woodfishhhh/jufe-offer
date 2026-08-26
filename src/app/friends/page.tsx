import { Displacement } from "@/components/canvasui/Displacement";
import { FriendNetwork } from "@/components/friend-network";
import { friends } from "@/data/friends";
import { site } from "@/data/site";

export const metadata = {
  title: "友链",
  description: `${site.name} 的友链网络，在星图中探索值得访问的官方站点与个人博客。`,
};

export default function FriendsPage() {
  return (
    <Displacement className="h-dvh w-full overflow-hidden">
      <FriendNetwork friends={friends} />
    </Displacement>
  );
}
