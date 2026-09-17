// Intelligent Restaurant & Food Listicle Web Scraper for Spot.ph, Booky, WhenInManila, Food Blogs, and Web Guides

import { MANILA_RESTAURANTS_DIRECTORY } from '../data/manilaRestaurants.js';

export function decodeHtmlEntities(str) {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec))
    .trim();
}

// Calculate Haversine distance in km
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Strictly prevent router keywords and platform URL segments from ever becoming restaurant names
export const RESERVED_ROUTER_WORDS = new Set([
  'search', 'biz', 'places', 'place', 'restaurants', 'restaurant',
  'food', 'foods', 'eat', 'eats', 'drinks', 'drink', 'explore',
  'discover', 'find', 'nearme', 'nearby', 'index', 'home', 'main',
  'default', 'category', 'tag', 'locations', 'location', 'philippines',
  'manila', 'reviews', 'review', 'photos', 'menu', 'page', 'post', 'blog', 'article',
  'trending', 'city', 'all', 'user', 'profile'
]);

// Detect Cloudflare / WAF anti-bot challenge or CAPTCHA pages
export function isAntiBotBlock(html) {
  if (!html) return true;
  const lower = html.toLowerCase();
  return (
    lower.includes('warning: this page maybe requiring captcha') ||
    lower.includes('attention required! | cloudflare') ||
    lower.includes('cf-browser-verification') ||
    lower.includes('<title>robot check</title>') ||
    lower.includes('verify you are human') ||
    lower.includes('<title>just a moment...</title>') ||
    lower.includes('security check to access') ||
    lower.includes('access to this page has been denied')
  );
}

