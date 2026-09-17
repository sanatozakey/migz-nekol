// Smart parsing & analysis engine for Food Spots and Movies

// Known popular Metro Manila restaurant branches database
const KNOWN_RESTAURANTS = [
  {
    name: 'Mendokoro Ramenba',
    cuisine: 'Japanese Ramen',
    budget: '$$',
    gutom_level: 'medium',
    pagod_level: 'medium',
    top_dish: 'Super Chashu Ramen & Gyoza',
    branches: [
      { area: 'BGC, Taguig', lat: 14.5510, lng: 121.0503 },
      { area: 'Salcedo Village, Makati', lat: 14.5583, lng: 121.0232 },
      { area: 'Alabang, Muntinlupa', lat: 14.4258, lng: 121.0315 },
      { area: 'Capitol Commons, Pasig', lat: 14.5772, lng: 121.0625 }
    ]
  },
  {
    name: 'Wildflour Restaurant & Bakery',
    cuisine: 'Brunch & Artisan Bakery',
    budget: '$$$',
    gutom_level: 'medium',
    pagod_level: 'medium',
    top_dish: 'Kimchi Fried Rice & Cronuts',
    branches: [
      { area: 'Bonifacio High Street, BGC', lat: 14.5508, lng: 121.0494 },
      { area: 'Salcedo Village, Makati', lat: 14.5601, lng: 121.0245 },
      { area: 'Greenhills, San Juan', lat: 14.6019, lng: 121.0507 },
      { area: 'Podium, Ortigas', lat: 14.5855, lng: 121.0594 }
    ]
  },
  {
    name: 'Marugame Udon',
    cuisine: 'Japanese Udon & Tempura',
    budget: '$',
    gutom_level: 'medium',
    pagod_level: 'lazy',
    top_dish: 'Beef Yaki Udon & Jumbo Ebi Tempura',
    branches: [
      { area: 'SM Megamall, Mandaluyong', lat: 14.5842, lng: 121.0568 },
      { area: 'High Street, BGC', lat: 14.5517, lng: 121.0489 },
      { area: 'Trinoma, Quezon City', lat: 14.6534, lng: 121.0332 },
      { area: 'Glorietta 4, Makati', lat: 14.5515, lng: 121.0255 },
      { area: 'UP Town Center, QC', lat: 14.6508, lng: 121.0747 }
    ]
  },
  {
    name: 'Tablo Kitchen x Cafe',
    cuisine: 'Modern Bistro & Comfort Food',
    budget: '$$',
    gutom_level: 'heavy',
    pagod_level: 'adventure',
    top_dish: 'Creamy Truffle Pasta & Steak Skillet',
    branches: [
      { area: 'Scout Borromeo, Quezon City', lat: 14.6366, lng: 121.0355 },
      { area: 'BF Homes, Parañaque', lat: 14.4532, lng: 121.0189 },
      { area: 'Timog Ave, Quezon City', lat: 14.6358, lng: 121.0382 }
    ]
  },
  {
    name: 'Cafe Mary Grace',
    cuisine: 'Filipino Comfort & Bakery',
    budget: '$$',
    gutom_level: 'light',
    pagod_level: 'lazy',
    top_dish: 'Hot Chocolate & Cheese Roll',
    branches: [
      { area: 'Greenbelt 2, Makati', lat: 14.5532, lng: 121.0210 },
      { area: 'Serendra, BGC', lat: 14.5519, lng: 121.0531 },
      { area: 'Trinoma, Quezon City', lat: 14.6528, lng: 121.0337 },
      { area: 'Robinsons Magnolia, QC', lat: 14.6152, lng: 121.0341 }
    ]
  },
  {
    name: 'Frankie\'s New York Buffalo Wings',
    cuisine: 'American Wings & Comfort Food',
    budget: '$$',
    gutom_level: 'heavy',
    pagod_level: 'lazy',
    top_dish: 'Salted Egg Wings & Garlic Parmesan',
    branches: [
      { area: 'Kapitolyo, Pasig', lat: 14.5760, lng: 121.0601 },
      { area: 'BGC Crossroads, Taguig', lat: 14.5534, lng: 121.0475 },
      { area: 'SM North EDSA, QC', lat: 14.6565, lng: 121.0298 },
      { area: 'UP Town Center, QC', lat: 14.6515, lng: 121.0740 }
    ]
  },
  {
    name: 'Gino\'s Brick Oven Pizza',
    cuisine: 'Neapolitan Pizza & Pasta',
    budget: '$$',
    gutom_level: 'medium',
    pagod_level: 'medium',
    top_dish: 'SMEGG Pizza & Fresh Burrata with Spicy Honey',
    branches: [
      { area: 'Salcedo Village, Makati', lat: 14.5595, lng: 121.0240 },
      { area: 'Katipunan, Quezon City', lat: 14.6402, lng: 121.0755 },
      { area: 'BGC, Taguig', lat: 14.5522, lng: 121.0480 }
    ]
  }
];

