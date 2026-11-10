// Imported by next.config.ts, so no "@/" imports here.

/**
 * Answer-engine crawlers that don't run JavaScript and aren't in Next's
 * default HTML-limited list, so without this they'd get metadata streamed
 * into <body> (§1). Extends Next's default regex in next.config.ts.
 */
export const AI_BOTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "CCBot",
  "Meta-ExternalAgent",
  "Amazonbot",
  "MistralAI-User",
];

/**
 * Next's own default (next/dist/shared/lib/router/utils/html-bots.js, 16.4).
 * Setting htmlLimitedBots replaces it, so it's copied here; re-check on upgrades.
 */
export const NEXT_DEFAULT_HTML_LIMITED_BOTS =
  "[\\w-]+-Google|Google-[\\w-]+|Chrome-Lighthouse|Slurp|DuckDuckBot|baiduspider|yandex|sogou|bitlybot|tumblr|vkShare|quora link preview|redditbot|ia_archiver|Bingbot|BingPreview|applebot|facebookexternalhit|facebookcatalog|Twitterbot|LinkedInBot|Slackbot|Discordbot|WhatsApp|SkypeUriPreview|Yeti|googleweblight";