// Safely enrich a brand from MANILA_RESTAURANTS_DIRECTORY with closest branch distance
export function enrichBrandFromDirectory(brand, userCoords, listTitle) {
  let nearestBranch = brand.branches[0];
  let distanceKm = null;
  let sortedBranches = [...brand.branches];

  if (userCoords && userCoords.lat && userCoords.lng) {
    sortedBranches = sortedBranches.map(b => {
      const dist = calculateDistance(userCoords.lat, userCoords.lng, b.lat, b.lng);
      return { ...b, distanceKm: dist.toFixed(1) };
    }).sort((a, b) => parseFloat(a.distanceKm) - parseFloat(b.distanceKm));

    nearestBranch = sortedBranches[0];
    distanceKm = nearestBranch.distanceKm;
  }

  return {
    id: `spot-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: brand.name,
    cuisine: brand.cuisine,
    area: nearestBranch ? nearestBranch.area : brand.branches[0].area,
    address: nearestBranch ? nearestBranch.address : brand.branches[0].address,
    lat: nearestBranch ? nearestBranch.lat : brand.branches[0].lat,
    lng: nearestBranch ? nearestBranch.lng : brand.branches[0].lng,
    budget: brand.budget || '$$',
    gutom_level: brand.gutom_level || 'medium',
    pagod_level: brand.pagod_level || 'medium',
    rating: 4.8,
    top_dish: brand.top_dish || 'House Specialty',
    notes: `Top-rated Manila recommendation from ${listTitle || 'Manila Food Guide'}! Must try with Nekol 💕`,
    nearestBranch,
    distanceKm,
    allBranches: sortedBranches
  };
}

// Safely extract a restaurant name from a URL without ever yielding router keywords
export function extractSafeNameFromUrl(targetUrl) {
  try {
    const url = new URL(targetUrl);
    const searchParams = url.searchParams;

    // 1. Check query parameters
    const q = searchParams.get('find_desc') ||
              searchParams.get('q') ||
              searchParams.get('query') ||
              searchParams.get('search_query') ||
              searchParams.get('name') ||
              searchParams.get('restaurant');
    if (q && !RESERVED_ROUTER_WORDS.has(q.toLowerCase().trim())) {
      return q.trim().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }

    // 2. Check path segments from right to left
    const parts = url.pathname.split('/').filter(Boolean);
    for (let i = parts.length - 1; i >= 0; i--) {
      let segment = decodeURIComponent(parts[i])
        .replace(/\.(html?|php|aspx?)$/i, '')
        .replace(/-(?:quezon-city|qc|makati|taguig|bgc|pasig|mandaluyong|san-juan|manila|alabang|muntinlupa|pasay|paranaque|metro-manila|philippines|ph)$/i, '')
        .replace(/[-_]/g, ' ')
        .trim();
      if (segment && !RESERVED_ROUTER_WORDS.has(segment.toLowerCase()) && !/^\d+$/.test(segment)) {
        return segment.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      }
    }

    // 3. Fallback to clean hostname
    const hostParts = url.hostname.replace(/^www\./, '').split('.')[0];
    if (hostParts && !RESERVED_ROUTER_WORDS.has(hostParts.toLowerCase())) {
      return hostParts.charAt(0).toUpperCase() + hostParts.slice(1);
    }
  } catch {}

  return 'Manila Date Spot';
}

// Universal Search & Platform URL Handler (Yelp, Google Maps, TripAdvisor, Foodpanda, GrabFood, etc.)
export function handleSearchOrPlatformUrl(targetUrl, userCoords = null) {
  try {
    const url = new URL(targetUrl);
    const host = url.hostname.toLowerCase().replace(/^www\./, '');
    const pathname = url.pathname.toLowerCase();
    const searchParams = url.searchParams;

    // 1. Detect if this is a Search URL
    const isSearch = 
      pathname.includes('/search') ||
      pathname.includes('/find') ||
      pathname.includes('/explore') ||
      searchParams.has('find_desc') ||
      searchParams.has('q') ||
      searchParams.has('query') ||
      searchParams.has('search_query') ||
      searchParams.has('cuisine') ||
      searchParams.has('keyword') ||
      searchParams.has('cat') ||
      searchParams.has('tag');

    if (isSearch) {
      let query = searchParams.get('find_desc') ||
                  searchParams.get('q') ||
                  searchParams.get('query') ||
                  searchParams.get('search_query') ||
                  searchParams.get('cuisine') ||
                  searchParams.get('keyword') ||
                  searchParams.get('cat') ||
                  searchParams.get('tag') ||
                  '';

      // If query is empty but path has search term, e.g. /search/burgers or /maps/search/Burgers
      if (!query) {
        const parts = url.pathname.split('/').filter(Boolean);
        const searchIdx = parts.findIndex(p => p.toLowerCase() === 'search' || p.toLowerCase() === 'find');
        if (searchIdx !== -1 && parts[searchIdx + 1]) {
          query = decodeURIComponent(parts[searchIdx + 1]).replace(/[+]/g, ' ');
        }
      }

      if (query && !RESERVED_ROUTER_WORDS.has(query.toLowerCase().trim())) {
        const cleanQuery = query.toLowerCase().trim();
        const loc = searchParams.get('find_loc') || searchParams.get('loc') || searchParams.get('location') || 'Metro Manila';
        const platformName = host.split('.')[0].toUpperCase();

        // Search directory
        let matched = MANILA_RESTAURANTS_DIRECTORY.filter(brand => {
          const bName = brand.name.toLowerCase();
          const bCuisine = (brand.cuisine || '').toLowerCase();
          const bDish = (brand.top_dish || '').toLowerCase();
          const bAliases = (brand.aliases || []).map(a => a.toLowerCase());

          if (bName.includes(cleanQuery) || cleanQuery.includes(bName)) return true;
          if (bAliases.some(a => a.includes(cleanQuery) || cleanQuery.includes(a))) return true;
          if (bCuisine.includes(cleanQuery)) return true;
          if (bDish.includes(cleanQuery)) return true;

          const singular = cleanQuery.replace(/s$/, '');
          if (singular.length >= 3 && (bName.includes(singular) || bCuisine.includes(singular) || bDish.includes(singular))) return true;

          return false;
        });

        // If no direct brand matched, check if query matches cuisine keywords (e.g. "American", "Korean", "Pizza", "Coffee", "Wings")
        if (matched.length === 0) {
          matched = MANILA_RESTAURANTS_DIRECTORY.filter(brand => {
            const bCuisine = (brand.cuisine || '').toLowerCase();
            return bCuisine.includes(cleanQuery) || cleanQuery.split(' ').some(word => word.length >= 4 && bCuisine.includes(word));
          });
        }

        if (matched.length > 0) {
          const listTitle = `Top ${query.charAt(0).toUpperCase() + query.slice(1)} in ${loc} (${platformName})`;
          const enriched = matched.map(b => enrichBrandFromDirectory(b, userCoords, listTitle));
          enriched.sort((a, b) => (parseFloat(a.distanceKm) || 999) - (parseFloat(b.distanceKm) || 999));

          return {
            isList: true,
            listTitle,
            restaurants: enriched,
            totalCount: enriched.length,
            sourceUrl: targetUrl
          };
        }
      }
    }

    // 2. Detect Single Business Page on Platforms (e.g. yelp.com/biz/sweet-ecstasy-quezon-city, google.com/maps/place/...)
    if (pathname.includes('/biz/') || pathname.includes('/place/') || pathname.includes('/restaurant_review-')) {
      const parts = url.pathname.split('/').filter(Boolean);
      let slug = parts[parts.length - 1] || '';
      slug = slug.replace(/\.(html?|php)$/i, '');
      // Strip city/metro suffixes
      slug = slug
        .replace(/-(?:quezon-city|qc|makati|taguig|bgc|pasig|mandaluyong|san-juan|manila|alabang|muntinlupa|pasay|paranaque|metro-manila|philippines|ph)$/i, '')
        .replace(/^(?:restaurant_review-[^-]+-[^-]+-reviews-)/i, '')
        .replace(/[-_]/g, ' ')
        .trim();

      if (slug && !RESERVED_ROUTER_WORDS.has(slug.toLowerCase())) {
        const cleanSlug = slug.toLowerCase();
        const matched = MANILA_RESTAURANTS_DIRECTORY.find(brand => {
          const bName = brand.name.toLowerCase().replace(/['’]/g, '');
          if (bName.includes(cleanSlug) || cleanSlug.includes(bName)) return true;
          if (brand.aliases && brand.aliases.some(a => a.toLowerCase().includes(cleanSlug) || cleanSlug.includes(a.toLowerCase()))) return true;
          return false;
        });

        if (matched) {
          const enriched = enrichBrandFromDirectory(matched, userCoords, host);
          return {
            isList: false,
            restaurant: enriched,
            sourceUrl: targetUrl
          };
        }
      }
    }
  } catch (err) {
    console.warn('handleSearchOrPlatformUrl error:', err);
  }

  return null;
}

// Fetch webpage HTML via serverless proxy or fallback CORS proxies
export async function fetchRestaurantWebpageHtml(targetUrl) {
  // 1. Try local Vite dev server / Vercel serverless proxy
  try {
    const apiEndpoint = typeof window !== 'undefined'
      ? `/api/scrape-movies?url=${encodeURIComponent(targetUrl)}`
      : `http://localhost:3000/api/scrape-movies?url=${encodeURIComponent(targetUrl)}`;
    const res = await fetch(apiEndpoint);
    if (res.ok) {
      const data = await res.json();
      if (data && data.html && !isAntiBotBlock(data.html)) return data.html;
    }
  } catch (err) {
    console.warn('Local proxy failed, falling back to public CORS proxies...', err);
  }

  // 2. Fallback: allorigins.win
  try {
    const res = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`);
    if (res.ok) {
      const text = await res.text();
      if (text && text.length > 500 && !isAntiBotBlock(text)) return text;
    }
  } catch (err) {
    console.warn('AllOrigins proxy failed:', err);
  }

  // 3. Fallback: corsproxy.io
  try {
    const res = await fetch(`https://corsproxy.io/?url=${encodeURIComponent(targetUrl)}`);
    if (res.ok) {
      const text = await res.text();
      if (text && text.length > 500 && !isAntiBotBlock(text)) return text;
    }
  } catch (err) {
    console.warn('CorsProxy failed:', err);
  }

  // 4. Fallback: codetabs.com
  try {
    const res = await fetch(`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`);
    if (res.ok) {
      const text = await res.text();
      if (text && text.length > 500 && !isAntiBotBlock(text)) return text;
    }
  } catch (err) {
    console.warn('CodeTabs proxy failed:', err);
  }

  throw new Error('Could not fetch webpage content. Please check the URL or your internet connection.');
}

