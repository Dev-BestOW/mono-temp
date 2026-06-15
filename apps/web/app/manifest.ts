import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "My Service",
    short_name: "MyService",
    description: "SEO에 최적화된 Next.js 기반 유저 웹",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#4f46e5",
  };
}
