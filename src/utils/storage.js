import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { DEFAULT_MOVIES } from '../data/defaultMovies';
import { DEFAULT_FOOD_SPOTS } from '../data/defaultFoodSpots';

const KEYS = {
  MOVIES: 'lablab_movies_v1',
  FOOD_SPOTS: 'lablab_food_spots_v1',
  EXPENSES: 'lablab_expenses_v1',
  MEMORIES: 'lablab_memories_v1',
  GATEKEEPER: 'lablab_verified_nekol_v1',
  BUDGET: 'lablab_budget_targets_v1',
  COUPLE_STATUS: 'lablab_couple_status_v1',
  COUPONS: 'lablab_coupons_v1',
  GENRES: 'lablab_movie_genres_v1'
};

// Listeners for reactive updates
const listeners = new Set();
export function subscribeStorage(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}
export function notify() {
  listeners.forEach(cb => {
    try { cb(); } catch (e) { console.error(e); }
  });
}

// Love Ping Real-time broadcast listeners
const lovePingListeners = new Set();
export function subscribeLovePings(callback) {
  lovePingListeners.add(callback);
  return () => lovePingListeners.delete(callback);
}
export function notifyLovePing(pingData) {
  lovePingListeners.forEach(cb => {
    try { cb(pingData); } catch (e) { console.error(e); }
  });
}

// Global Real-time Channel
let syncChannel = null;
if (isSupabaseConfigured && supabase) {
  try {
    syncChannel = supabase.channel('lablab_realtime_sync');
    
    syncChannel
      .on(
        'postgres_changes',
        { event: '*', schema: 'public' },
        async (payload) => {
          const { table } = payload;
          try {
            if (table === 'lablab_movies') await getMovies();
            else if (table === 'lablab_food_spots') await getFoodSpots();
            else if (table === 'lablab_expenses') await getExpenses();
            else if (table === 'lablab_memories') await getMemories();
            else if (table === 'lablab_budget') await getBudgetTargets();
            else if (table === 'lablab_couple_status') await getCoupleStatus();
            else if (table === 'lablab_coupons') await getCoupons();
          } catch {}
          notify();
        }
      )
      .on('broadcast', { event: 'love_ping' }, (payload) => {
        if (payload?.payload) {
          notifyLovePing(payload.payload);
        }
      })
      .subscribe();
  } catch (err) {
    console.warn('Supabase Realtime setup notice:', err);
  }
}

// ----------------- Gatekeeper Status -----------------
export function isUserVerified() {
  try {
    return localStorage.getItem(KEYS.GATEKEEPER) === 'true';
  } catch {
    return false;
  }
}

export function setUserVerified(status) {
  try {
    localStorage.setItem(KEYS.GATEKEEPER, status ? 'true' : 'false');
    notify();
  } catch (e) {
    console.error(e);
  }
}

// ----------------- Movies -----------------
export async function getMovies() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('lablab_movies').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        const validData = data.filter(m => !/^https?:\/\//i.test(m.title?.trim() || ''));
        localStorage.setItem(KEYS.MOVIES, JSON.stringify(validData));
        return validData;
      }
    } catch (e) {
      console.warn('Supabase fetch failed, falling back to local storage:', e);
    }
  }

  try {
    const raw = localStorage.getItem(KEYS.MOVIES);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Clean up any accidental URL-titled movies from previous bug
      const cleaned = parsed.filter(m => !/^https?:\/\//i.test(m.title?.trim() || ''));
      if (cleaned.length !== parsed.length) {
        localStorage.setItem(KEYS.MOVIES, JSON.stringify(cleaned));
      }
      return cleaned;
    }
  } catch (e) {
    console.error(e);
  }

  // First time initialization
  localStorage.setItem(KEYS.MOVIES, JSON.stringify(DEFAULT_MOVIES));
  return DEFAULT_MOVIES;
}

export async function saveMovie(movie) {
  const current = await getMovies();
  const index = current.findIndex(m => m.id === movie.id);
  let updated;
  if (index >= 0) {
    updated = [...current];
    updated[index] = movie;
  } else {
    updated = [movie, ...current];
  }
  localStorage.setItem(KEYS.MOVIES, JSON.stringify(updated));
  notify();

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('lablab_movies').upsert(movie);
    } catch (e) {
      console.warn('Supabase movie upsert failed:', e);
    }
  }
  return updated;
}

