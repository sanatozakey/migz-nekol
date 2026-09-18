import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, X, Film, Sparkles, Check, AlertCircle, Popcorn } from 'lucide-react';
import { searchTmdbMovies, getTmdbMovieDetails } from '../../utils/tmdbApi';
import { autoCategorizeMovie } from '../../utils/storage';
import { useTheme } from '../../context/ThemeContext';
import { playPop, playSuccessFanfare } from '../../lib/soundEffects';

export default function TmdbMovieSearch({ onSelectMovie, existingMovies = [], onAddDirect }) {
  const { isKuromi } = useTheme();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedMoviePreview, setSelectedMoviePreview] = useState(null);

  const debounceTimerRef = useRef(null);
  const wrapperRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Live search-as-you-type with 300ms debounce
  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setErrorMessage('');
    setSelectedMoviePreview(null);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!val.trim() || val.trim().length < 2) {
      setResults([]);
      setIsSearching(false);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    setShowDropdown(true);

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const hits = await searchTmdbMovies(val.trim());
        setResults(hits);
        setErrorMessage('');
      } catch (err) {
        console.warn('TMDB search error:', err);
        setResults([]);
        setErrorMessage(err.message || 'Unable to fetch movies from TMDB');
      } finally {
        setIsSearching(false);
      }
    }, 300);
  };

  const handleClear = () => {
    playPop();
    setQuery('');
    setResults([]);
    setShowDropdown(false);
    setErrorMessage('');
    setSelectedMoviePreview(null);
  };

  // Check if a movie is already in user's catalog
  const checkIsDuplicate = (candidateTitle, candidateId) => {
    if (!existingMovies || existingMovies.length === 0) return null;
    const cleanTitle = (candidateTitle || '').trim().toLowerCase();
    return existingMovies.find(m => {
      if (candidateId && m.tmdb_id && String(m.tmdb_id) === String(candidateId)) return true;
      return (m.title || '').trim().toLowerCase() === cleanTitle;
    });
  };

  // On selection: fetch full details via /movie/{id} and auto-categorize
  const handleSelect = async (item) => {
    playPop();
    setIsLoadingDetails(true);
    setShowDropdown(false);

    try {
      const details = await getTmdbMovieDetails(item.id);

      // Auto-categorize genre & dynamically register if new
      const { primaryGenre, allGenres } = autoCategorizeMovie(details);

      // Check if duplicate
      const duplicate = checkIsDuplicate(details.title, details.id);

      const moviePayload = {
        title: details.title,
        genre: primaryGenre,
        allGenres,
        duration: details.duration || '2h',
        streaming: details.streaming || 'Netflix',
        poster_url: details.poster_url || null,
        poster_thumb: details.poster_thumb || null,
        backdrop_url: details.backdrop_url || null,
        rating: details.rating || 5,
        year: details.year || '',
        tmdb_id: details.id,
        is_filipino: details.is_filipino,
        notes: details.tagline 
          ? `"${details.tagline}" • ${details.overview ? details.overview.slice(0, 160) + '...' : ''}`
          : details.overview 
            ? details.overview.slice(0, 180) + '...' 
            : 'Added via TMDB 💕',
        isDuplicate: Boolean(duplicate),
        duplicateMovie: duplicate
      };

      setSelectedMoviePreview(moviePayload);
      if (onSelectMovie) {
        onSelectMovie(moviePayload);
      }
    } catch (err) {
      console.error('Error fetching movie details:', err);
      // Fallback with basic search item info
      const { primaryGenre } = autoCategorizeMovie(item);
      const duplicate = checkIsDuplicate(item.title, item.id);
      const fallbackPayload = {
        title: item.title,
        genre: primaryGenre,
        duration: '2h',
        streaming: item.streaming || 'Netflix',
        poster_url: item.poster_url,
        rating: 5,
        year: item.year || '',
        tmdb_id: item.id,
        is_filipino: item.is_filipino,
        notes: item.overview || 'Added via TMDB 💕',
        isDuplicate: Boolean(duplicate),
        duplicateMovie: duplicate
      };
      setSelectedMoviePreview(fallbackPayload);
      if (onSelectMovie) onSelectMovie(fallbackPayload);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      {/* Search Input Field */}
      <div className="relative flex items-center">
        <span className="absolute left-3.5 text-pink-500 pointer-events-none">
          {isSearching || isLoadingDetails ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </span>

        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => { if (results.length > 0) setShowDropdown(true); }}
          placeholder="Search movie title (Filipino & International)... e.g. Rewind, Hello Love Goodbye, About Time"
          className={`w-full pl-10 pr-10 py-3 rounded-2xl text-xs sm:text-sm font-semibold border outline-none transition-all ${
            isKuromi
              ? 'bg-[#181426] border-[#382d54] text-white focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 placeholder:text-slate-500'
              : 'bg-white border-sky-200 text-slate-800 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 placeholder:text-slate-400'
          }`}
        />

        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3.5 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Floating Live Search Dropdown */}
      {showDropdown && (
        <div className={`absolute top-full left-0 right-0 z-[130] mt-2 rounded-2xl border shadow-2xl overflow-hidden animate-fade-in backdrop-blur-xl ${
          isKuromi
            ? 'bg-[#151022]/95 border-[#382d54] text-white shadow-purple-950/50'
            : 'bg-white/95 border-sky-200 text-slate-800 shadow-sky-200/50'
        }`}>
          {/* Header summary of results */}
          <div className="px-3.5 py-2 border-b border-slate-200/20 flex items-center justify-between text-[11px] font-bold opacity-75">
            <span className="flex items-center gap-1.5">
              <Popcorn className="w-3.5 h-3.5 text-pink-500" />
              <span>TMDB Results for "{query}"</span>
            </span>
            {results.length > 0 && <span>{results.length} found</span>}
          </div>

          {/* List of matches */}
          <div className="max-h-72 overflow-y-auto divide-y divide-slate-200/10">
            {isSearching ? (
              <div className="p-6 text-center text-xs font-semibold opacity-70 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-pink-500" />
                <span>Searching TMDB database & Filipino cinema...</span>
              </div>
            ) : results.length > 0 ? (
              results.map((movie) => {
                const duplicate = checkIsDuplicate(movie.title, movie.id);
                return (
                  <button
                    key={movie.id}
                    type="button"
                    onClick={() => handleSelect(movie)}
                    className={`w-full p-2.5 sm:p-3 text-left flex items-start gap-3 transition-colors ${
                      isKuromi ? 'hover:bg-purple-950/40' : 'hover:bg-sky-50/70'
                    }`}
                  >
                    {/* Poster Thumbnail */}
                    <div className="w-10 h-14 rounded-lg overflow-hidden bg-slate-800 shrink-0 border border-slate-700/50 flex items-center justify-center">
                      {movie.poster_thumb ? (
                        <img
                          src={movie.poster_thumb}
                          alt={movie.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <Film className="w-5 h-5 opacity-40 text-pink-400" />
                      )}
                    </div>

                    {/* Movie Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-black text-xs sm:text-sm truncate max-w-[240px] sm:max-w-xs">
                          {movie.title}
                        </span>
                        {movie.year && (
                          <span className="text-[11px] font-bold opacity-60">
                            ({movie.year})
                          </span>
                        )}

                        {/* Filipino Badge */}
                        {movie.is_filipino && (
                          <span className="px-1.5 py-0.2 rounded-md text-[10px] font-black bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-xs">
                            🇵🇭 Pinoy
                          </span>
                        )}

                        {/* Korean Badge */}
                        {movie.is_korean && (
                          <span className="px-1.5 py-0.2 rounded-md text-[10px] font-black bg-purple-500 text-white">
                            🇰🇷 K-Movie
                          </span>
                        )}

                        {/* Duplicate In-Catalog Badge */}
                        {duplicate && (
                          <span className="px-1.5 py-0.2 rounded-md text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-0.5">
                            <Check className="w-2.5 h-2.5" /> In Watchlist
                          </span>
                        )}
                      </div>

                      {/* Genre Pills */}
                      {movie.genre_names && movie.genre_names.length > 0 && (
                        <div className="flex items-center gap-1 mt-1 flex-wrap">
                          {movie.genre_names.slice(0, 3).map((g, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-500/10 opacity-80"
                            >
                              {g}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Brief Overview Snippet */}
                      {movie.overview && (
                        <p className="text-[11px] opacity-70 truncate mt-1">
                          {movie.overview}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })
            ) : errorMessage ? (
              <div className="p-5 text-center space-y-1.5">
                <AlertCircle className="w-5 h-5 text-amber-500 mx-auto" />
                <p className="text-xs font-bold text-amber-500">{errorMessage}</p>
                <p className="text-[11px] opacity-70">
                  You can type the title manually into the form below!
                </p>
              </div>
            ) : (
              /* No Results */
              <div className="p-6 text-center space-y-2">
                <p className="text-sm font-black">No movies found for "{query}" 🥺</p>
                <p className="text-xs opacity-70 max-w-xs mx-auto">
                  Try checking the spelling, or feel free to type your title manually in the fields below.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Selected Movie Preview Card (Shows when selected) */}
      {selectedMoviePreview && (
        <div className={`mt-3 p-3.5 rounded-2xl border flex items-start gap-3.5 transition-all animate-fade-in ${
          selectedMoviePreview.isDuplicate
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
            : isKuromi
              ? 'bg-purple-950/40 border-pink-500/40 text-slate-100'
              : 'bg-rose-50/80 border-pink-200 text-slate-800'
        }`}>
          {/* Poster Preview */}
          {selectedMoviePreview.poster_url && (
            <img
              src={selectedMoviePreview.poster_url}
              alt={selectedMoviePreview.title}
              className="w-14 h-20 rounded-xl object-cover shadow-md shrink-0 border border-pink-400/40"
            />
          )}

          <div className="flex-1 min-w-0 text-xs space-y-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-black text-sm text-pink-500 truncate">
                {selectedMoviePreview.title}
              </span>
              {selectedMoviePreview.year && (
                <span className="font-bold opacity-75">({selectedMoviePreview.year})</span>
              )}
              {selectedMoviePreview.is_filipino && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-rose-500 text-white">
                  🇵🇭 Pinoy
                </span>
              )}
            </div>

            <p className="font-bold flex items-center gap-2">
              <span>Auto-Categorized Genre:</span>
              <span className="px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-400 border border-pink-500/30 font-black">
                {selectedMoviePreview.genre}
              </span>
            </p>

            <p className="opacity-80 text-[11px]">
              Duration: <span className="font-bold">{selectedMoviePreview.duration}</span> • Streaming: <span className="font-bold">{selectedMoviePreview.streaming}</span>
            </p>

            {/* Duplicate Notice */}
            {selectedMoviePreview.isDuplicate && (
              <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[11px] font-bold mt-1 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>
                  Already in Watchlist! (Status: {selectedMoviePreview.duplicateMovie?.watched ? 'Watched 💕' : 'Want to watch 🍿'})
                </span>
              </div>
            )}

            {/* 1-Click Direct Add button */}
            {onAddDirect && (
              <div className="pt-1.5">
                <button
                  type="button"
                  onClick={() => {
                    playSuccessFanfare();
                    onAddDirect(selectedMoviePreview);
                  }}
                  className="px-3 py-1.5 rounded-xl font-black text-xs text-white bg-gradient-to-r from-pink-600 to-purple-600 hover:opacity-95 shadow-md flex items-center gap-1.5 transition-transform active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>+ Add Directly to Watchlist 🍿</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