// Calculate Haversine distance in km
function calculateDistance(lat1, lon1, lat2, lon2) {
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

import { MANILA_RESTAURANTS_DIRECTORY } from '../data/manilaRestaurants.js';
import { 
  scrapeRestaurantUrl, 
  handleSearchOrPlatformUrl, 
  extractSafeNameFromUrl, 
  RESERVED_ROUTER_WORDS 
} from './restaurantScraper.js';

// ----------------- Food Spot Smart Analyzer -----------------
export async function analyzeFoodInput(input, userCoords = null) {
  const isUrl = /^https?:\/\//i.test(input.trim());
  let extractedName = '';
  let extractedArea = '';
  let extractedAddress = '';
  let extractedCuisine = 'Casual Dining & Cafe';
  let estimatedBudget = '$$';
  let gutom = 'medium';
  let pagod = 'medium';
  let topDish = 'Specialty of the House';
  let notes = '';
  let branchLat = null;
  let branchLng = null;

  if (isUrl) {
    try {
      const scraped = await scrapeRestaurantUrl(input.trim(), userCoords);
      if (scraped.isList && scraped.restaurants && scraped.restaurants.length > 0) {
        return {
          isList: true,
          listTitle: scraped.listTitle,
          restaurants: scraped.restaurants,
          totalCount: scraped.totalCount,
          sourceUrl: input.trim()
        };
      }

      if (scraped.restaurant) {
        return {
          isList: false,
          ...scraped.restaurant,
          notes: scraped.restaurant.notes || `Extracted from ${input.trim()} 💕`
        };
      }
    } catch (err) {
      console.warn('Scraping restaurant URL failed, falling back to metadata:', err);
    }

    try {
      const platformResult = handleSearchOrPlatformUrl(input.trim(), userCoords);
      if (platformResult) {
        if (platformResult.isList && platformResult.restaurants && platformResult.restaurants.length > 0) {
          return platformResult;
        }
        if (platformResult.restaurant) {
          return {
            isList: false,
            ...platformResult.restaurant,
            notes: platformResult.restaurant.notes || `Extracted from ${input.trim()} 💕`
          };
        }
      }

      extractedName = extractSafeNameFromUrl(input.trim());
      notes = `Discovered via ${new URL(input.trim()).hostname} 💕`;
    } catch {
      extractedName = 'Manila Date Spot';
    }
  } else {
    extractedName = input.trim();
  }

  if (RESERVED_ROUTER_WORDS.has(extractedName.toLowerCase().trim())) {
    extractedName = 'Manila Date Spot';
  }

  // Normalize query for matching (strip punctuation like apostrophes e.g. "chili's" -> "chilis")
  const cleanQuery = extractedName.toLowerCase().replace(/['’]/g, '').trim();

  // Check comprehensive directory first, then known restaurants
  const allKnown = [...MANILA_RESTAURANTS_DIRECTORY, ...KNOWN_RESTAURANTS];
  const match = allKnown.find(r => {
    const rNameClean = r.name.toLowerCase().replace(/['’]/g, '');
    if (rNameClean.includes(cleanQuery) || cleanQuery.includes(rNameClean)) return true;
    if (r.aliases && r.aliases.some(alias => {
      const aClean = alias.toLowerCase().replace(/['’]/g, '');
      return aClean.includes(cleanQuery) || cleanQuery.includes(aClean);
    })) return true;
    return false;
  });

  let nearestBranch = null;
  let distanceKm = null;
  let sortedBranches = [];

  if (match) {
    extractedName = match.name;
    extractedCuisine = match.cuisine;
    estimatedBudget = match.budget;
    gutom = match.gutom_level;
    pagod = match.pagod_level;
    topDish = match.top_dish;

    if (match.branches && match.branches.length > 0) {
      if (userCoords && userCoords.lat && userCoords.lng) {
        // Compute exact distances and sort by closest to user
        sortedBranches = match.branches.map(b => {
          const dist = calculateDistance(userCoords.lat, userCoords.lng, b.lat, b.lng);
          return {
            ...b,
            distanceKm: dist.toFixed(1),
            numericDist: dist
          };
        }).sort((a, b) => a.numericDist - b.numericDist);

        nearestBranch = sortedBranches[0];
        distanceKm = nearestBranch.distanceKm;
        extractedArea = nearestBranch.area;
        extractedAddress = nearestBranch.address || nearestBranch.area;
        branchLat = nearestBranch.lat;
        branchLng = nearestBranch.lng;
      } else {
        sortedBranches = match.branches.map(b => ({ ...b, distanceKm: null }));
        nearestBranch = sortedBranches[0];
        extractedArea = nearestBranch.area;
        extractedAddress = nearestBranch.address || nearestBranch.area;
        branchLat = nearestBranch.lat;
        branchLng = nearestBranch.lng;
      }
    }
  } else {
    // Intelligent keyword inference for cuisine & dishes
    const lower = extractedName.toLowerCase();
    if (lower.includes('ramen') || lower.includes('sushi') || lower.includes('udon') || lower.includes('yabu') || lower.includes('katsu')) {
      extractedCuisine = 'Japanese Dining';
      topDish = 'Signature Ramen / Tonkatsu';
    } else if (lower.includes('samgyup') || lower.includes('korean') || lower.includes('bbq')) {
      extractedCuisine = 'Korean BBQ';
      gutom = 'heavy';
      topDish = 'Unlimited Pork Belly & Melted Cheese';
    } else if (lower.includes('pizza') || lower.includes('pasta') || lower.includes('italian')) {
      extractedCuisine = 'Italian Cuisine';
      topDish = 'Brick Oven Pizza & Truffle Pasta';
    } else if (lower.includes('tea') || lower.includes('boba') || lower.includes('milktea') || lower.includes('sugar')) {
      extractedCuisine = 'Milktea & Drinks';
      gutom = 'light';
      pagod = 'lazy';
      estimatedBudget = '$';
      topDish = 'Brown Sugar Boba Milk & Pearl Milk Tea';
    } else if (lower.includes('coffee') || lower.includes('cafe')) {
      extractedCuisine = 'Artisan Cafe & Dessert';
      gutom = 'light';
      topDish = 'Iced Spanish Latte & Croissant';
    } else if (lower.includes('pares') || lower.includes('sisig') || lower.includes('inasal')) {
      extractedCuisine = 'Filipino Comfort Food';
      estimatedBudget = '$';
      topDish = 'Beef Pares Overload / Chicken Inasal';
    } else if (lower.includes('steak') || lower.includes('grill') || lower.includes('bar') || lower.includes('burger')) {
      extractedCuisine = 'American Grill & Burgers';
      estimatedBudget = '$$';
      gutom = 'heavy';
      topDish = 'Classic Burger & BBQ Ribs';
    }

    // Set precise location based on active user GPS
    if (userCoords && userCoords.district) {
      extractedArea = userCoords.district;
      extractedAddress = `Near your current location in ${userCoords.district}`;
      branchLat = userCoords.lat;
      branchLng = userCoords.lng;
      distanceKm = '1.0';
    } else {
      extractedArea = 'Tomas Morato, Quezon City';
      extractedAddress = 'Tomas Morato Ave, Diliman, Quezon City';
      branchLat = 14.6342;
      branchLng = 121.0375;
    }
  }

  return {
    name: extractedName,
    cuisine: extractedCuisine,
    area: extractedArea,
    address: extractedAddress || extractedArea,
    lat: branchLat,
    lng: branchLng,
    budget: estimatedBudget,
    gutom_level: gutom,
    pagod_level: pagod,
    rating: 4.8,
    top_dish: topDish,
    notes: notes || `Top recommendation to try with Nekol! 💕`,
    nearestBranch,
    distanceKm,
    allBranches: sortedBranches
  };
}

import { scrapeMovieUrl } from './movieScraper.js';

// ----------------- Movie Smart Auto-Genre Classifier -----------------
const GENRE_RULES = [
  {
    genre: 'Filipino Cinema',
    keywords: ['filipino', 'pinoy', 'manila in the claws', 'claws of light', 'batang west side', 'insiang', 'kisapmata', 'himala', 'oro plata mata', 'cleaners', 'buybust', 'on the job', 'otj', 'goyo', 'heneral luna', 'die beautiful', 'ekstra', 'lino brocka', 'ishmael bernal', 'lav diaz']
  },
  {
    genre: 'Romance',
    keywords: ['love', 'time', 'about time', 'romantic', 'valentine', 'heart', 'kiss', 'la la land', 'notebook', 'pride', 'prejudice', 'fault in our stars', 'me before you', 'past lives', 'before sunrise', 'sunset', '500 days', 'crazy rich', 'begin again']
  },
  {
    genre: 'Pinoy Rom-Com',
    keywords: ['one more chance', 'tadhana', 'hello love', 'kathryn', 'alden', 'john lloyd', 'bea', 'can\'t help falling', 'my ex and whys', 'starting over again', 'seven sundays', 'barcelona', 'she\'s dating the gangster', 'always be my maybe', 'jowable', 'sid & aya']
  },
  {
    genre: 'Animation',
    keywords: ['spider-verse', 'ghibli', 'spirited away', 'totoro', 'your name', 'suzume', 'weathering', 'anime', 'pixar', 'disney', 'inside out', 'shrek', 'how to train your dragon', 'ratatouille', 'coco', 'up', 'moana', 'tangled', 'whisker away']
  },
  {
    genre: 'Horror',
    keywords: ['conjuring', 'quiet place', 'insidious', 'exhuma', 'hereditary', 'annabelle', 'sinister', 'paranormal', 'midsommar', 'smile', 'talk to me', 'nun', 'ring', 'evil dead', 'saw', 'shining', 'ghost', 'haunted', 'screaming', 'terror']
  },
  {
    genre: 'K-Drama',
    keywords: ['crash landing', '20th century girl', 'queen of tears', 'itaewon', 'goblin', 'descendants', 'vincenzo', 'business proposal', 'hometown cha', 'weightlifting fairy', 'glory', 'hotel del luna', 'twenty five twenty one', 'reply 1988', 'kdrama', 'korean']
  },
  {
    genre: 'Comedy',
    keywords: ['funny', 'laugh', 'palm springs', 'hangover', 'jump street', 'superbad', 'game night', 'white chicks', 'grown ups', 'step brothers', 'ted', 'bad trip', 'barbie', 'knives out']
  }
];

export async function analyzeMovieInput(input) {
  const isUrl = /^https?:\/\//i.test(input.trim());

  if (isUrl) {
    try {
      const scraped = await scrapeMovieUrl(input.trim());
      
      // If multiple movies found in list (e.g. Letterboxd Top 100 Filipino Films)
      if (scraped.isList && scraped.titles.length > 1) {
        return {
          isList: true,
          listTitle: scraped.listTitle,
          titles: scraped.titles,
          genre: scraped.defaultGenre,
          streaming: scraped.defaultStreaming,
          sourceUrl: input.trim()
        };
      }

      // Single movie from URL
      const singleTitle = scraped.titles[0] || scraped.listTitle || 'Movie';
      let genre = scraped.defaultGenre;
      const lower = singleTitle.toLowerCase();
      for (const rule of GENRE_RULES) {
        if (rule.keywords.some(k => lower.includes(k))) {
          genre = rule.genre;
          break;
        }
      }

      return {
        isList: false,
        title: singleTitle,
        genre,
        duration: '2h',
        streaming: scraped.defaultStreaming,
        rating: 5,
        notes: `Extracted from ${scraped.listTitle || 'shared link'} 💕`
      };
    } catch (err) {
      console.warn('URL scraping failed, using fallback:', err);
      try {
        const url = new URL(input.trim());
        const segments = url.pathname.split('/').filter(Boolean);
        const last = segments[segments.length - 1] || 'Movie';
        const fallbackTitle = last.replace(/[-_]/g, ' ').replace(/\.\w+$/, '')
                                  .split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        return {
          isList: false,
          title: fallbackTitle,
          genre: 'Romance',
          duration: '2h',
          streaming: 'Streaming',
          rating: 5,
          notes: 'Added from link'
        };
      } catch {
        // Continue to text fallback
      }
    }
  }

  // Non-URL title input
  const title = input.trim();
  let detectedGenre = 'Romance';
  const lowerTitle = title.toLowerCase();
  for (const rule of GENRE_RULES) {
    if (rule.keywords.some(k => lowerTitle.includes(k))) {
      detectedGenre = rule.genre;
      break;
    }
  }

  return {
    isList: false,
    title,
    genre: detectedGenre,
    duration: '2h',
    streaming: 'Netflix',
    rating: 5,
    notes: 'Added to our date night bucket! Perfect for watching with Nekol 🥰'
  };
}