export async function saveMoviesBatch(newMovies) {
  if (!newMovies || newMovies.length === 0) return [];
  const current = await getMovies();
  const existingTitles = new Set(current.map(m => m.title.trim().toLowerCase()));

  const toAdd = [];
  for (const m of newMovies) {
    if (!existingTitles.has(m.title.trim().toLowerCase())) {
      toAdd.push(m);
      existingTitles.add(m.title.trim().toLowerCase());
    }
  }

  if (toAdd.length === 0) return current;

  const updated = [...toAdd, ...current];
  localStorage.setItem(KEYS.MOVIES, JSON.stringify(updated));
  notify();

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('lablab_movies').upsert(toAdd);
    } catch (e) {
      console.warn('Supabase batch movie upsert failed:', e);
    }
  }
  return updated;
}

export async function deleteMovie(id) {
  const current = await getMovies();
  const updated = current.filter(m => m.id !== id);
  localStorage.setItem(KEYS.MOVIES, JSON.stringify(updated));
  notify();

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('lablab_movies').delete().eq('id', id);
    } catch (e) {
      console.warn(e);
    }
  }
  return updated;
}

// ----------------- Dynamic Movie Genres -----------------
export const BASE_MOVIE_GENRES = [
  'All Genres',
  'Filipino Cinema',
  'Pinoy Rom-Com',
  'Romance',
  'Animation',
  'Horror',
  'K-Drama',
  'Comedy'
];

export function getMovieGenres() {
  let custom = [];
  try {
    const raw = localStorage.getItem(KEYS.GENRES);
    if (raw) custom = JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }

  // Also include any genres present in current catalog movies
  let movieGenres = [];
  try {
    const rawMovies = localStorage.getItem(KEYS.MOVIES);
    if (rawMovies) {
      const parsed = JSON.parse(rawMovies);
      movieGenres = parsed.map(m => m.genre).filter(Boolean);
    }
  } catch {}

  const merged = Array.from(new Set([...BASE_MOVIE_GENRES, ...custom, ...movieGenres]));
  return merged;
}

export function addCustomGenre(genreName) {
  if (!genreName || typeof genreName !== 'string') return;
  const clean = genreName.trim();
  if (!clean || clean.toLowerCase() === 'all genres') return;

  const current = getMovieGenres();
  const exists = current.some(g => g.toLowerCase() === clean.toLowerCase());
  if (!exists) {
    let custom = [];
    try {
      const raw = localStorage.getItem(KEYS.GENRES);
      if (raw) custom = JSON.parse(raw);
    } catch {}

    const formatted = clean.charAt(0).toUpperCase() + clean.slice(1);
    const updated = Array.from(new Set([...custom, formatted]));
    localStorage.setItem(KEYS.GENRES, JSON.stringify(updated));
    notify();
    return formatted;
  }
  return current.find(g => g.toLowerCase() === clean.toLowerCase()) || clean;
}

/**
 * Auto-categorize a movie based on TMDB details and app catalog genres.
 * Dynamically creates and registers new genres if not already in catalog!
 */
