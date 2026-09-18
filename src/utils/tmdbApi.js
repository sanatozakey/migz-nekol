// TMDB (The Movie Database) API Client with Filipino Cinema & Offline Fallback Support

export const DEFAULT_TMDB_API_KEY = '4601e7f997a753ac13fdbda9bcb0a218';
export const TMDB_IMAGE_BASE_W92 = 'https://image.tmdb.org/t/p/w92';
export const TMDB_IMAGE_BASE_W185 = 'https://image.tmdb.org/t/p/w185';
export const TMDB_IMAGE_BASE_W500 = 'https://image.tmdb.org/t/p/w500';
export const TMDB_IMAGE_BASE_W780 = 'https://image.tmdb.org/t/p/w780';

export const TMDB_GENRE_MAP = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Sci-Fi',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western'
};

export function getTmdbApiKey() {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('lablab_tmdb_key');
    if (saved && saved.trim()) return saved.trim();
  }
  return import.meta.env?.VITE_TMDB_API_KEY || DEFAULT_TMDB_API_KEY;
}

export function formatRuntime(minutes) {
  if (!minutes || minutes <= 0) return '2h';
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`;
  if (hrs > 0) return `${hrs}h`;
  return `${mins}m`;
}

// Curated Top Filipino & Romantic Cinema fallback in case offline or API rate limits
export const FALLBACK_FILIPINO_MOVIES = [
  {
    id: 'fb-ph-1',
    title: 'Rewind',
    year: '2023',
    genre: 'Pinoy Rom-Com',
    genre_names: ['Drama', 'Romance', 'Fantasy'],
    duration: '1h 52m',
    rating: 5,
    is_filipino: true,
    streaming: 'Netflix',
    overview: 'John gets an extraordinary chance from Lods to travel back in time and save his wife Mary from a tragic car accident.',
    poster_url: 'https://image.tmdb.org/t/p/w500/z6xHn4m2vU2L9w7Z3jH8nO0uJqG.jpg'
  },
  {
    id: 'fb-ph-2',
    title: 'Hello, Love, Goodbye',
    year: '2019',
    genre: 'Pinoy Rom-Com',
    genre_names: ['Romance', 'Drama'],
    duration: '1h 58m',
    rating: 5,
    is_filipino: true,
    streaming: 'Netflix',
    overview: 'Joy, a domestic worker in Hong Kong, meets Ethan, a charming bartender who makes her question her plan to move to Canada.',
    poster_url: 'https://image.tmdb.org/t/p/w500/sJFouUfCgHFSUh5OKVSQBSfrfA1.jpg'
  },
  {
    id: 'fb-ph-3',
    title: 'Hello, Love, Again',
    year: '2024',
    genre: 'Pinoy Rom-Com',
    genre_names: ['Romance', 'Drama'],
    duration: '2h 2m',
    rating: 5,
    is_filipino: true,
    streaming: 'Cinema / Netflix',
    overview: 'Five years after Hong Kong, Joy and Ethan cross paths again in Canada, navigating their changed lives and lingering love.',
    poster_url: 'https://image.tmdb.org/t/p/w500/xWk8iFmJb2y7E5hL9nK0oM3uVqP.jpg'
  },
  {
    id: 'fb-ph-4',
    title: 'One More Chance',
    year: '2007',
    genre: 'Pinoy Rom-Com',
    genre_names: ['Romance', 'Drama'],
    duration: '1h 55m',
    rating: 5,
    is_filipino: true,
    streaming: 'Netflix',
    overview: 'Popoy and Basha have been a couple for years. When Basha asks for space to find herself, their hearts are tested to their limits.',
    poster_url: 'https://image.tmdb.org/t/p/w500/6yYwL5l4G1jGgH8fT2vVbM3uNqR.jpg'
  },
  {
    id: 'fb-ph-5',
    title: 'That Thing Called Tadhana',
    year: '2014',
    genre: 'Pinoy Rom-Com',
    genre_names: ['Romance', 'Comedy'],
    duration: '1h 51m',
    rating: 4.9,
    is_filipino: true,
    streaming: 'Netflix',
    overview: 'Mace and Anthony meet by chance at an airport and take an impromptu road trip to Baguio and Sagada to mend a broken heart.',
    poster_url: 'https://image.tmdb.org/t/p/w500/8kH2kL3pM9nB8vT5rG1jF7wK2mS.jpg'
  },
  {
    id: 'fb-ph-6',
    title: 'Seven Sundays',
    year: '2017',
    genre: 'Filipino Cinema',
    genre_names: ['Drama', 'Family', 'Comedy'],
    duration: '2h 8m',
    rating: 4.9,
    is_filipino: true,
    streaming: 'Netflix',
    overview: 'Four estranged siblings must spend their remaining Sundays together after learning their father has been diagnosed with a terminal illness.',
    poster_url: 'https://image.tmdb.org/t/p/w500/4gH1vN6jF9qL2bT8mY7rK5wP2mS.jpg'
  },
  {
    id: 'fb-ph-7',
    title: 'Kita Kita',
    year: '2017',
    genre: 'Pinoy Rom-Com',
    genre_names: ['Romance', 'Comedy'],
    duration: '1h 24m',
    rating: 4.8,
    is_filipino: true,
    streaming: 'Netflix',
    overview: 'A blind Filipino tour guide in Japan forms an unexpected, funny, and deeply touching bond with a persistent neighbor named Tonyo.',
    poster_url: 'https://image.tmdb.org/t/p/w500/9kL5pM2rV7nB8jT3mY1rK6wF2mS.jpg'
  },
  {
    id: 'fb-ph-8',
    title: 'Four Sisters and a Wedding',
    year: '2013',
    genre: 'Filipino Cinema',
    genre_names: ['Comedy', 'Family', 'Drama'],
    duration: '2h 10m',
    rating: 5,
    is_filipino: true,
    streaming: 'Netflix',
    overview: 'Four sisters reunite to sabotage their youngest brother CJ\'s upcoming wedding, confronting years of family secrets and sibling rivalries.',
    poster_url: 'https://image.tmdb.org/t/p/w500/3kL9mB2rV5nB8jT7mY1rK6wP2mS.jpg'
  },
  {
    id: 'fb-ph-9',
    title: 'Starting Over Again',
    year: '2014',
    genre: 'Pinoy Rom-Com',
    genre_names: ['Romance', 'Drama'],
    duration: '2h 11m',
    rating: 4.8,
    is_filipino: true,
    streaming: 'Netflix',
    overview: 'Ginny and Marco were once deeply in love until Ginny left without an explanation. Years later, fate tests whether second chances exist.',
    poster_url: 'https://image.tmdb.org/t/p/w500/7gL2mB5rV8nB9jT1mY3rK4wP2mS.jpg'
  },
  {
    id: 'fb-ph-10',
    title: 'Un/Happy For You',
    year: '2024',
    genre: 'Pinoy Rom-Com',
    genre_names: ['Romance', 'Comedy', 'Drama'],
    duration: '1h 50m',
    rating: 4.8,
    is_filipino: true,
    streaming: 'Netflix / Cinema',
    overview: 'Ex-lovers Juancho and Zy meet again as Zy prepares to marry someone else. Old flames and unanswered questions resurface.',
    poster_url: 'https://image.tmdb.org/t/p/w500/5kL8mB3rV2nB9jT6mY4rK7wP1mS.jpg'
  }
];

/**
 * Live search movies against TMDB API
 * @param {string} query Search text
 * @returns {Promise<Array>} List of movies with poster, year, genres, and Filipino tags
 */
export async function searchTmdbMovies(query) {
  const clean = (query || '').trim();
  if (!clean || clean.length < 2) return [];

  const apiKey = getTmdbApiKey();

  try {
    const url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(clean)}&include_adult=false&language=en-US&page=1`;
    const res = await fetch(url);

    if (!res.ok) {
      if (res.status === 429) {
        throw new Error('TMDB rate limit reached. Please wait a moment.');
      }
      if (res.status === 401) {
        throw new Error('Invalid TMDB API Key. Please check your credentials.');
      }
      throw new Error(`TMDB error (${res.status})`);
    }

    const data = await res.json();
    const rawResults = data.results || [];

    // Format & enrich search results
    const results = rawResults.map(m => {
      const year = m.release_date ? m.release_date.split('-')[0] : '';
      const isFilipino = 
        m.original_language === 'tl' || 
        m.original_language === 'fil' || 
        (m.origin_country && m.origin_country.includes('PH'));

      const isKorean = m.original_language === 'ko';
      const isJapanese = m.original_language === 'ja';

      const genreNames = (m.genre_ids || [])
        .map(id => TMDB_GENRE_MAP[id])
        .filter(Boolean);

      return {
        id: m.id,
        tmdb_id: m.id,
        title: m.title || m.original_title,
        original_title: m.original_title,
        year,
        release_date: m.release_date,
        poster_path: m.poster_path,
        poster_url: m.poster_path ? `${TMDB_IMAGE_BASE_W185}${m.poster_path}` : null,
        poster_thumb: m.poster_path ? `${TMDB_IMAGE_BASE_W92}${m.poster_path}` : null,
        backdrop_url: m.backdrop_path ? `${TMDB_IMAGE_BASE_W780}${m.backdrop_path}` : null,
        vote_average: m.vote_average,
        overview: m.overview,
        original_language: m.original_language,
        is_filipino: isFilipino,
        is_korean: isKorean,
        is_japanese: isJapanese,
        genre_ids: m.genre_ids || [],
        genre_names: genreNames
      };
    });

    // If query matches any Filipino keywords, sort Filipino movies to the top
    const lowerQ = clean.toLowerCase();
    const isPhSearch = lowerQ.includes('pinoy') || lowerQ.includes('filipino') || lowerQ.includes('tagalog');

    if (isPhSearch) {
      results.sort((a, b) => (b.is_filipino ? 1 : 0) - (a.is_filipino ? 1 : 0));
    }

    return results;
  } catch (err) {
    console.warn('TMDB search network issue, using curated fallback:', err);
    // Fallback: search local curated list
    const q = clean.toLowerCase();
    const matches = FALLBACK_FILIPINO_MOVIES.filter(m => 
      m.title.toLowerCase().includes(q) || 
      (m.genre && m.genre.toLowerCase().includes(q)) ||
      (m.overview && m.overview.toLowerCase().includes(q))
    );
    if (matches.length > 0) return matches;
    throw err;
  }
}

