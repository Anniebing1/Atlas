// Fetches latest multifamily news from RSS feeds

const FEEDS = [
  // National multifamily
  { name: "Multi-Housing News", url: "https://www.multihousingnews.com/feed/" },
  { name: "Multifamily Executive", url: "https://www.multifamilyexecutive.com/rss" },
  { name: "GlobeSt Multifamily", url: "https://www.globest.com/feed/multifamily/" },
  { name: "NMHC", url: "https://www.nmhc.org/rss/" },
  { name: "National Apartment Association", url: "https://www.naahq.org/rss.xml" },
  { name: "Apartment Finance Today", url: "https://www.housingfinance.com/rss.xml" },
  // CRE & real estate broader
  { name: "Bisnow Multifamily", url: "https://www.bisnow.com/rss/national/multifamily" },
  { name: "Connect CRE National", url: "https://www.connect.media/feed/" },
  { name: "CoStar News", url: "https://www.costar.com/rss/news" },
  { name: "The Real Deal", url: "https://therealdeal.com/feed/" },
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
