const FRIEND_AVATARS: Record<string, string> = {
  "jxufe-cs": "https://www.jxufe-cs.top/img/%E4%BC%9A%E5%BE%BD.png",
  "network-security":
    "https://blog.woodfish.site/remote-assets/29f62209b1e51d4579bc674764ba74a490fec57e.png",
  "poisonous-sheep":
    "https://blog.woodfish.site/remote-assets/a553bb95168e4f1cda462bf2bfc1919943d1872c.jpg",
  miuma: "https://blog.woodfish.site/miuma-avatar.jpg",
  tangtangqiu:
    "https://blog.woodfish.site/remote-assets/82ec0e21051cec2604716da8f30ae6ea3f6cada4.png",
  juniexd:
    "https://blog.woodfish.site/remote-assets/3e83da5178e38670d14dbeed83ac6ba2d98843a6.jpg",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  const { key } = await params;
  const upstreamUrl = FRIEND_AVATARS[key];
  if (!upstreamUrl) return new Response("Not found", { status: 404 });

  const upstream = await fetch(upstreamUrl, {
    next: { revalidate: 86_400 },
  });
  if (!upstream.ok || !upstream.body) {
    return new Response("Avatar unavailable", { status: 502 });
  }

  const contentType = upstream.headers.get("content-type") ?? "";
  if (!contentType.startsWith("image/")) {
    return new Response("Invalid avatar", { status: 502 });
  }

  return new Response(upstream.body, {
    headers: {
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      "Content-Type": contentType,
    },
  });
}
