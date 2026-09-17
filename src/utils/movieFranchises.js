// Movie Franchise, Prequel & Sequel catalog and detection engine

export const FRANCHISE_DATABASE = [
  {
    franchise: 'Spider-Man / Spider-Verse',
    keywords: ['spider-man', 'spiderman', 'spider man', 'spider-verse', 'spiderverse', 'miles morales', 'peter parker'],
    genre: 'Action & Adventure',
    movies: [
      { title: 'Spider-Man (Tobey Maguire)', year: 2002, type: 'original', order: 1, streaming: 'Netflix', duration: '2h 1m' },
      { title: 'Spider-Man 2', year: 2004, type: 'sequel', order: 2, streaming: 'Netflix', duration: '2h 7m' },
      { title: 'Spider-Man 3', year: 2007, type: 'sequel', order: 3, streaming: 'Netflix', duration: '2h 19m' },
      { title: 'The Amazing Spider-Man (Andrew Garfield)', year: 2012, type: 'reboot', order: 4, streaming: 'Disney+', duration: '2h 16m' },
      { title: 'The Amazing Spider-Man 2', year: 2014, type: 'sequel', order: 5, streaming: 'Disney+', duration: '2h 22m' },
      { title: 'Spider-Man: Homecoming (Tom Holland)', year: 2017, type: 'sequel', order: 6, streaming: 'Netflix', duration: '2h 13m' },
      { title: 'Spider-Man: Into the Spider-Verse', year: 2018, type: 'animated original', order: 7, streaming: 'Netflix', duration: '1h 57m' },
      { title: 'Spider-Man: Far From Home', year: 2019, type: 'sequel', order: 8, streaming: 'Netflix', duration: '2h 9m' },
      { title: 'Spider-Man: No Way Home', year: 2021, type: 'sequel', order: 9, streaming: 'Netflix', duration: '2h 28m' },
      { title: 'Spider-Man: Across the Spider-Verse', year: 2023, type: 'animated sequel', order: 10, streaming: 'Netflix', duration: '2h 20m' },
      { title: 'Spider-Man: Beyond the Spider-Verse', year: 2025, type: 'upcoming sequel', order: 11, streaming: 'Cinema', duration: 'Upcoming' }
    ]
  },
  {
    franchise: 'Dune',
    keywords: ['dune', 'arrakis', 'paul atreides', 'timothee chalamet'],
    genre: 'Sci-Fi & Fantasy',
    movies: [
      { title: 'Dune: Part One', year: 2021, type: 'original', order: 1, streaming: 'HBO GO / Max', duration: '2h 35m' },
      { title: 'Dune: Part Two', year: 2024, type: 'sequel', order: 2, streaming: 'HBO GO / Max', duration: '2h 46m' },
      { title: 'Dune: Messiah', year: 2026, type: 'upcoming sequel', order: 3, streaming: 'Cinema', duration: 'Upcoming' }
    ]
  },
  {
    franchise: 'The Hunger Games',
    keywords: ['hunger games', 'katniss', 'catching fire', 'mockingjay', 'songbirds and snakes'],
    genre: 'Action & Adventure',
    movies: [
      { title: 'The Hunger Games: The Ballad of Songbirds & Snakes', year: 2023, type: 'prequel', order: 0, streaming: 'Netflix', duration: '2h 37m' },
      { title: 'The Hunger Games', year: 2012, type: 'original', order: 1, streaming: 'Netflix', duration: '2h 22m' },
      { title: 'The Hunger Games: Catching Fire', year: 2013, type: 'sequel', order: 2, streaming: 'Netflix', duration: '2h 26m' },
      { title: 'The Hunger Games: Mockingjay - Part 1', year: 2014, type: 'sequel', order: 3, streaming: 'Netflix', duration: '2h 3m' },
      { title: 'The Hunger Games: Mockingjay - Part 2', year: 2015, type: 'sequel', order: 4, streaming: 'Netflix', duration: '2h 17m' }
    ]
  },
  {
    franchise: 'Kung Fu Panda',
    keywords: ['kung fu panda', 'po', 'dragon warrior'],
    genre: 'Animation & Cute',
    movies: [
      { title: 'Kung Fu Panda', year: 2008, type: 'original', order: 1, streaming: 'Netflix', duration: '1h 32m' },
      { title: 'Kung Fu Panda 2', year: 2011, type: 'sequel', order: 2, streaming: 'Netflix', duration: '1h 30m' },
      { title: 'Kung Fu Panda 3', year: 2016, type: 'sequel', order: 3, streaming: 'Netflix', duration: '1h 35m' },
      { title: 'Kung Fu Panda 4', year: 2024, type: 'sequel', order: 4, streaming: 'Netflix / Peacock', duration: '1h 34m' }
    ]
  },
  {
    franchise: 'Inside Out',
    keywords: ['inside out', 'joy and sadness', 'riley', 'inside out 2'],
    genre: 'Animation & Cute',
    movies: [
      { title: 'Inside Out', year: 2015, type: 'original', order: 1, streaming: 'Disney+', duration: '1h 35m' },
      { title: 'Inside Out 2', year: 2024, type: 'sequel', order: 2, streaming: 'Disney+', duration: '1h 36m' }
    ]
  },
  {
    franchise: 'Harry Potter & Wizarding World',
    keywords: ['harry potter', 'hogwarts', 'voldemort', 'fantastic beasts', 'hermione'],
    genre: 'Sci-Fi & Fantasy',
    movies: [
      { title: 'Fantastic Beasts and Where to Find Them', year: 2016, type: 'prequel', order: -2, streaming: 'HBO GO', duration: '2h 13m' },
      { title: 'Fantastic Beasts: The Crimes of Grindelwald', year: 2018, type: 'prequel', order: -1, streaming: 'HBO GO', duration: '2h 14m' },
      { title: 'Fantastic Beasts: The Secrets of Dumbledore', year: 2022, type: 'prequel', order: 0, streaming: 'HBO GO', duration: '2h 22m' },
      { title: "Harry Potter and the Sorcerer's Stone", year: 2001, type: 'original', order: 1, streaming: 'HBO GO', duration: '2h 32m' },
      { title: 'Harry Potter and the Chamber of Secrets', year: 2002, type: 'sequel', order: 2, streaming: 'HBO GO', duration: '2h 41m' },
      { title: 'Harry Potter and the Prisoner of Azkaban', year: 2004, type: 'sequel', order: 3, streaming: 'HBO GO', duration: '2h 22m' },
      { title: 'Harry Potter and the Goblet of Fire', year: 2005, type: 'sequel', order: 4, streaming: 'HBO GO', duration: '2h 37m' },
      { title: 'Harry Potter and the Order of the Phoenix', year: 2007, type: 'sequel', order: 5, streaming: 'HBO GO', duration: '2h 18m' },
      { title: 'Harry Potter and the Half-Blood Prince', year: 2009, type: 'sequel', order: 6, streaming: 'HBO GO', duration: '2h 33m' },
      { title: 'Harry Potter and the Deathly Hallows - Part 1', year: 2010, type: 'sequel', order: 7, streaming: 'HBO GO', duration: '2h 26m' },
      { title: 'Harry Potter and the Deathly Hallows - Part 2', year: 2011, type: 'sequel', order: 8, streaming: 'HBO GO', duration: '2h 10m' }
    ]
  },
  {
    franchise: 'Shrek',
    keywords: ['shrek', 'fiona', 'donkey', 'farquaad', 'puss in boots'],
    genre: 'Comedy & Chill',
    movies: [
      { title: 'Shrek', year: 2001, type: 'original', order: 1, streaming: 'Netflix', duration: '1h 30m' },
      { title: 'Shrek 2', year: 2004, type: 'sequel', order: 2, streaming: 'Netflix', duration: '1h 33m' },
      { title: 'Shrek the Third', year: 2007, type: 'sequel', order: 3, streaming: 'Netflix', duration: '1h 33m' },
      { title: 'Shrek Forever After', year: 2010, type: 'sequel', order: 4, streaming: 'Netflix', duration: '1h 33m' },
      { title: 'Puss in Boots', year: 2011, type: 'spin-off', order: 5, streaming: 'Netflix', duration: '1h 30m' },
      { title: 'Puss in Boots: The Last Wish', year: 2022, type: 'sequel', order: 6, streaming: 'Netflix', duration: '1h 42m' }
    ]
  },
  {
    franchise: 'Toy Story',
    keywords: ['toy story', 'woody', 'buzz lightyear'],
    genre: 'Animation & Cute',
    movies: [
      { title: 'Toy Story', year: 1995, type: 'original', order: 1, streaming: 'Disney+', duration: '1h 21m' },
      { title: 'Toy Story 2', year: 1999, type: 'sequel', order: 2, streaming: 'Disney+', duration: '1h 32m' },
      { title: 'Toy Story 3', year: 2010, type: 'sequel', order: 3, streaming: 'Disney+', duration: '1h 43m' },
      { title: 'Toy Story 4', year: 2019, type: 'sequel', order: 4, streaming: 'Disney+', duration: '1h 40m' },
      { title: 'Lightyear', year: 2022, type: 'prequel / spin-off', order: 5, streaming: 'Disney+', duration: '1h 45m' }
    ]
  },
  {
    franchise: 'Despicable Me & Minions',
    keywords: ['despicable me', 'minions', 'gru', 'banana'],
    genre: 'Animation & Cute',
    movies: [
      { title: 'Minions', year: 2015, type: 'prequel', order: 0, streaming: 'Netflix', duration: '1h 31m' },
      { title: 'Minions: The Rise of Gru', year: 2022, type: 'prequel', order: 0.5, streaming: 'Netflix', duration: '1h 27m' },
      { title: 'Despicable Me', year: 2010, type: 'original', order: 1, streaming: 'Netflix', duration: '1h 35m' },
      { title: 'Despicable Me 2', year: 2013, type: 'sequel', order: 2, streaming: 'Netflix', duration: '1h 38m' },
      { title: 'Despicable Me 3', year: 2017, type: 'sequel', order: 3, streaming: 'Netflix', duration: '1h 30m' },
      { title: 'Despicable Me 4', year: 2024, type: 'sequel', order: 4, streaming: 'Peacock / VOD', duration: '1h 35m' }
    ]
  },
  {
    franchise: 'A Quiet Place',
    keywords: ['a quiet place', 'quiet place', 'day one'],
    genre: 'Horror & Thriller',
    movies: [
      { title: 'A Quiet Place: Day One', year: 2024, type: 'prequel', order: 0, streaming: 'Paramount+ / VOD', duration: '1h 39m' },
      { title: 'A Quiet Place', year: 2018, type: 'original', order: 1, streaming: 'Netflix', duration: '1h 30m' },
      { title: 'A Quiet Place Part II', year: 2020, type: 'sequel', order: 2, streaming: 'Netflix', duration: '1h 37m' }
    ]
  },
  {
    franchise: 'Before Trilogy (Romantic)',
    keywords: ['before sunrise', 'before sunset', 'before midnight', 'ethan hawke', 'julie delpy'],
    genre: 'Romance',
    movies: [
      { title: 'Before Sunrise', year: 1995, type: 'original', order: 1, streaming: 'Apple TV', duration: '1h 41m' },
      { title: 'Before Sunset', year: 2004, type: 'sequel', order: 2, streaming: 'Apple TV', duration: '1h 20m' },
      { title: 'Before Midnight', year: 2013, type: 'sequel', order: 3, streaming: 'Apple TV', duration: '1h 49m' }
    ]
  },
  {
    franchise: 'The Dark Knight Trilogy',
    keywords: ['batman', 'dark knight', 'christian bale', 'heath ledger', 'batman begins'],
    genre: 'Action & Adventure',
    movies: [
      { title: 'Batman Begins', year: 2005, type: 'original', order: 1, streaming: 'HBO GO', duration: '2h 20m' },
      { title: 'The Dark Knight', year: 2008, type: 'sequel', order: 2, streaming: 'HBO GO', duration: '2h 32m' },
      { title: 'The Dark Knight Rises', year: 2012, type: 'sequel', order: 3, streaming: 'HBO GO', duration: '2h 45m' }
    ]
  },
  {
    franchise: 'Deadpool & Wolverine',
    keywords: ['deadpool', 'wolverine', 'ryan reynolds', 'wade wilson'],
    genre: 'Action & Adventure',
    movies: [
      { title: 'Deadpool', year: 2016, type: 'original', order: 1, streaming: 'Disney+', duration: '1h 48m' },
      { title: 'Deadpool 2', year: 2018, type: 'sequel', order: 2, streaming: 'Disney+', duration: '1h 59m' },
      { title: 'Deadpool & Wolverine', year: 2024, type: 'sequel', order: 3, streaming: 'Disney+', duration: '2h 7m' }
    ]
  },
  {
    franchise: 'Knives Out / Benoit Blanc',
    keywords: ['knives out', 'glass onion', 'benoit blanc', 'daniel craig'],
    genre: 'Mystery & Crime',
    movies: [
      { title: 'Knives Out', year: 2019, type: 'original', order: 1, streaming: 'Netflix', duration: '2h 10m' },
      { title: 'Glass Onion: A Knives Out Mystery', year: 2022, type: 'sequel', order: 2, streaming: 'Netflix', duration: '2h 19m' },
      { title: 'Wake Up Dead Man: A Knives Out Mystery', year: 2025, type: 'upcoming sequel', order: 3, streaming: 'Netflix', duration: 'Upcoming' }
    ]
  },
  {
    franchise: 'John Wick',
    keywords: ['john wick', 'baba yaga', 'keanu reeves', 'parabellum'],
    genre: 'Action & Adventure',
    movies: [
      { title: 'The Continental (Series)', year: 2023, type: 'prequel', order: 0, streaming: 'Prime Video', duration: '3 episodes' },
      { title: 'John Wick', year: 2014, type: 'original', order: 1, streaming: 'Netflix', duration: '1h 41m' },
      { title: 'John Wick: Chapter 2', year: 2017, type: 'sequel', order: 2, streaming: 'Netflix', duration: '2h 2m' },
      { title: 'John Wick: Chapter 3 - Parabellum', year: 2019, type: 'sequel', order: 3, streaming: 'Netflix', duration: '2h 10m' },
      { title: 'John Wick: Chapter 4', year: 2023, type: 'sequel', order: 4, streaming: 'Netflix', duration: '2h 49m' },
      { title: 'Ballerina', year: 2025, type: 'spin-off sequel', order: 5, streaming: 'Cinema', duration: 'Upcoming' }
    ]
  },
  {
    franchise: 'Frozen',
    keywords: ['frozen', 'elsa', 'anna', 'olaf', 'let it go'],
    genre: 'Animation & Cute',
    movies: [
      { title: 'Frozen', year: 2013, type: 'original', order: 1, streaming: 'Disney+', duration: '1h 42m' },
      { title: 'Frozen II', year: 2019, type: 'sequel', order: 2, streaming: 'Disney+', duration: '1h 43m' }
    ]
  },
  {
    franchise: 'How to Train Your Dragon',
    keywords: ['how to train your dragon', 'toothless', 'hiccup', 'httyd'],
    genre: 'Animation & Cute',
    movies: [
      { title: 'How to Train Your Dragon', year: 2010, type: 'original', order: 1, streaming: 'Netflix', duration: '1h 38m' },
      { title: 'How to Train Your Dragon 2', year: 2014, type: 'sequel', order: 2, streaming: 'Netflix', duration: '1h 42m' },
      { title: 'How to Train Your Dragon: The Hidden World', year: 2019, type: 'sequel', order: 3, streaming: 'Netflix', duration: '1h 44m' }
    ]
  },
  {
    franchise: 'The Twilight Saga',
    keywords: ['twilight', 'edward cullen', 'bella swan', 'breaking dawn', 'new moon', 'eclipse'],
    genre: 'Romance',
    movies: [
      { title: 'Twilight', year: 2008, type: 'original', order: 1, streaming: 'Netflix', duration: '2h 2m' },
      { title: 'The Twilight Saga: New Moon', year: 2009, type: 'sequel', order: 2, streaming: 'Netflix', duration: '2h 10m' },
      { title: 'The Twilight Saga: Eclipse', year: 2010, type: 'sequel', order: 3, streaming: 'Netflix', duration: '2h 4m' },
      { title: 'The Twilight Saga: Breaking Dawn - Part 1', year: 2011, type: 'sequel', order: 4, streaming: 'Netflix', duration: '1h 57m' },
      { title: 'The Twilight Saga: Breaking Dawn - Part 2', year: 2012, type: 'sequel', order: 5, streaming: 'Netflix', duration: '1h 55m' }
    ]
  }
];

