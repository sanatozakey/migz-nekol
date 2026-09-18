import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { DEFAULT_MOVIES } from '../data/defaultMovies';
import { DEFAULT_FOOD_SPOTS } from '../data/defaultFoodSpots';

const KEYS = {
  MOVIES: 'lablab_movies_v1',
  FOOD_SPOTS: 'lablab_food_spots_v1',
  EXPENSES: 'lablab_expenses_v1',
  MEMORIES: 'lablab_memories_v1',
  GATEKEEPER: 'lablab_verified_nekol_v1',
  BUDGET: 'lablab_budget_targets_v1'
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

// Real-time synchronization: listen for database changes from either partner's phone
if (isSupabaseConfigured && supabase) {
  try {
    supabase
      .channel('lablab_realtime_sync')
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
          } catch {}
          notify();
        }
      )
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