/**
 * Fetch full movie details from TMDB /movie/{id}
 * @param {number|string} movieId
 * @returns {Promise<Object>} Detailed movie info with official genres, runtime, streaming
 */
export async function getTmdbMovieDetails(movieId) {
  if (!movieId) throw new Error('Missing movie ID');

  // Check if it's a fallback ID
  if (typeof movieId === 'string' && movieId.startsWith('fb-')) {
    const found = FALLBACK_FILIPINO_MOVIES.find(m => m.id === movieId);
    if (found) {
      return {
        ...found,
        genres: found.genre_names.map(name => ({ id: 0, name })),
        runtime: 110,
        production_countries: [{ iso_3166_1: 'PH', name: 'Philippines' }]
      };
    }
  }

  const apiKey = getTmdbApiKey();
  const url = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&language=en-US&append_to_response=watch/providers,credits`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch movie details (${res.status})`);
  }

  const data = await res.json();
  const year = data.release_date ? data.release_date.split('-')[0] : '';
  const isFilipino = 
    data.original_language === 'tl' || 
    data.original_language === 'fil' || 
    (data.production_countries && data.production_countries.some(c => c.iso_3166_1 === 'PH'));

  const isKorean = data.original_language === 'ko';
  const isJapanese = data.original_language === 'ja';

  // Detect streaming providers (prioritize Philippines PH, fallback to US)
  let streaming = 'Netflix';
  try {
    const phProviders = data['watch/providers']?.results?.PH?.flatrate;
    const usProviders = data['watch/providers']?.results?.US?.flatrate;
    const providersList = phProviders || usProviders;
    if (providersList && providersList.length > 0) {
      streaming = providersList.map(p => p.provider_name).slice(0, 2).join(' / ');
    } else if (isFilipino) {
      streaming = 'Netflix / Cinema';
    }
  } catch {}

  // Extract director
  let director = '';
  try {
    const dirObj = data.credits?.crew?.find(c => c.job === 'Director');
    if (dirObj) director = dirObj.name;
  } catch {}

  // Extract top 3 cast members
  const topCast = (data.credits?.cast || []).slice(0, 3).map(c => c.name).join(', ');

  // Rating out of 5 stars
  const rating5 = data.vote_average ? Math.min(5, Math.max(1, Math.round((data.vote_average / 2) * 10) / 10)) : 5;

  return {
    id: data.id,
    tmdb_id: data.id,
    title: data.title || data.original_title,
    original_title: data.original_title,
    tagline: data.tagline || '',
    overview: data.overview || '',
    year,
    release_date: data.release_date,
    runtime: data.runtime || 0,
    duration: formatRuntime(data.runtime),
    rating: rating5,
    vote_average: data.vote_average,
    vote_count: data.vote_count,
    genres: data.genres || [],
    genre_names: (data.genres || []).map(g => g.name),
    poster_path: data.poster_path,
    poster_url: data.poster_path ? `${TMDB_IMAGE_BASE_W500}${data.poster_path}` : null,
    poster_thumb: data.poster_path ? `${TMDB_IMAGE_BASE_W185}${data.poster_path}` : null,
    backdrop_url: data.backdrop_path ? `${TMDB_IMAGE_BASE_W780}${data.backdrop_path}` : null,
    production_countries: data.production_countries || [],
    original_language: data.original_language,
    is_filipino: isFilipino,
    is_korean: isKorean,
    is_japanese: isJapanese,
    streaming,
    director,
    top_cast: topCast
  };
}
