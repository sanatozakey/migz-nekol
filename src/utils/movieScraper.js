// Intelligent Movie Scraper & HTML Parser for Letterboxd, IMDb, and Web Lists

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
    .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec))
    .trim();
}

// Fetch webpage HTML via serverless proxy or fallback CORS proxies
export async function fetchWebpageHtml(targetUrl) {
  // 1. Try local Vite dev server / Vercel API
  try {
    const apiEndpoint = typeof window !== 'undefined'
      ? `/api/scrape-movies?url=${encodeURIComponent(targetUrl)}`
      : `http://localhost:3000/api/scrape-movies?url=${encodeURIComponent(targetUrl)}`;
    const res = await fetch(apiEndpoint);
    if (res.ok) {
      const data = await res.json();
      if (data && data.html) return data.html;
    }
  } catch (err) {
    console.warn('Local/Vercel scrape API unreachable, attempting fallback proxy...', err);
  }

  // 2. Fallback: allorigins.win
  try {
    const res = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`);
    if (res.ok) {
      const text = await res.text();
      if (text && text.length > 500) return text;
    }
  } catch (err) {
    console.warn('Allorigins proxy failed:', err);
  }

  // 3. Fallback: corsproxy.io
  try {
    const res = await fetch(`https://corsproxy.io/?url=${encodeURIComponent(targetUrl)}`);
    if (res.ok) {
      const text = await res.text();
      if (text && text.length > 500) return text;
    }
  } catch (err) {
    console.warn('Corsproxy fallback failed:', err);
  }

  throw new Error('Could not fetch webpage content. Please check the URL or your internet connection.');
}

// Extract list title or page title
export function extractListTitle(html, targetUrl) {
  try {
    const ogTitleMatch = html.match(/<meta[^>]+property="og:title"[^>]+content="([^"]+)"/i) ||
                         html.match(/<meta[^>]+content="([^"]+)"[^>]+property="og:title"/i);
    if (ogTitleMatch) {
      let title = decodeHtmlEntities(ogTitleMatch[1]);
      title = title.replace(/\s*-\s*Letterboxd.*$/i, '')
                   .replace(/\s*-\s*IMDb.*$/i, '')
                   .replace(/\s*•\s*Letterboxd.*$/i, '')
                   .trim();
      if (title) return title;
    }

    const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    if (h1Match) {
      const cleanH1 = decodeHtmlEntities(h1Match[1].replace(/<[^>]+>/g, '').trim());
      if (cleanH1) return cleanH1;
    }
  } catch (e) {
    console.warn('Error extracting title:', e);
  }

  // Fallback from URL slug
  try {
    const url = new URL(targetUrl);
    const parts = url.pathname.split('/').filter(Boolean);
    const last = parts[parts.length - 1] || 'Movie List';
    return last.replace(/[-_]/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  } catch {
    return 'Imported Movie Collection';
  }
}

