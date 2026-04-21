import type { MetadataRoute } from "next";

const siteUrl = "https://zarena.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/room/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
