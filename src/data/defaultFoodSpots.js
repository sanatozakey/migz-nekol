export const DEFAULT_FOOD_SPOTS = [
  {
    id: 'spot-1',
    name: 'Mendokoro Ramenba',
    cuisine: 'Japanese Ramen & Gyoza',
    area: 'BGC & Salcedo Makati',
    budget: '$$',
    gutom_level: 'medium',
    pagod_level: 'medium',
    rating: 4.8,
    review_count: 5200,
    top_dish: 'Super Chashu Ramen & Gyoza',
    google_maps_query: 'Mendokoro Ramenba BGC Taguig',
    branches: [
      { name: 'BGC (Icon Plaza)', area: 'BGC, Taguig', lat: 14.5510, lng: 121.0503 },
      { name: 'Salcedo Village', area: 'Makati', lat: 14.5583, lng: 121.0232 },
      { name: 'Capitol Commons', area: 'Pasig', lat: 14.5772, lng: 121.0625 }
    ],
    notes: 'Legendary rich tonkotsu broth. Sitting side-by-side at the ramen counter feels like a Tokyo date! 🍜'
  },
  {
    id: 'spot-boba-1',
    name: 'Tiger Sugar',
    cuisine: 'Brown Sugar Boba & Milk Tea',
    area: 'SM Megamall, BGC High Street, MOA, Trinoma',
    budget: '$',
    gutom_level: 'light',
    pagod_level: 'lazy',
    rating: 4.8,
    review_count: 6400,
    top_dish: 'Brown Sugar Boba Milk with Cream Mousse',
    google_maps_query: 'Tiger Sugar SM Megamall',
    branches: [
      { name: 'SM Megamall Branch', area: 'Mandaluyong / Ortigas', lat: 14.5842, lng: 121.0568 },
      { name: 'BGC High Street Branch', area: 'BGC, Taguig', lat: 14.5515, lng: 121.0498 },
      { name: 'SM Mall of Asia Branch', area: 'Pasay', lat: 14.5350, lng: 120.9820 },
      { name: 'Trinoma Mall Branch', area: 'Quezon City', lat: 14.6534, lng: 121.0332 }
    ],
    notes: 'Warm chewy brown sugar tapioca pearls paired with rich fresh cold milk and cream mousse! Perfect pick-me-up! 🧋'
  },
  {
    id: 'spot-boba-2',
    name: 'The Alley',
    cuisine: 'Artisan Boba Tea & Refreshing Fruit Teas',
    area: 'Bonifacio High Street & SM Megamall',
    budget: '$',
    gutom_level: 'light',
    pagod_level: 'medium',
    rating: 4.7,
    review_count: 4200,
    top_dish: 'Deerioca Fever Brown Sugar Fresh Milk & Peach Oolong',
    google_maps_query: 'The Alley Bonifacio High Street BGC',
    branches: [
      { name: 'Bonifacio High Street Branch', area: 'BGC, Taguig', lat: 14.5520, lng: 121.0505 },
      { name: 'SM Megamall Mega Fashion Hall', area: 'Mandaluyong', lat: 14.5850, lng: 121.0570 }
    ],
    notes: 'Aesthetic deer logo, handcrafted sugar cane syrup, and delicious chewy pearls for a sweet afternoon stroll! 🦌🧋'
  },
  {
    id: 'spot-boba-3',
    name: 'CoCo Fresh Tea & Juice',
    cuisine: 'Taiwanese Fruit Tea & Signature Boba',
    area: 'Greenbelt Makati, Eastwood, Katipunan, SM North',
    budget: '$',
    gutom_level: 'light',
    pagod_level: 'lazy',
    rating: 4.7,
    review_count: 8800,
    top_dish: '3 Buddies Milk Tea (Pudding, Pearl & Grass Jelly)',
    google_maps_query: 'Coco Fresh Tea Greenbelt Makati',
    branches: [
      { name: 'Greenbelt 3 Branch', area: 'Makati', lat: 14.5525, lng: 121.0215 },
      { name: 'Eastwood City Branch', area: 'Quezon City', lat: 14.6095, lng: 121.0805 },
      { name: 'Katipunan Branch (near Ateneo)', area: 'Quezon City', lat: 14.6405, lng: 121.0760 }
    ],
    notes: 'Go-to comfort drink! The 3 Buddies gives you all the delicious toppings in every single sip! 🧋✨'
  },
  {
    id: 'spot-2',
    name: 'Tablo Kitchen x Cafe',
    cuisine: 'Comfort Food & Modern Bistro',
    area: 'Quezon City & BF Homes Parañaque',
    budget: '$$',
    gutom_level: 'heavy',
    pagod_level: 'adventure',
    rating: 4.9,
    review_count: 4800,
    top_dish: 'Creamy Truffle Pasta & Steak Skillet',
    google_maps_query: 'Tablo Kitchen x Cafe Scout Borromeo Quezon City',
    branches: [
      { name: 'Scout Borromeo Branch', area: 'Quezon City', lat: 14.6366, lng: 121.0355 },
      { name: 'BF Homes Branch', area: 'Parañaque', lat: 14.4532, lng: 121.0189 }
    ],
    notes: 'Super aesthetic cozy lighting, huge generous servings perfect for sharing, and top-tier desserts.'
  },
  {
    id: 'spot-3',
    name: 'Wildflour Restaurant & Bakery',
    cuisine: 'Western Brunch & Artisan Bakery',
    area: 'BGC High Street, Salcedo Makati, Greenhills',
    budget: '$$$',
    gutom_level: 'medium',
    pagod_level: 'medium',
    rating: 4.7,
    review_count: 6100,
    top_dish: 'Kimchi Fried Rice with Steak & Cronuts',
    google_maps_query: 'Wildflour Restaurant BGC Taguig',
    branches: [
      { name: 'Bonifacio High Street Branch', area: 'BGC, Taguig', lat: 14.5508, lng: 121.0494 },
      { name: 'Salcedo Village Branch', area: 'Makati', lat: 14.5601, lng: 121.0245 },
      { name: 'Greenhills Branch', area: 'San Juan', lat: 14.6019, lng: 121.0507 }
    ],
    notes: 'Chic Parisian-New York bistro ambiance. Perfect for iced milktea, fresh pastries, and cute couple photos.'
  },
  {
    id: 'spot-4',
    name: 'Gino\'s Brick Oven Pizza',
    cuisine: 'Italian & Craft Neapolitan Pizza',
    area: 'Katipunan QC & Salcedo Village Makati',
    budget: '$$',
    gutom_level: 'medium',
    pagod_level: 'medium',
    rating: 4.7,
    review_count: 3200,
    top_dish: 'SMEGG Pizza with Spicy Honey & Fresh Burrata',
    google_maps_query: 'Ginos Brick Oven Pizza Makati',
    branches: [
      { name: 'Salcedo Village Branch', area: 'Makati', lat: 14.5595, lng: 121.0240 },
      { name: 'Katipunan Branch', area: 'Quezon City', lat: 14.6402, lng: 121.0755 }
    ],
    notes: 'Drizzle their signature spicy honey over fresh hot burrata. Romantic, casual, and universally loved!'
  },
  {
    id: 'spot-5',
    name: 'Premier The Samgyupsal / Romantic Baboy',
    cuisine: 'Unlimited Korean BBQ',
    area: 'Tomas Morato, BGC, Malate',
    budget: '$$',
    gutom_level: 'heavy',
    pagod_level: 'lazy',
    rating: 4.6,
    review_count: 7300,
    top_dish: 'Unlimited Aged Samgyeopsal & Melted Cheese',
    google_maps_query: 'Premier The Samgyupsal',
    branches: [
      { name: 'Tomas Morato Branch', area: 'Quezon City', lat: 14.6345, lng: 121.0375 },
      { name: 'BGC Crossroads Branch', area: 'Taguig', lat: 14.5535, lng: 121.0480 }
    ],
    notes: 'For when gutom level is 100%! Grill pork belly together, dip in melted cheese, and eat unli side dishes.'
  },
  {
    id: 'spot-10',
    name: 'Marugame Udon',
    cuisine: 'Japanese Fast-Casual Udon & Tempura',
    area: 'SM Megamall, Glorietta, Trinoma, BGC',
    budget: '$',
    gutom_level: 'medium',
    pagod_level: 'lazy',
    rating: 4.7,
    review_count: 6700,
    top_dish: 'Beef Yaki Udon & Jumbo Prawn Tempura',
    google_maps_query: 'Marugame Udon',
    branches: [
      { name: 'SM Megamall Branch', area: 'Mandaluyong', lat: 14.5842, lng: 121.0568 },
      { name: 'Glorietta 4 Branch', area: 'Makati', lat: 14.5515, lng: 121.0255 },
      { name: 'Trinoma Branch', area: 'Quezon City', lat: 14.6534, lng: 121.0332 },
      { name: 'High Street Branch', area: 'BGC, Taguig', lat: 14.5517, lng: 121.0489 }
    ],
    notes: 'Budget-friendly, quick, piping hot noodles with unlimited tempura flakes and green onions.'
  },
  {
    id: 'spot-11',
    name: 'Gram Cafe & Pancakes',
    cuisine: 'Japanese Soufflé Desserts & Milktea Drinks',
    area: 'SM Megamall & Mall of Asia',
    budget: '$$',
    gutom_level: 'light',
    pagod_level: 'medium',
    rating: 4.5,
    review_count: 1800,
    top_dish: 'Premium Fluffy Soufflé Three-Tier Stack & Iced Milk Tea',
    google_maps_query: 'Gram Cafe and Pancakes SM Megamall',
    branches: [
      { name: 'SM Megamall Mega Fashion Hall', area: 'Mandaluyong', lat: 14.5855, lng: 121.0575 },
      { name: 'SM Mall of Asia Branch', area: 'Pasay', lat: 14.5355, lng: 120.9825 }
    ],
    notes: 'Jiggly, cloud-like soufflé pancakes dusted in powdered sugar with butter, syrup, and cold refreshing milk tea! 🥞🧋'
  },
  {
    id: 'spot-boba-4',
    name: 'Macao Imperial Tea',
    cuisine: 'Cream Cheese Milktea & Cheesecake Drinks',
    area: 'Fisher Mall, Lucky Chinatown, Robinsons Galleria',
    budget: '$',
    gutom_level: 'light',
    pagod_level: 'lazy',
    rating: 4.6,
    review_count: 5100,
    top_dish: 'Cheesecake and Pearl Milk Tea & Red Velvet Shake',
    google_maps_query: 'Macao Imperial Tea',
    branches: [
      { name: 'Robinsons Galleria Branch', area: 'Ortigas / QC', lat: 14.5905, lng: 121.0595 },
      { name: 'BGC Market Market Branch', area: 'Taguig', lat: 14.5495, lng: 121.0550 }
    ],
    notes: 'Signature thick cream cheese layer that pairs so good with rich iced milktea! 🧀🧋'
  }
];