export function autoCategorizeMovie(tmdbDetails) {
  if (!tmdbDetails) return { primaryGenre: 'Romance', allGenres: ['Romance'] };

  const { is_filipino, is_korean, genre_names = [], genres = [] } = tmdbDetails;
  const rawNames = (genre_names.length > 0 ? genre_names : genres.map(g => g.name || g)).filter(Boolean);

  // 1. Filipino Cinema handling
  if (is_filipino) {
    const hasRomCom = rawNames.some(g => 
      ['Romance', 'Comedy', 'Drama'].includes(g)
    );
    if (hasRomCom) {
      return { 
        primaryGenre: 'Pinoy Rom-Com', 
        allGenres: Array.from(new Set(['Pinoy Rom-Com', 'Filipino Cinema', ...rawNames])) 
      };
    }
    return { 
      primaryGenre: 'Filipino Cinema', 
      allGenres: Array.from(new Set(['Filipino Cinema', ...rawNames])) 
    };
  }

  // 2. Korean handling
  if (is_korean) {
    return { 
      primaryGenre: 'K-Drama', 
      allGenres: Array.from(new Set(['K-Drama', ...rawNames])) 
    };
  }

  // 3. Match against existing genres or dynamically create new ones
  const currentGenres = getMovieGenres();
  const existingMap = new Map(currentGenres.map(g => [g.toLowerCase(), g]));

  const aliasMap = {
    'science fiction': 'Sci-Fi',
    'sci-fi': 'Sci-Fi',
    'action': 'Action',
    'thriller': 'Thriller',
    'adventure': 'Adventure',
    'fantasy': 'Fantasy',
    'mystery': 'Mystery',
    'crime': 'Crime',
    'documentary': 'Documentary',
    'family': 'Family',
    'music': 'Music',
    'history': 'History',
    'war': 'War',
    'western': 'Western',
    'romance': 'Romance',
    'comedy': 'Comedy',
    'animation': 'Animation',
    'horror': 'Horror'
  };

  let primaryGenre = null;
  const processedGenres = [];

  for (const rawName of rawNames) {
    const lower = rawName.toLowerCase();
    const mappedTarget = aliasMap[lower] || rawName;

    const existing = existingMap.get(mappedTarget.toLowerCase()) || existingMap.get(lower);
    if (existing) {
      if (!primaryGenre) primaryGenre = existing;
      processedGenres.push(existing);
    } else {
      // Dynamically create and persist the new genre!
      const created = addCustomGenre(mappedTarget);
      if (created) {
        if (!primaryGenre) primaryGenre = created;
        processedGenres.push(created);
      }
    }
  }

  if (!primaryGenre) {
    primaryGenre = rawNames[0] ? (addCustomGenre(rawNames[0]) || 'Romance') : 'Romance';
  }

  return {
    primaryGenre: primaryGenre || 'Romance',
    allGenres: Array.from(new Set([primaryGenre, ...processedGenres]))
  };
}

// ----------------- Food Spots -----------------
export async function getFoodSpots() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('lablab_food_spots').select('*').order('rating', { ascending: false });
      if (!error && data && data.length > 0) {
        localStorage.setItem(KEYS.FOOD_SPOTS, JSON.stringify(data));
        return data;
      }
    } catch (e) {
      console.warn(e);
    }
  }

  try {
    const raw = localStorage.getItem(KEYS.FOOD_SPOTS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }

  localStorage.setItem(KEYS.FOOD_SPOTS, JSON.stringify(DEFAULT_FOOD_SPOTS));
  return DEFAULT_FOOD_SPOTS;
}

export async function saveFoodSpot(spot) {
  const current = await getFoodSpots();
  const updated = [spot, ...current];
  localStorage.setItem(KEYS.FOOD_SPOTS, JSON.stringify(updated));
  notify();

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('lablab_food_spots').upsert(spot);
    } catch (e) {
      console.warn(e);
    }
  }
  return updated;
}

export async function saveFoodSpotsBatch(newSpots) {
  if (!newSpots || newSpots.length === 0) return [];
  const current = await getFoodSpots();
  const existingNames = new Set(current.map(s => s.name.trim().toLowerCase()));

  const toAdd = [];
  for (const s of newSpots) {
    if (!existingNames.has(s.name.trim().toLowerCase())) {
      toAdd.push(s);
      existingNames.add(s.name.trim().toLowerCase());
    }
  }

  if (toAdd.length === 0) return current;

  const updated = [...toAdd, ...current];
  localStorage.setItem(KEYS.FOOD_SPOTS, JSON.stringify(updated));
  notify();

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('lablab_food_spots').upsert(toAdd);
    } catch (e) {
      console.warn('Supabase batch food spots upsert failed:', e);
    }
  }
  return updated;
}