// Parse movies list from HTML
export function parseMoviesFromHtml(html, targetUrl) {
  const movies = [];
  const lowerUrl = targetUrl.toLowerCase();

  // --- 1. LETTERBOXD ---
  if (lowerUrl.includes('letterboxd.com')) {
    const isList = lowerUrl.includes('/list/') || lowerUrl.includes('/lists/') || lowerUrl.includes('/watchlist/') || lowerUrl.includes('/collection/');

    if (isList) {
      // Find list container (poster-list UL)
      const ulMatch = html.match(/<ul[^>]+class="[^"]*poster-list[^"]*"[^>]*>([\s\S]*?)<\/ul>/i);
      const searchTarget = ulMatch ? ulMatch[1] : html;

      // Extract posters
      const posterMatches = [...searchTarget.matchAll(/<div[^>]*class="[^"]*film-poster[^"]*"[^>]*>[\s\S]*?<img[^>]+alt="([^"]+)"/gi)];
      if (posterMatches.length > 0) {
        posterMatches.forEach(m => {
          const title = decodeHtmlEntities(m[1]);
          if (title && !movies.includes(title)) {
            movies.push(title);
          }
        });
      } else {
        // Fallback: data-film-name
        const dataNames = [...searchTarget.matchAll(/data-film-name="([^"]+)"/gi)];
        dataNames.forEach(m => {
          const title = decodeHtmlEntities(m[1]);
          if (title && !movies.includes(title)) movies.push(title);
        });
      }
    } else {
      // Single film page on Letterboxd
      const ogTitle = html.match(/<meta[^>]+property="og:title"[^>]+content="([^"]+)"/i) ||
                      html.match(/<meta[^>]+content="([^"]+)"[^>]+property="og:title"/i);
      if (ogTitle) {
        const cleanTitle = ogTitle[1].replace(/\s*\(\d{4}\).*$/, '').replace(/\s*•\s*Letterboxd.*$/i, '').trim();
        movies.push(decodeHtmlEntities(cleanTitle));
      }
    }
  }

  // --- 2. IMDB ---
  else if (lowerUrl.includes('imdb.com')) {
    const isSingleTitle = lowerUrl.includes('/title/tt') && !lowerUrl.includes('/list/') && !lowerUrl.includes('/chart/');

    if (isSingleTitle) {
      const ogTitle = html.match(/<meta[^>]+property="og:title"[^>]+content="([^"]+)"/i);
      if (ogTitle) {
        const cleanTitle = ogTitle[1].replace(/\s*\(\d{4}\).*$/, '').replace(/\s*-\s*IMDb.*$/, '').trim();
        movies.push(decodeHtmlEntities(cleanTitle));
      }
    } else {
      // IMDb Chart or Custom List
      // Modern charts (h3.ipc-title__text)
      const modernHeadings = [...html.matchAll(/<h3[^>]+class="[^"]*ipc-title__text[^"]*"[^>]*>([^<]+)<\/h3>/gi)];
      modernHeadings.forEach(m => {
        const clean = m[1].replace(/^\d+[\.\s\-]+/, '').trim();
        if (clean && !clean.toLowerCase().includes('recently viewed') && !movies.includes(clean)) {
          movies.push(decodeHtmlEntities(clean));
        }
      });

      // Classic lists (h3.lister-item-header)
      if (movies.length === 0) {
        const listerHeaders = [...html.matchAll(/<h3[^>]+class="lister-item-header"[^>]*>[\s\S]*?<a[^>]*>([^<]+)<\/a>/gi)];
        listerHeaders.forEach(m => {
          const title = decodeHtmlEntities(m[1].trim());
          if (title && !movies.includes(title)) movies.push(title);
        });
      }
    }
  }

  // --- 3. ROTTEN TOMATOES ---
  else if (lowerUrl.includes('rottentomatoes.com')) {
    // Guide/Ranked articles
    const rtTitles = [...html.matchAll(/class="[^"]*article_movie_title[^"]*"[^>]*>[\s\S]*?<a[^>]*>([^<]+)<\/a>/gi)];
    if (rtTitles.length > 0) {
      rtTitles.forEach(m => {
        const clean = cleanMovieTitle(m[1]);
        if (clean && !movies.includes(clean)) movies.push(clean);
      });
    }

    const rtItems = [...html.matchAll(/data-qa="discovery-media-list-item-caption"[^>]*>[\s\S]*?<span[^>]+class="[^"]*title[^"]*"[^>]*>([^<]+)<\/span>/gi)];
    if (rtItems.length > 0) {
      rtItems.forEach(m => {
        const clean = cleanMovieTitle(m[1]);
        if (clean && !movies.includes(clean)) movies.push(clean);
      });
    }
  }

  // --- 4. WIKIPEDIA LISTS OF FILMS ---
  else if (lowerUrl.includes('wikipedia.org')) {
    // Wikipedia wikitables: <td ...><i ...>Title</i>
    const wikiItalics = [...html.matchAll(/<td[^>]*>\s*<i[^>]*>([\s\S]*?)<\/i>/gi)];
    if (wikiItalics.length > 0) {
      wikiItalics.forEach(m => {
        const text = m[1].replace(/<[^>]+>/g, '').trim();
        const clean = cleanMovieTitle(text);
        if (clean && isLikelyMovieTitle(clean) && !movies.includes(clean)) {
          movies.push(clean);
        }
      });
    }

    // Wikipedia list items with italics: <li><i><a ...>Title</a></i>
    if (movies.length === 0) {
      const wikiLis = [...html.matchAll(/<li>\s*<i>(?:<a[^>]*>)?([^<]+)(?:<\/a>)?<\/i>/gi)];
      wikiLis.forEach(m => {
        const clean = cleanMovieTitle(m[1]);
        if (clean && isLikelyMovieTitle(clean) && !movies.includes(clean)) {
          movies.push(clean);
        }
      });
    }
  }

  // --- 5. UNIVERSAL / BLOG / ENTERTAINMENT SITES (Spot.ph, BuzzFeed, Collider, Screen Rant, Esquire, PEP, Rappler, etc.) ---
  if (movies.length === 0) {
    // A. JSON-LD Structured Data
    const jsonLdMatches = [...html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)];
    for (const jMatch of jsonLdMatches) {
      try {
        const data = JSON.parse(jMatch[1]);
        if (data.itemListElement && Array.isArray(data.itemListElement)) {
          data.itemListElement.forEach(item => {
            const name = item.item?.name || item.name;
            if (name && typeof name === 'string') {
              const clean = cleanMovieTitle(name);
              if (clean && isLikelyMovieTitle(clean) && !movies.includes(clean)) {
                movies.push(clean);
              }
            }
          });
        }
      } catch {}
    }

    // B. Heading listicles: <h2, h3, h4> with numbered patterns (e.g. "1. That Thing Called Tadhana (2014)" or "#1: Movie")
    if (movies.length === 0) {
      const numberedHeadings = [...html.matchAll(/<h[234][^>]*>(?:\s*<(?:strong|b|a)[^>]*>)?(?:\s*(?:#?\d+[\.\:\)\-\s]+|No\.\s*\d+[\:\.\s]+))([\s\S]*?)(?:<\/(?:strong|b|a)>)?<\/h[234]>/gi)];
      if (numberedHeadings.length >= 3) {
        numberedHeadings.forEach(m => {
          const raw = m[1].replace(/<[^>]+>/g, '').trim();
          const clean = cleanMovieTitle(raw);
          if (clean && isLikelyMovieTitle(clean) && !movies.includes(clean)) {
            movies.push(clean);
          }
        });
      }
    }

    // C. Bold paragraph numbered items: <p><strong>1. Movie Title</strong>
    if (movies.length === 0) {
      const boldNumbered = [...html.matchAll(/<(?:strong|b)>(?:\s*(?:#?\d+[\.\:\)\-\s]+|No\.\s*\d+[\:\.\s]+))([^<]+)<\/(?:strong|b)>/gi)];
      if (boldNumbered.length >= 3) {
        boldNumbered.forEach(bp => {
          const clean = cleanMovieTitle(bp[1]);
          if (clean && isLikelyMovieTitle(clean) && !movies.includes(clean)) {
            movies.push(clean);
          }
        });
      }
    }

    // D. Ordered lists: <ol><li>Movie Title</li></ol>
    if (movies.length === 0) {
      const ols = [...html.matchAll(/<ol[^>]*>([\s\S]*?)<\/ol>/gi)];
      for (const ol of ols) {
        const lis = [...ol[1].matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)];
        if (lis.length >= 3) {
          lis.forEach(li => {
            const raw = li[1].replace(/<[^>]+>/g, '').trim().split(/[:\-\–\—\n]/)[0];
            const clean = cleanMovieTitle(raw);
            if (clean && isLikelyMovieTitle(clean) && !movies.includes(clean)) {
              movies.push(clean);
            }
          });
        }
      }
    }

    // E. General H2/H3 headings list if multiple and clean
    if (movies.length === 0) {
      const allHeadings = [...html.matchAll(/<h[23][^>]*>([\s\S]*?)<\/h[23]>/gi)];
      const candidates = allHeadings
        .map(h => cleanMovieTitle(h[1].replace(/<[^>]+>/g, '')))
        .filter(t => t && isLikelyMovieTitle(t));
      
      if (candidates.length >= 3 && candidates.length <= 150) {
        candidates.forEach(t => {
          if (!movies.includes(t)) movies.push(t);
        });
      }
    }

    // F. Fallback single movie title from page metadata
    if (movies.length === 0) {
      const ogTitle = html.match(/<meta[^>]+property="og:title"[^>]+content="([^"]+)"/i) ||
                      html.match(/<meta[^>]+content="([^"]+)"[^>]+property="og:title"/i);
      if (ogTitle) {
        const raw = ogTitle[1].split('|')[0].split('-')[0].split('•')[0].trim();
        const clean = cleanMovieTitle(raw);
        if (clean) movies.push(clean);
      }
    }
  }

  return movies;
}

// Helper to clean movie titles from listicles
export function cleanMovieTitle(str) {
  if (!str) return '';
  return decodeHtmlEntities(str)
    .replace(/^[#\d]+[\.\:\)\-\s]+/, '') // Remove leading numbers e.g. "1. " or "10: " or "#1 "
    .replace(/^No\.\s*\d+[\.\:\)\-\s]+/i, '') // Remove "No. 1 "
    .replace(/\s*\(\d{4}\).*$/, '') // Remove year e.g. " (2019)"
    .replace(/^["'“‘]+|["'”’]+$/g, '') // Remove quotes
    .replace(/^(Watch|Stream|Movie|Film)\s*:\s*/i, '')
    .trim();
}

const JUNK_STOPWORDS = [
  'contents', 'references', 'external links', 'see also', 'bibliography',
  'notes', 'further reading', 'gallery', 'cast', 'plot', 'reception',
  'box office', 'awards', 'soundtrack', 'home media', 'production',
  'release', 'synopsis', 'navigation menu', 'main page', 'about wikipedia',
  'contact us', 'donate', 'help', 'read next', 'related stories',
  'share this', 'newsletter', 'subscribe', 'advertisement', 'comments',
  'leave a reply', 'trending now', 'editors pick', 'table of contents',
  'privacy policy', 'terms of service', 'terms of use', 'overview',
  'disclaimer', 'author', 'cookie policy'
];

export function isLikelyMovieTitle(str) {
  if (!str || str.length < 2 || str.length > 70) return false;
  const lower = str.toLowerCase();
  if (JUNK_STOPWORDS.some(j => lower === j || lower.includes(j))) return false;
  if (/^[\d\W]+$/.test(str)) return false;
  return true;
}

// High-level scraper entrypoint
export async function scrapeMovieUrl(targetUrl) {
  const html = await fetchWebpageHtml(targetUrl);
  const listTitle = extractListTitle(html, targetUrl);
  const titles = parseMoviesFromHtml(html, targetUrl);

  const isList = titles.length > 1;

  // Infer default streaming and genre
  let streaming = 'Netflix';
  const lowerUrl = targetUrl.toLowerCase();
  const lowerTitle = listTitle.toLowerCase();

  if (lowerUrl.includes('letterboxd.com')) streaming = 'Letterboxd / Streaming';
  else if (lowerUrl.includes('imdb.com')) streaming = 'IMDb / Cinema';
  else if (lowerUrl.includes('disney')) streaming = 'Disney+';
  else if (lowerUrl.includes('prime')) streaming = 'Prime Video';
  else if (lowerUrl.includes('hbo')) streaming = 'HBO GO';

  let defaultGenre = 'Romance';
  if (lowerUrl.includes('filipino') || lowerUrl.includes('pinoy') || lowerTitle.includes('filipino') || lowerTitle.includes('pinoy')) {
    defaultGenre = 'Filipino Cinema';
  } else if (lowerTitle.includes('horror') || lowerTitle.includes('scary')) {
    defaultGenre = 'Horror';
  } else if (lowerTitle.includes('animation') || lowerTitle.includes('animated') || lowerTitle.includes('anime')) {
    defaultGenre = 'Animation';
  } else if (lowerTitle.includes('comedy')) {
    defaultGenre = 'Comedy';
  } else if (lowerTitle.includes('k-drama') || lowerTitle.includes('korean')) {
    defaultGenre = 'K-Drama';
  }

  return {
    isList,
    listTitle,
    titles,
    defaultGenre,
    defaultStreaming: streaming
  };
}