export const BUDGET_OPTIONS = [
  { id: 'all', label: 'Any Budget', symbol: '₱' },
  { id: '$', label: 'Tipid / Budget (< ₱350)', symbol: '₱' },
  { id: '$$', label: 'Casual Date (₱350 - ₱1000)', symbol: '₱₱' },
  { id: '$$$', label: 'Fancy Date / Celebrate (₱1000+)', symbol: '₱₱₱' }
];

export const GUTOM_OPTIONS = [
  { id: 'all', label: 'Any Gutom Level', emoji: '🍽️' },
  { id: 'light', label: 'Milktea, Drinks & Desserts 🧋', emoji: '🧋' },
  { id: 'medium', label: 'Tamang Gutom / Regular 🍲', emoji: '🍲' },
  { id: 'heavy', label: 'Patay-Gutom / Beast Mode 🥩', emoji: '🥩' }
];

export const PAGOD_OPTIONS = [
  { id: 'all', label: 'Any Distance', emoji: '🚗' },
  { id: 'lazy', label: 'Katabi Lang / Sobrang Pagod 🛵', emoji: '🛵' },
  { id: 'medium', label: '15-30 Mins / Neighborhood 🚗', emoji: '🚗' },
  { id: 'adventure', label: 'Adventure Mode / G Kahit Saan! 🗺️', emoji: '🗺️' }
];
