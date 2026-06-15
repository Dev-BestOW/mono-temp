import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

// AI/answer-engine crawlers — explicitly allowed so our content can be
// indexed AND cited by generative engines (GEO).
const aiBots = [
  "GPTBot", // OpenAI (training/index)
  "OAI-SearchBot", // ChatGPT search
  "ChatGPT-User", // ChatGPT browsing
  "ClaudeBot", // Anthropic
  "Claude-Web",
  "PerplexityBot", // Perplexity
  "Google-Extended", // Google AI (Gemini/AI Overviews grounding)
  "Applebot-Extended", // Apple Intelligence
  "CCBot", // Common Crawl (feeds many LLMs)
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      ...aiBots.map((userAgent) => ({ userAgent, allow: "/" })),
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