// ----------------- Expenses -----------------
export async function getExpenses() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('lablab_expenses').select('*').order('date', { ascending: false });
      if (!error && data) {
        localStorage.setItem(KEYS.EXPENSES, JSON.stringify(data));
        return data;
      }
    } catch (e) {
      console.warn(e);
    }
  }

  try {
    const raw = localStorage.getItem(KEYS.EXPENSES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }

  // Pre-seed some cute couple sample expenses
  const initial = [
    {
      id: 'exp-1',
      title: 'Mendokoro Date Night',
      amount: 1100,
      category: 'Food Trip',
      paid_by: 'Migz 🐧',
      date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
      notes: 'Super sarap ng chashu! Nekol enjoyed the broth so much 🥰'
    },
    {
      id: 'exp-2',
      title: 'Tiger Sugar Milk Tea Treat',
      amount: 320,
      category: 'Boba & Coffee',
      paid_by: 'Nekol 🎀',
      date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      notes: 'Libre ni bebe girl to keep us awake while studying! 🧋'
    },
    {
      id: 'exp-3',
      title: 'Cinema Tickets + Popcorn',
      amount: 880,
      category: 'Cinema',
      paid_by: '50 / 50 ⚖️',
      date: new Date().toISOString().split('T')[0],
      notes: 'Spider-verse movie date with extra butter popcorn!'
    }
  ];
  localStorage.setItem(KEYS.EXPENSES, JSON.stringify(initial));
  return initial;
}

// ----------------- Budget Targets -----------------
export async function getBudgetTargets() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('lablab_budget').select('*').eq('id', 'main-budget').maybeSingle();
      if (!error && data) {
        const targets = {
          monthly: Number(data.monthly) || 10000,
          weekly: Number(data.weekly) || 2500,
          daily: Number(data.daily) || 500
        };
        localStorage.setItem(KEYS.BUDGET, JSON.stringify(targets));
        return targets;
      }
    } catch (e) {
      console.warn('Supabase budget fetch notice:', e);
    }
  }

  try {
    const raw = localStorage.getItem(KEYS.BUDGET);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  const defaultTargets = {
    monthly: 10000,
    weekly: 2500,
    daily: 500
  };
  localStorage.setItem(KEYS.BUDGET, JSON.stringify(defaultTargets));
  return defaultTargets;
}

export async function saveBudgetTargets(targets) {
  try {
    localStorage.setItem(KEYS.BUDGET, JSON.stringify(targets));
    notify();
  } catch (e) {
    console.error(e);
  }

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('lablab_budget').upsert({
        id: 'main-budget',
        monthly: targets.monthly,
        weekly: targets.weekly,
        daily: targets.daily,
        updated_at: new Date().toISOString()
      });
    } catch (e) {
      console.warn('Supabase budget save notice:', e);
    }
  }
}

export async function saveExpense(expense) {
  const current = await getExpenses();
  const updated = [expense, ...current];
  localStorage.setItem(KEYS.EXPENSES, JSON.stringify(updated));
  notify();

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('lablab_expenses').insert(expense);
    } catch (e) {
      console.warn(e);
    }
  }
  return updated;
}

export async function deleteExpense(id) {
  const current = await getExpenses();
  const updated = current.filter(e => e.id !== id);
  localStorage.setItem(KEYS.EXPENSES, JSON.stringify(updated));
  notify();

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('lablab_expenses').delete().eq('id', id);
    } catch (e) {
      console.warn(e);
    }
  }
  return updated;
}

// ----------------- Calendar Memories -----------------
export async function getMemories() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('lablab_memories').select('*').order('date', { ascending: false });
      if (!error && data) {
        localStorage.setItem(KEYS.MEMORIES, JSON.stringify(data));
        return data;
      }
    } catch (e) {
      console.warn(e);
    }
  }

  try {
    const raw = localStorage.getItem(KEYS.MEMORIES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }

  // Pre-seed a cute sample memory
  const initial = [
    {
      id: 'mem-1',
      date: new Date().toISOString().split('T')[0],
      title: 'First day using our Lablab App 💕',
      notes: 'We officially started our couple app! Dedicated to my sweetest girl Nekol. Many more memories and dates to come! 🥰🐧😈',
      mood: 'Super In Love 🥰',
      photo_url: ''
    }
  ];
  localStorage.setItem(KEYS.MEMORIES, JSON.stringify(initial));
  return initial;
}