// Extract article title or page title
export function extractRestaurantArticleTitle(html, targetUrl) {
  try {
    // 1. Check og:title meta tag
    const ogMatch = html.match(/<meta[^>]+(?:property|name)=['"]og:title['"][^>]+content=['"]([^'"]+)['"]/i) ||
                    html.match(/<meta[^>]+content=['"]([^'"]+)['"][^>]+(?:property|name)=['"]og:title['"]/i);
    if (ogMatch) {
      let title = decodeHtmlEntities(ogMatch[1]);
      title = title.replace(/\s*-\s*A Not-So-Popular Kid.*$/i, '')
                   .replace(/\s*\|\s*Spot\.ph.*$/i, '')
                   .replace(/\s*-\s*Booky.*$/i, '')
                   .replace(/\s*-\s*When In Manila.*$/i, '')
                   .replace(/\s*\|\s*Tripadvisor.*$/i, '')
                   .replace(/\s*-\s*Yelp.*$/i, '')
                   .replace(/\s*-\s*Google Maps.*$/i, '')
                   .trim();
      if (title && title.length > 3 && !RESERVED_ROUTER_WORDS.has(title.toLowerCase())) {
        return title;
      }
    }

    // 2. Check <title> tag
    const titleTagMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    if (titleTagMatch) {
      let title = decodeHtmlEntities(titleTagMatch[1]);
      title = title.replace(/\s*-\s*A Not-So-Popular Kid.*$/i, '')
                   .replace(/\s*\|\s*Personal Blog.*$/i, '')
                   .replace(/\s*\|\s*Spot\.ph.*$/i, '')
                   .replace(/\s*-\s*Booky.*$/i, '')
                   .replace(/\s*-\s*When In Manila.*$/i, '')
                   .replace(/\s*\|\s*Tripadvisor.*$/i, '')
                   .replace(/\s*-\s*Yelp.*$/i, '')
                   .replace(/\s*-\s*Google Maps.*$/i, '')
                   .trim();
      if (title && title.length > 3 && !RESERVED_ROUTER_WORDS.has(title.toLowerCase())) {
        return title;
      }
    }

    // 3. Check <h1> tag
    const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    if (h1Match) {
      const cleanH1 = decodeHtmlEntities(h1Match[1].replace(/<[^>]+>/g, '').trim());
      if (cleanH1 && cleanH1.length > 3 && !RESERVED_ROUTER_WORDS.has(cleanH1.toLowerCase())) {
        return cleanH1;
      }
    }
  } catch (e) {
    console.warn('Error extracting restaurant article title:', e);
  }

  // 4. Safe fallback from URL
  return extractSafeNameFromUrl(targetUrl);
}

// Isolate the actual post / article content to prevent picking up sidebars, widgets, or footer junk
export function isolateArticleContent(html) {
  // Common content container selectors for Blogger, WordPress, Ghost, Medium, Spot.ph, etc.
  const contentMatch = 
    html.match(/<div[^>]+(?:class=['"][^'"]*post-body[^'"]*['"]|id=['"]post-body[^'"]*['"])[^>]*>([\s\S]*?)<div[^>]+class=['"][^'"]*(?:post-footer|blog-pager|comments|widget-footer)/i) ||
    html.match(/<div[^>]+(?:class=['"][^'"]*post-body[^'"]*['"]|id=['"]post-body[^'"]*['"])[^>]*>([\s\S]*?)<\/div>/i) ||
    html.match(/<div[^>]+class=['"][^'"]*(?:entry-content|article-content|article-body|story-body|article__body|post-content)[^'"]*['"][^>]*>([\s\S]*?)<\/div>/i) ||
    html.match(/<article[^>]*>([\s\S]*?)<\/article>/i) ||
    html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);

  let content = contentMatch ? contentMatch[1] : html;

  // Clean out scripts, styles, forms, and known junk blocks
  content = content
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<form[\s\S]*?<\/form>/gi, '')
    .replace(/<aside[\s\S]*?<\/aside>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<div[^>]+(?:class|id)=['"][^'"]*(?:sidebar|widget|comments|comment-section|post-footer|blog-pager|share|newsletter|author-box)[^'"]*['"][^>]*>[\s\S]*?<\/div>/gi, '');

  return content;
}

// Patterns that indicate noise, code templates, or sidebar widgets
const JUNK_PATTERNS = [
  /search it here/i, /about the/i, /latest article/i, /top articles/i, /featured articles/i,
  /tools for you/i, /popular posts/i, /leave a comment/i, /leave a reply/i, /related/i,
  /subscribe/i, /newsletter/i, /share this/i, /follow us/i, /table of contents/i,
  /\+\s*(?:posttitle|title|g|comments_text)/i, /[\{\}\[\]\<\>\=\+]/,
  /facebook/i, /instagram/i, /tiktok/i, /privacy policy/i, /terms of/i, /archive/i,
  /disclaimer/i, /cookie/i, /login/i, /sign up/i, /editor/i, /photo from/i, /advertisement/i
];

function cleanCandidateName(name) {
  let cleaned = decodeHtmlEntities(name).trim();
  // Strip emojis, medals (🏅, 🥈, 🥉), stars, fire
  cleaned = cleaned.replace(/[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();
  // Strip leading rank numbers: "1.", "1 -", "#1", "(1)"
  cleaned = cleaned.replace(/^(?:#?\d+[\.\:\)\-]?\s*)+/, '').trim();
  // Strip trailing notes: "- branch", "- multiple branches"
  cleaned = cleaned.replace(/\s*-\s*branch.*$/i, '').trim();
  cleaned = cleaned.replace(/^[-\:\.\s]+/, '').trim();
  return cleaned;
}

// Parse candidate restaurants from HTML
export function parseRawRestaurantsFromHtml(html, targetUrl) {
  // Isolate main post container first
  const content = isolateArticleContent(html);
  const candidates = [];
  const seen = new Set();

  // 1. Check for JSON-LD structured data (Schema.org Restaurant / ItemList)
  try {
    const jsonLdMatches = html.match(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi);
    if (jsonLdMatches) {
      for (const scriptTag of jsonLdMatches) {
        const rawJson = scriptTag.replace(/<script[^>]+type="application\/ld\+json"[^>]*>/i, '').replace(/<\/script>/i, '').trim();
        try {
          const parsed = JSON.parse(rawJson);
          const items = parsed.itemListElement || (Array.isArray(parsed) ? parsed : (parsed['@graph'] || []));
          for (const item of items) {
            const entry = item.item || item;
            if (entry && (entry['@type'] === 'Restaurant' || entry['@type'] === 'FoodEstablishment' || entry.name)) {
              let name = cleanCandidateName(entry.name || '');
              if (name && name.length >= 3 && name.length <= 55 && !seen.has(name.toLowerCase())) {
                seen.add(name.toLowerCase());
                const addr = entry.address ? (typeof entry.address === 'string' ? entry.address : (entry.address.streetAddress || entry.address.addressLocality || '')) : '';
                candidates.push({
                  name,
                  address: addr,
                  description: entry.description || ''
                });
              }
            }
          }
        } catch {}
      }
    }
  } catch {}

  // 2. Normalize inline tags that might break numbers & restaurant names
  // e.g. <b><span ...>7.</span></b><b><span ...> Gino's Pizza</span></b>
  const normalized = content
    .replace(/<\/span>\s*<\/b>\s*<b>\s*<span[^>]*>/gi, ' ')
    .replace(/<\/span>\s*<span[^>]*>/gi, ' ')
    .replace(/<\/b>\s*<b>/gi, ' ')
    .replace(/<\/strong>\s*<strong>/gi, ' ');

  // 3. Match Numbered Elements (1. to 50.) in headings, bold tags, styled spans, or paragraphs
  const numberedRegex = /(?:<h[1-6][^>]*>|<b[^>]*>|<strong[^>]*>|<span[^>]+style=['"][^'"]*(?:font-size|color|bold|weight)[^'"]*['"][^>]*>|<p[^>]*>|<li[^>]*>)\s*#?([1-9]|1\d|2\d|3\d|4\d|50)[\.\:\)\-]\s*([\s\S]*?)(?:<\/h[1-6]>|<\/b>|<\/strong>|<\/span>|<\/p>|<\/li>|<br\s*\/?>)([\s\S]*?)(?=(?:<h[1-6][^>]*>|<b[^>]*>|<strong[^>]*>|<span[^>]+style=['"][^'"]*(?:font-size|color|bold|weight)[^'"]*['"][^>]*>|<p[^>]*>|<li[^>]*>)\s*#?(?:[1-9]|1\d|2\d|3\d|4\d|50)[\.\:\)\-]|$)/gi;
  let m;

  while ((m = numberedRegex.exec(normalized)) !== null) {
    const rank = parseInt(m[1]);
    const rawName = m[2].replace(/<[^>]+>/g, '').trim();
    const name = cleanCandidateName(rawName);
    const section = m[3] || '';

    if (!name || name.length < 3 || name.length > 55) continue;
    if (JUNK_PATTERNS.some(p => p.test(name))) continue;

    const lower = name.toLowerCase();
    if (seen.has(lower)) continue;
    seen.add(lower);

    // Extract address if mentioned in following section text
    let address = '';
    const locMatch = section.match(/(?:📍\s*)?(?:location|address|where|branch|branches)\s*:\s*([^<\n]+)/i);
    if (locMatch) {
      address = decodeHtmlEntities(locMatch[1].replace(/<[^>]+>/g, '')).trim();
    }

    // Extract dish if mentioned
    let dish = '';
    const dishMatch = section.match(/(?:what to order\??|recommended dish\??|top dish\??|must-try\??)\s*:\s*([^<\n]+)/i);
    if (dishMatch) {
      dish = decodeHtmlEntities(dishMatch[1].replace(/<[^>]+>/g, '')).trim();
    }

    // Extract short description
    const pMatch = section.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
    const desc = pMatch ? decodeHtmlEntities(pMatch[1].replace(/<[^>]+>/g, '')).trim().slice(0, 150) : '';

    candidates.push({
      rank,
      name,
      address,
      dish,
      description: desc
    });
  }

  // 4. Heading listicles fallback if no numbered list was found (e.g. <h2>Restaurant Name</h2>)
  if (candidates.length < 2) {
    const headingRegex = /<h[2-4][^>]*>(?:\s*<[^>]+>)*\s*([^<]+?)(?:\s*<\/[^>]+>)*<\/h[2-4]>([\s\S]*?)(?=<h[2-4]|$)/gi;
    while ((m = headingRegex.exec(normalized)) !== null) {
      const name = cleanCandidateName(m[1]);
      const section = m[2] || '';

      if (!name || name.length < 3 || name.length > 55) continue;
      if (JUNK_PATTERNS.some(p => p.test(name))) continue;

      const lower = name.toLowerCase();
      if (seen.has(lower)) continue;
      seen.add(lower);

      let address = '';
      const locMatch = section.match(/(?:📍\s*)?(?:location|address|where|branch|branches)\s*:\s*([^<\n]+)/i);
      if (locMatch) {
        address = decodeHtmlEntities(locMatch[1].replace(/<[^>]+>/g, '')).trim();
      }

      candidates.push({
        rank: candidates.length + 1,
        name,
        address,
        description: ''
      });
    }
  }

  // 5. Ordered list fallback (<ol><li>Restaurant</li></ol>)
  if (candidates.length < 2) {
    const olRegex = /<ol[^>]*>([\s\S]*?)<\/ol>/gi;
    let olMatch;
    while ((olMatch = olRegex.exec(normalized)) !== null) {
      const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
      let liMatch;
      while ((liMatch = liRegex.exec(olMatch[1])) !== null) {
        const text = liMatch[1].replace(/<[^>]+>/g, '').trim();
        const name = cleanCandidateName(text.split('-')[0].split(':')[0]);
        if (name && name.length >= 3 && name.length <= 55 && !seen.has(name.toLowerCase())) {
          if (!JUNK_PATTERNS.some(p => p.test(name))) {
            seen.add(name.toLowerCase());
            candidates.push({
              rank: candidates.length + 1,
              name,
              address: '',
              description: ''
            });
          }
        }
      }
    }
  }

  return candidates.sort((a, b) => (a.rank || 0) - (b.rank || 0));
}

// Classify and enrich a candidate restaurant with Metro Manila database & nearest GPS branch
export function classifyAndEnrichRestaurant(candidate, userCoords = null, listTitle = '') {
  const rawName = candidate.name.trim();
  const cleanName = rawName.toLowerCase().replace(/['’]/g, '');
  const combinedContext = `${rawName} ${candidate.address || ''} ${candidate.description || ''} ${candidate.dish || ''}`.toLowerCase();
  const lowerTitle = (listTitle || '').toLowerCase();

  // 1. Check if it matches a known brand in MANILA_RESTAURANTS_DIRECTORY
  const matchedBrand = MANILA_RESTAURANTS_DIRECTORY.find(r => {
    const rNameClean = r.name.toLowerCase().replace(/['’]/g, '');
    if (rNameClean.includes(cleanName) || cleanName.includes(rNameClean)) return true;
    if (r.aliases && r.aliases.some(a => {
      const aClean = a.toLowerCase().replace(/['’]/g, '');
      return aClean.includes(cleanName) || cleanName.includes(aClean);
    })) return true;
    return false;
  });

  if (matchedBrand) {
    let nearestBranch = matchedBrand.branches[0];
    let distanceKm = null;
    let sortedBranches = [...matchedBrand.branches];

    if (userCoords && userCoords.lat && userCoords.lng) {
      sortedBranches = sortedBranches.map(b => {
        const dist = calculateDistance(userCoords.lat, userCoords.lng, b.lat, b.lng);
        return { ...b, distanceKm: dist.toFixed(1) };
      }).sort((a, b) => parseFloat(a.distanceKm) - parseFloat(b.distanceKm));

      nearestBranch = sortedBranches[0];
      distanceKm = nearestBranch.distanceKm;
    }

    return {
      id: `spot-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: matchedBrand.name,
      cuisine: matchedBrand.cuisine,
      area: nearestBranch ? nearestBranch.area : matchedBrand.branches[0].area,
      address: nearestBranch ? nearestBranch.address : matchedBrand.branches[0].address,
      lat: nearestBranch ? nearestBranch.lat : matchedBrand.branches[0].lat,
      lng: nearestBranch ? nearestBranch.lng : matchedBrand.branches[0].lng,
      budget: matchedBrand.budget || '$$',
      gutom_level: matchedBrand.gutom_level || 'medium',
      pagod_level: matchedBrand.pagod_level || 'medium',
      rating: 4.8,
      top_dish: candidate.dish || matchedBrand.top_dish || 'House Specialty',
      notes: candidate.description ? candidate.description.slice(0, 150) : `Featured in ${listTitle || 'Manila Food Guide'}! Perfect date spot for Migz & Nekol 💕`,
      nearestBranch,
      distanceKm,
      allBranches: sortedBranches
    };
  }

  // 2. Intelligent classifier for independent / new spots (inheriting from listTitle theme!)
  let cuisine = 'Casual Dining & Cafe';
  let budget = '$$';
  let gutom = 'medium';
  let pagod = 'medium';
  let topDish = candidate.dish || 'Chef Specialty';

  // Check specific keywords in restaurant name & context FIRST
  if (combinedContext.includes('pizza') || lowerTitle.includes('pizza')) {
    cuisine = 'Italian & Pizza';
    budget = '$$';
    gutom = 'heavy';
    topDish = candidate.dish || 'Artisan Sourdough Pizza';
  } else if (combinedContext.includes('milktea') || combinedContext.includes('boba') || combinedContext.includes('pearl') || combinedContext.includes('brown sugar') || combinedContext.includes('tea') || combinedContext.includes('beverage') || lowerTitle.includes('milktea') || lowerTitle.includes('boba')) {
    cuisine = 'Milktea & Drinks';
    budget = '$';
    gutom = 'snack';
    topDish = candidate.dish || 'Signature Boba Milk Tea';
  } else if (combinedContext.includes('ramen') || combinedContext.includes('tonkotsu') || combinedContext.includes('sushi') || combinedContext.includes('japanese') || combinedContext.includes('donburi') || combinedContext.includes('gyoza') || lowerTitle.includes('ramen') || lowerTitle.includes('japanese')) {
    cuisine = 'Japanese & Ramen';
    budget = '$$';
    gutom = 'medium';
    topDish = candidate.dish || 'Special Tonkotsu Ramen';
  } else if (combinedContext.includes('samgyup') || combinedContext.includes('kbbq') || combinedContext.includes('korean') || combinedContext.includes('kimchi') || combinedContext.includes('pork belly') || lowerTitle.includes('samgyup') || lowerTitle.includes('kbbq')) {
    cuisine = 'Korean BBQ & Samgyup';
    budget = '$$';
    gutom = 'heavy';
    topDish = candidate.dish || 'Unlimited Pork & Beef KBBQ';
  } else if (combinedContext.includes('taco') || combinedContext.includes('nacho') || combinedContext.includes('burrito') || combinedContext.includes('cantina') || combinedContext.includes('mexican') || lowerTitle.includes('mexican') || lowerTitle.includes('taco')) {
    cuisine = 'Mexican & Cantina';
    budget = '$$';
    gutom = 'medium';
    topDish = candidate.dish || 'Loaded Beef Nachos & Tacos';
  } else if (combinedContext.includes('cafe') || combinedContext.includes('coffee') || combinedContext.includes('brunch') || combinedContext.includes('pastry') || combinedContext.includes('croissant') || lowerTitle.includes('cafe') || lowerTitle.includes('coffee')) {
    cuisine = 'Cafe & Brunch';
    budget = '$$';
    gutom = 'medium';
    topDish = candidate.dish || 'Specialty Coffee & Brunch';
  } else if (combinedContext.includes('pasta') || combinedContext.includes('italian') || combinedContext.includes('risotto') || combinedContext.includes('truffle') || lowerTitle.includes('italian')) {
    cuisine = 'Italian & Pizza';
    budget = '$$';
    gutom = 'medium';
    topDish = candidate.dish || 'Truffle Cream Pasta';
  } else if (combinedContext.includes('steak') || combinedContext.includes('ribs') || combinedContext.includes('grill') || combinedContext.includes('smokehouse') || lowerTitle.includes('steak')) {
    cuisine = 'Steak & American Grill';
    budget = '$$$';
    gutom = 'heavy';
    topDish = candidate.dish || 'Prime Ribeye Steak & BBQ Ribs';
  } else if (combinedContext.includes('burger') || lowerTitle.includes('burger')) {
    cuisine = 'American Grill & Burgers';
    budget = '$$';
    gutom = 'heavy';
    topDish = candidate.dish || 'Double Cheeseburger & Fries';
  } else if (combinedContext.includes('filipino') || combinedContext.includes('pinoy') || combinedContext.includes('lechon') || combinedContext.includes('sisig') || combinedContext.includes('inasal') || lowerTitle.includes('filipino')) {
    cuisine = 'Filipino Comfort Food';
    budget = '$$';
    gutom = 'heavy';
    topDish = candidate.dish || 'Crispy Pork Sisig & Sinigang';
  } else if (combinedContext.includes('dessert') || combinedContext.includes('ice cream') || combinedContext.includes('gelato') || combinedContext.includes('cake') || combinedContext.includes('bingsu') || lowerTitle.includes('dessert')) {
    cuisine = 'Desserts & Sweets';
    budget = '$';
    gutom = 'dessert';
    topDish = candidate.dish || 'Artisan Dessert Platter';
  }

  // Location / Address deduction
  let area = candidate.address || 'Tomas Morato, Quezon City';
  let address = candidate.address || '';
  let lat = 14.6342;
  let lng = 121.0375;
  let distanceKm = null;

  if (userCoords && userCoords.lat && userCoords.lng) {
    if (!address) {
      area = userCoords.district || 'Quezon City';
      address = `Near ${userCoords.district || 'Quezon City'}`;
    }
    lat = userCoords.lat;
    lng = userCoords.lng;
    distanceKm = '1.0';
  }

  return {
    id: `spot-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: rawName,
    cuisine,
    area,
    address: address || area,
    lat,
    lng,
    budget,
    gutom_level: gutom,
    pagod_level: pagod,
    rating: 4.8,
    top_dish: topDish,
    notes: candidate.description ? candidate.description.slice(0, 150) : `Featured in ${listTitle || 'Manila Food Guide'}! Must try with Nekol 💕`,
    distanceKm
  };
}

// Master function to scrape any restaurant list or review webpage
export async function scrapeRestaurantUrl(targetUrl, userCoords = null) {
  // 1. Immediately check if targetUrl is a search or aggregator platform URL
  const platformResult = handleSearchOrPlatformUrl(targetUrl, userCoords);
  if (platformResult) {
    return platformResult;
  }

  // 2. Fetch HTML for blogs, listicles, and web articles
  let html = null;
  try {
    html = await fetchRestaurantWebpageHtml(targetUrl);
  } catch (err) {
    console.warn('Network fetch failed for restaurant URL:', err);
  }

  // If HTML is null or anti-bot block, try fallback extraction
  if (!html || isAntiBotBlock(html)) {
    const fallback = handleSearchOrPlatformUrl(targetUrl, userCoords);
    if (fallback) return fallback;

    // Extract clean name from URL without ever using reserved router words
    const cleanUrlName = extractSafeNameFromUrl(targetUrl);
    const fallbackSingle = classifyAndEnrichRestaurant({
      name: cleanUrlName,
      address: '',
      description: ''
    }, userCoords, 'Online Recommendation');

    return {
      isList: false,
      restaurant: fallbackSingle,
      sourceUrl: targetUrl
    };
  }

  const listTitle = extractRestaurantArticleTitle(html, targetUrl);
  const rawCandidates = parseRawRestaurantsFromHtml(html, targetUrl);

  // If 2 or more restaurants detected, it's a listicle/collection!
  if (rawCandidates.length >= 2) {
    const enriched = rawCandidates.map(c => classifyAndEnrichRestaurant(c, userCoords, listTitle));
    if (userCoords && userCoords.lat) {
      enriched.sort((a, b) => (parseFloat(a.distanceKm) || 999) - (parseFloat(b.distanceKm) || 999));
    }
    return {
      isList: true,
      listTitle,
      restaurants: enriched,
      totalCount: enriched.length,
      sourceUrl: targetUrl
    };
  }

  // If 1 candidate or 0, treat as single restaurant page
  let singleCandidate = rawCandidates[0];
  if (!singleCandidate) {
    let cleanName = listTitle.replace(/\s*-\s*.*$/, '').trim();
    if (!cleanName || RESERVED_ROUTER_WORDS.has(cleanName.toLowerCase())) {
      cleanName = extractSafeNameFromUrl(targetUrl);
    }
    singleCandidate = {
      name: cleanName,
      address: '',
      description: ''
    };
  }

  const enrichedSingle = classifyAndEnrichRestaurant(singleCandidate, userCoords, listTitle);
  return {
    isList: false,
    restaurant: enrichedSingle,
    sourceUrl: targetUrl
  };
}

