// Fetches latest multifamily news from RSS feeds

const FEEDS = [
  { name: "Multi-Housing News", url: "https://www.multihousingnews.com/feed/" },
  { name: "GlobeSt Multifamily", url: "https://www.globest.com/feed/multifamily/" },
  { name: "Multifamily Executive", url: "https://www.multifamilyexecutive.com/rss" },
  { name: "NMHC", url: "https://www.nmhc.org/rss/" },
  { name: "Connect CRE Florida", url: "https://florida.connect.media/feed/" },
];

export type NewsItem = {
  title: string;
  link: string;
  source: string;
  summary: string;
  date: string;
};

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, "").replace(/&[a-z]+;/g, " ").trim().substring(0, 200);
}

async function fetchFeed(feed: { name: string; url: string }): Promise<NewsItem[]> {
  try {
    const res = await fetch(feed.url, {
      headers: { "User-Agent": "Atlas BD App/1.0" },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return [];
    const xml = await res.text();

    // Simple RSS parser — extract items
    const items: NewsItem[] = [];
    const itemMatches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g);

    for (const match of itemMatches) {
      const item = match[1];
      const title = item.match(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/)?.[1]?.trim() ?? "";
      const link = item.match(/<link>(.*?)<\/link>/)?.[1]?.trim()
        ?? item.match(/<guid>(https?:\/\/[^<]+)<\/guid>/)?.[1]?.trim() ?? "";
      const desc = item.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/)?.[1] ?? "";
      const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1]?.trim() ?? "";

      if (title && link) {
        items.push({
          title,
          link,
          source: feed.name,
          summary: stripHtml(desc),
          date: pubDate ? new Date(pubDate).toLocaleDateString() : "Recent",
        });
      }
      if (items.length >= 3) break;
    }
    return items;
  } catch {
    return [];
  }
}

export async function getMultifamilyNews(): Promise<NewsItem[]> {
  const results = await Promise.all(FEEDS.map(fetchFeed));
  const all = results.flat();
  // Return up to 6 most recent unique stories
  const seen = new Set<string>();
  return all.filter(item => {
    if (seen.has(item.title)) return false;
    seen.add(item.title);
    return true;
  }).slice(0, 6);
}
