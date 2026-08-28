import { FriendOrbit } from "@/components/friend-orbit";
import { friends } from "@/data/friends";
import { site } from "@/data/site";

export const metadata = {
  title: "友链星图",
  description: `在 ${site.name} 的互动星图中探索友链。`,
};

export default function FriendOrbitPage() {
  return <FriendOrbit friends={friends} />;
}
