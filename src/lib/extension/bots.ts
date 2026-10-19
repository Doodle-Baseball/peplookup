/**
 * Crawlers, link previewers, monitors and scripted HTTP clients. Matched on
 * the user agent only to decide whether a /go click is counted; the user agent
 * itself is never stored.
 */
const BOT_USER_AGENT =
  /bot\b|bot\/|crawl|spider|slurp|scrap|archiver|facebookexternalhit|embedly|preview|whatsapp|telegram|discord|slack|skype|vkshare|pinterest|bingpreview|mediapartners|adsbot|google-inspectiontool|googleother|feedfetcher|lighthouse|pagespeed|gtmetrix|pingdom|uptime|monitor|headless|phantomjs|selenium|puppeteer|playwright|python|curl|wget|httpclient|http-client|okhttp|axios|node-fetch|undici|go-http|java\/|libwww|perl|ruby|php\/|postman|insomnia|semrush|ahrefs|mj12|dotbot|petalbot|bytespider|yandex|baidu|sogou|duckduck|applebot|amazonbot|gptbot|chatgpt|claudebot|anthropic|perplexity|ccbot|dataforseo|screaming frog/i;

/** An empty user agent is almost never a real browser, so it is treated as a bot. */
export function isLikelyBot(userAgent: string | null | undefined): boolean {
  const value = userAgent?.trim() ?? '';
  return value === '' || BOT_USER_AGENT.test(value);
}

interface HeaderReader {
  get(name: string): string | null;
}

/**
 * A link prefetch, not a click: Next's <Link> prefetches its route with the
 * RSC headers, and browsers mark speculative loads with (Sec-)Purpose.
 */
export function isPrefetchRequest(headers: HeaderReader): boolean {
  if (headers.get('next-router-prefetch') || headers.get('rsc')) return true;
  const purpose = `${headers.get('sec-purpose') ?? ''} ${headers.get('purpose') ?? ''}`.toLowerCase();
  return purpose.includes('prefetch') || purpose.includes('prerender');
}