export async function saveMemory(memory) {
  const current = await getMemories();
  const index = current.findIndex(m => m.id === memory.id);
  let updated;
  if (index >= 0) {
    updated = [...current];
    updated[index] = memory;
  } else {
    updated = [memory, ...current];
  }
  localStorage.setItem(KEYS.MEMORIES, JSON.stringify(updated));
  notify();

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('lablab_memories').upsert(memory);
    } catch (e) {
      console.warn(e);
    }
  }
  return updated;
}

export async function deleteMemory(id) {
  const current = await getMemories();
  const updated = current.filter(m => m.id !== id);
  localStorage.setItem(KEYS.MEMORIES, JSON.stringify(updated));
  notify();

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('lablab_memories').delete().eq('id', id);
    } catch (e) {
      console.warn(e);
    }
  }
  return updated;
}

// ----------------- Reactions for Movies & Food -----------------
export async function toggleMovieReaction(movieId, profile, emoji) {
  const current = await getMovies();
  const index = current.findIndex(m => m.id === movieId);
  if (index < 0) return null;

  const movie = { ...current[index] };
  const reactions = { ...(movie.reactions || {}) };
  if (reactions[profile] === emoji) {
    delete reactions[profile];
  } else {
    reactions[profile] = emoji;
  }
  movie.reactions = reactions;
  await saveMovie(movie);
  return movie;
}

export async function toggleFoodReaction(spotId, profile, emoji) {
  const current = await getFoodSpots();
  const index = current.findIndex(s => s.id === spotId);
  if (index < 0) return null;

  const spot = { ...current[index] };
  const reactions = { ...(spot.reactions || {}) };
  if (reactions[profile] === emoji) {
    delete reactions[profile];
  } else {
    reactions[profile] = emoji;
  }
  spot.reactions = reactions;
  await saveFoodSpot(spot);
  return spot;
}

// ----------------- Real-Time Love Pings -----------------
export async function sendLovePing(from, text = 'Thinking of you right now! 💕') {
  const ping = {
    id: `ping-${Date.now()}`,
    from,
    text,
    timestamp: new Date().toISOString()
  };

  // Local notify immediately
  notifyLovePing(ping);

  if (isSupabaseConfigured && supabase && syncChannel) {
    try {
      await syncChannel.send({
        type: 'broadcast',
        event: 'love_ping',
        payload: ping
      });
    } catch (e) {
      console.warn('Love ping broadcast notice:', e);
    }
  }
  return ping;
}

// ----------------- Couple Status & Moods -----------------
const DEFAULT_COUPLE_STATUS = {
  migz: {
    id: 'migz',
    partner_name: 'Migz',
    mood: 'Craving Ramen 🍜',
    custom_status: 'Missing my bebe Nekol! 💕',
    battery_level: 100,
    updated_at: new Date().toISOString()
  },
  nekol: {
    id: 'nekol',
    partner_name: 'Nekol',
    mood: 'Craving Boba 🧋',
    custom_status: 'Thinking of Migz 🖤',
    battery_level: 100,
    updated_at: new Date().toISOString()
  }
};

export async function getCoupleStatus() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('lablab_couple_status').select('*');
      if (!error && data && data.length > 0) {
        const mapped = { ...DEFAULT_COUPLE_STATUS };
        data.forEach(item => {
          mapped[item.id.toLowerCase()] = item;
        });
        localStorage.setItem(KEYS.COUPLE_STATUS, JSON.stringify(mapped));
        return mapped;
      }
    } catch (e) {
      console.warn('Supabase status fetch notice:', e);
    }
  }

  try {
    const raw = localStorage.getItem(KEYS.COUPLE_STATUS);
    if (raw) return { ...DEFAULT_COUPLE_STATUS, ...JSON.parse(raw) };
  } catch {}

  return DEFAULT_COUPLE_STATUS;
}

export async function saveCoupleStatus(profile, updates) {
  const key = profile.toLowerCase();
  const current = await getCoupleStatus();
  const updatedItem = {
    ...(current[key] || DEFAULT_COUPLE_STATUS[key]),
    ...updates,
    id: key,
    partner_name: profile,
    updated_at: new Date().toISOString()
  };

  const updatedAll = {
    ...current,
    [key]: updatedItem
  };

  try {
    localStorage.setItem(KEYS.COUPLE_STATUS, JSON.stringify(updatedAll));
    notify();
  } catch (e) {
    console.error(e);
  }

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('lablab_couple_status').upsert(updatedItem);
    } catch (e) {
      console.warn('Supabase status save notice:', e);
    }
  }

  return updatedAll;
}

