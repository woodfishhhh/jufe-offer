import type { NextConfig } from "next";

const htmlInCanvasOriginTrialToken = process.env.HTML_IN_CANVAS_OT_TOKEN?.trim();

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  images: {
    minimumCacheTTL: 2_592_000,
  },
  experimental: {
    optimizePackageImports: ["@base-ui/react", "lucide-react"],
  },
  serverExternalPackages: ["@prisma/client", "prisma"],
  async headers() {
    const headers = [
      {
        source: "/:asset(.*_compressed\\.png)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/models/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=604800, stale-while-revalidate=2592000",
          },
        ],
      },
    ];

    if (htmlInCanvasOriginTrialToken) {
      headers.unshift({
        source: "/:path*",
        headers: [
          {
            key: "Origin-Trial",
            value: htmlInCanvasOriginTrialToken,
          },
        ],
      });
    }

    return headers;
  },
};

export default nextConfig;
