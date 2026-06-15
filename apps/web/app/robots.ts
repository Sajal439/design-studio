import { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.goeltraders.in";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api", "/dashboard", "/account"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