// ----------------- Love Coupons & Wishlist Jar -----------------
export const DEFAULT_COUPONS = [
  {
    id: 'coup-1',
    title: '1 Free Full-Body / Back Massage 💆',
    category: 'Relaxation 💆',
    emoji: '💆',
    for_user: 'Both',
    is_redeemed: false,
    redeemed_by: null,
    redeemed_at: null,
    created_at: new Date().toISOString()
  },
  {
    id: 'coup-2',
    title: 'Nekol Picks Dinner (Migz Pays, Zero Reklamo!) 🍽️',
    category: 'Food Trip 🍽️',
    emoji: '🍽️',
    for_user: 'Nekol',
    is_redeemed: false,
    redeemed_by: null,
    redeemed_at: null,
    created_at: new Date().toISOString()
  },
  {
    id: 'coup-3',
    title: 'Late Night McDo / Ice Cream Drive-Thru Run 🍦',
    category: 'Midnight Craving 🍦',
    emoji: '🍦',
    for_user: 'Both',
    is_redeemed: false,
    redeemed_by: null,
    redeemed_at: null,
    created_at: new Date().toISOString()
  },
  {
    id: 'coup-4',
    title: 'Movie Night Veto Pass (Can Change Movie Anytime) 🎬',
    category: 'Entertainment 🎬',
    emoji: '🎬',
    for_user: 'Both',
    is_redeemed: false,
    redeemed_by: null,
    redeemed_at: null,
    created_at: new Date().toISOString()
  },
  {
    id: 'coup-5',
    title: 'Migz Does All the Dishes & Kitchen Chores Today 🧹',
    category: 'House Helper 🧹',
    emoji: '🧹',
    for_user: 'Nekol',
    is_redeemed: false,
    redeemed_by: null,
    redeemed_at: null,
    created_at: new Date().toISOString()
  },
  {
    id: 'coup-6',
    title: 'Breakfast in Bed with Favorite Boba / Coffee 🧋',
    category: 'Sweet Morning ☕',
    emoji: '☕',
    for_user: 'Both',
    is_redeemed: false,
    redeemed_by: null,
    redeemed_at: null,
    created_at: new Date().toISOString()
  }
];

export async function getCoupons() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('lablab_coupons').select('*').order('created_at', { ascending: true });
      if (!error && data && data.length > 0) {
        localStorage.setItem(KEYS.COUPONS, JSON.stringify(data));
        return data;
      }
    } catch (e) {
      console.warn('Supabase coupons fetch notice:', e);
    }
  }

  try {
    const raw = localStorage.getItem(KEYS.COUPONS);
    if (raw) return JSON.parse(raw);
  } catch {}

  localStorage.setItem(KEYS.COUPONS, JSON.stringify(DEFAULT_COUPONS));
  return DEFAULT_COUPONS;
}

export async function saveCoupon(coupon) {
  const current = await getCoupons();
  const index = current.findIndex(c => c.id === coupon.id);
  let updated;
  if (index >= 0) {
    updated = [...current];
    updated[index] = coupon;
  } else {
    updated = [coupon, ...current];
  }

  localStorage.setItem(KEYS.COUPONS, JSON.stringify(updated));
  notify();

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('lablab_coupons').upsert(coupon);
    } catch (e) {
      console.warn('Supabase coupon save notice:', e);
    }
  }

  return updated;
}

export async function redeemCoupon(couponId, redeemedBy) {
  const current = await getCoupons();
  const index = current.findIndex(c => c.id === couponId);
  if (index < 0) return current;

  const updatedCoupon = {
    ...current[index],
    is_redeemed: true,
    redeemed_by: redeemedBy,
    redeemed_at: new Date().toISOString()
  };

  const updated = [...current];
  updated[index] = updatedCoupon;

  localStorage.setItem(KEYS.COUPONS, JSON.stringify(updated));
  notify();

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('lablab_coupons').upsert(updatedCoupon);
    } catch (e) {
      console.warn('Supabase coupon redeem notice:', e);
    }
  }

  return updated;
}