/**
 * Searches the database for prequels and sequels matching a movie title or query.
 * If not in database, checks for numbered sequels (e.g. "Avatar", "Sonic", "Paddington").
 */
export function findSequelsAndPrequels(query) {
  if (!query || query.trim().length < 2) return null;
  const clean = query.trim().toLowerCase();

  // 1. Direct match with franchise database
  for (const item of FRANCHISE_DATABASE) {
    const matchedKeyword = item.keywords.some(k => clean.includes(k) || k.includes(clean));
    const matchedTitle = item.movies.some(m => m.title.toLowerCase().includes(clean) || clean.includes(m.title.toLowerCase()));

    if (matchedKeyword || matchedTitle) {
      return {
        franchiseName: item.franchise,
        genre: item.genre,
        movies: item.movies
      };
    }
  }

  // 2. Pattern detection for numbered sequels (e.g., "Avatar", "Gladiator", "Paddington")
  const baseNameMatch = query.replace(/\s*(part\s*\d+|\d+|ii|iii|iv|v)$/i, '').trim();
  if (baseNameMatch.length >= 3 && baseNameMatch.toLowerCase() !== clean) {
    return {
      franchiseName: `${baseNameMatch} Series`,
      genre: 'Action & Adventure',
      movies: [
        { title: `${baseNameMatch} (Part 1 / Original)`, year: '', type: 'original', order: 1, streaming: 'Netflix', duration: '2h' },
        { title: `${baseNameMatch} 2 (Sequel)`, year: '', type: 'sequel', order: 2, streaming: 'Netflix', duration: '2h' },
        { title: `${baseNameMatch} 3 (Sequel)`, year: '', type: 'sequel', order: 3, streaming: 'Netflix', duration: '2h' }
      ]
    };
  }

  return null;
}
