import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["api.dicebear.com"],
  },
  async headers() {
    return [
      {
        source: "/games/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
        ],
      },
    ];
  },
  // Add rewrites to handle game assets
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/games/:path*",
          destination: "/games/:path*",
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
