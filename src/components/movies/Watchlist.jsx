import React, { useState, useMemo } from 'react';
import { Plus, Trash2, CheckCircle, Heart, Film, Sparkles, Link as LinkIcon, Layers, Check, ListPlus, Loader2 } from 'lucide-react';
import { saveMovie, saveMoviesBatch, deleteMovie, toggleMovieReaction } from '../../utils/storage';
import { MOVIE_GENRES } from '../../data/defaultMovies';
import { analyzeMovieInput } from '../../utils/smartParsers';
import { findSequelsAndPrequels } from '../../utils/movieFranchises';
import { useTheme } from '../../context/ThemeContext';
import { useProfile } from '../../context/ProfileContext';
import { THEME_ASSETS } from '../../data/themeAssets';
import { playPop, playSuccessFanfare } from '../../lib/soundEffects';

export default function Watchlist({ movies }) {
  const { isKuromi } = useTheme();
  const { activeProfile, isMigz } = useProfile();
  const [activeTab, setActiveTab] = useState('unwatched'); // 'unwatched' or 'watched'
  const [profileFilter, setProfileFilter] = useState('all'); // 'all', 'Migz', 'Nekol'
  const [showAddModal, setShowAddModal] = useState(false);
  const [addedBySelect, setAddedBySelect] = useState(activeProfile);

  // Smart Movie Analyzer state
  const [smartMovieInput, setSmartMovieInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Multi-movie list import state (e.g. Letterboxd top 100 lists)
  const [detectedList, setDetectedList] = useState(null); // { listTitle, titles, genre, streaming, sourceUrl }
  const [batchGenre, setBatchGenre] = useState('Filipino Cinema');
  const [batchStreaming, setBatchStreaming] = useState('Letterboxd / Streaming');

  // New movie form state
  const [newTitle, setNewTitle] = useState('');
  const [newGenre, setNewGenre] = useState('Romance');
  const [newDuration, setNewDuration] = useState('');
  const [newStreaming, setNewStreaming] = useState('Netflix');
  const [newNotes, setNewNotes] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const filterList = (list) => {
    if (profileFilter === 'all') return list;
    return list.filter(m => (m.added_by || 'Migz & Nekol').toLowerCase().includes(profileFilter.toLowerCase()));
  };

  const unwatched = filterList(movies.filter(m => !m.watched));
  const watched = filterList(movies.filter(m => m.watched));

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Smart URL or Title Analyzer with Auto-Genre Detection and Multi-Movie List Extraction
  const handleSmartAnalyze = async (overrideInput = null) => {
    const query = (typeof overrideInput === 'string' ? overrideInput : smartMovieInput).trim();
    if (!query) return;
    playPop();
    setIsAnalyzing(true);
    setDetectedList(null);

    try {
      const result = await analyzeMovieInput(query);
      if (result.isList && result.titles?.length > 1) {
        setDetectedList({
          listTitle: result.listTitle || 'Movie Collection',
          titles: result.titles,
          genre: result.genre || 'Filipino Cinema',
          streaming: result.streaming || 'Letterboxd / Streaming',
          sourceUrl: query
        });
        setBatchGenre(result.genre || 'Filipino Cinema');
        setBatchStreaming(result.streaming || 'Letterboxd / Streaming');
        showToast(`🎬 Extracted ${result.titles.length} movies from "${result.listTitle}"!`);
        try { playSuccessFanfare(); } catch {}
      } else {
        setNewTitle(result.title);
        setNewGenre(result.genre || 'Romance');
        setNewDuration(result.duration || '2h');
        setNewStreaming(result.streaming || 'Netflix');
        setNewNotes(result.notes || '');
        try { playSuccessFanfare(); } catch {}
      }
    } catch (err) {
      console.warn('Analysis error:', err);
      setNewTitle(query);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Check for sequels / prequels dynamically based on title or smart input
  const detectedFranchise = useMemo(() => {
    const input = newTitle.trim() || smartMovieInput.trim();
    if (!input) return null;
    return findSequelsAndPrequels(input);
  }, [newTitle, smartMovieInput]);

  const handleSelectPrequelSequel = (item) => {
    playPop();
    setNewTitle(item.title);
    if (item.streaming) setNewStreaming(item.streaming);
    if (item.duration) setNewDuration(item.duration);
    if (detectedFranchise?.genre) setNewGenre(detectedFranchise.genre);
    showToast(`Selected "${item.title}"`);
  };

  const handleAddDirect = async (item) => {
    playPop();
    const movie = {
      id: `mov-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: item.title,
      genre: detectedFranchise?.genre || 'Action & Adventure',
      duration: item.duration || '2h',
      rating: 5,
      watched: false,
      streaming: item.streaming || 'Netflix',
      added_by: addedBySelect || activeProfile,
      notes: `${item.type.toUpperCase()} from ${detectedFranchise?.franchiseName} series 💕`
    };

    await saveMovie(movie);
    try { playSuccessFanfare(); } catch {}
    showToast(`Added "${item.title}" to watchlist! 🍿`);
  };

  const handleAddAllSeries = async () => {
    if (!detectedFranchise) return;
    playPop();
    for (const item of detectedFranchise.movies) {
      // Check if already in list
      const exists = movies.some(m => m.title.toLowerCase() === item.title.toLowerCase());
      if (!exists) {
        await saveMovie({
          id: `mov-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          title: item.title,
          genre: detectedFranchise.genre,
          duration: item.duration || '2h',
          rating: 5,
          watched: false,
          streaming: item.streaming || 'Netflix',
          added_by: addedBySelect || activeProfile,
          notes: `${item.type.toUpperCase()} from ${detectedFranchise.franchiseName} series`
        });
      }
    }
    try { playSuccessFanfare(); } catch {}
    showToast(`Added all ${detectedFranchise.movies.length} movies in ${detectedFranchise.franchiseName}! 🎉`);
    setShowAddModal(false);
  };

  // Add all movies extracted from Letterboxd/Web link
  const handleAddAllListMovies = async () => {
    if (!detectedList || !detectedList.titles?.length) return;
    playPop();
    setIsAnalyzing(true);

    try {
      const newMovies = detectedList.titles.map((title, idx) => ({
        id: `mov-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
        title,
        genre: batchGenre,
        duration: '2h',
        rating: 5,
        watched: false,
        streaming: batchStreaming,
        added_by: addedBySelect || activeProfile,
        notes: `Imported from ${detectedList.listTitle} 💕`
      }));

      await saveMoviesBatch(newMovies);
      try { playSuccessFanfare(); } catch {}
      showToast(`🎉 Added ${newMovies.length} movies from "${detectedList.listTitle}" to Watchlist & Roulette!`);
      setDetectedList(null);
      setSmartMovieInput('');
      setShowAddModal(false);
    } catch (err) {
      console.error('Batch save error:', err);
      showToast('Error saving movies batch');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddMovie = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    // Safety guard: If user enters or pastes a URL in the title box, scrape it rather than saving raw URL as a title!
    if (/^https?:\/\//i.test(newTitle.trim())) {
      await handleSmartAnalyze(newTitle.trim());
      setNewTitle('');
      return;
    }

    playPop();

    const movie = {
      id: `mov-${Date.now()}`,
      title: newTitle.trim(),
      genre: newGenre,
      duration: newDuration.trim() || '2h',
      rating: 5,
      watched: false,
      streaming: newStreaming.trim() || 'Netflix',
      added_by: addedBySelect || activeProfile,
      notes: newNotes.trim() || 'Added to Migz X Nekol movie date list 💕'
    };

    await saveMovie(movie);
    showToast(`Added "${movie.title}" to watchlist! 🍿`);
    setSmartMovieInput('');
    setNewTitle('');
    setNewDuration('');
    setNewNotes('');
    setShowAddModal(false);
  };

  const handleToggleWatched = async (movie) => {
    playPop();
    await saveMovie({
      ...movie,
      watched: !movie.watched,
      watchedAt: !movie.watched ? new Date().toISOString() : null
    });
    showToast(movie.watched ? `Marked "${movie.title}" as unwatched` : `Marked "${movie.title}" as watched! 💕`);
  };

  const handleRateMovie = async (movie, newRating) => {
    playPop();
    await saveMovie({
      ...movie,
      rating: newRating
    });
  };

  const handleDelete = async (id) => {
    playPop();
    const movie = movies.find(m => m.id === id);
    await deleteMovie(id);
    showToast(`Removed "${movie?.title || 'Movie'}" from watchlist`);
  };

  const mascotImg = isKuromi ? THEME_ASSETS.kuromi.movies : THEME_ASSETS.penguin.movies;

  return (
    <div className="space-y-6">
      {/* Toast message */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-[110] px-4 py-2.5 rounded-2xl bg-pink-600 text-white font-bold text-xs shadow-2xl flex items-center gap-2 animate-bounce-slow">
          <Sparkles className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sub-header & Add Button with Character Art */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img 
            src={mascotImg} 
            alt="Cinema Mascot" 
            className="w-11 h-11 rounded-2xl object-cover border-2 shadow-md border-pink-400/50"
          />
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => { playPop(); setActiveTab('unwatched'); }}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-black transition-all ${
                activeTab === 'unwatched'
                  ? isKuromi ? 'bg-pink-600 text-white shadow-md' : 'bg-sky-500 text-white shadow-md'
                  : isKuromi ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🍿 Want to Watch ({unwatched.length})
            </button>
            <button
              type="button"
              onClick={() => { playPop(); setActiveTab('watched'); }}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-black transition-all ${
                activeTab === 'watched'
                  ? isKuromi ? 'bg-purple-600 text-white shadow-md' : 'bg-sky-500 text-white shadow-md'
                  : isKuromi ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              💕 Watched ({watched.length})
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={() => { playPop(); setAddedBySelect(activeProfile); setShowAddModal(true); }}
          className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 text-white shadow-sm transition-all ${
            isKuromi
              ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/25'
              : 'bg-sky-500 hover:bg-sky-400 shadow-sky-500/25'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Movie / Link / Series</span>
        </button>
      </div>

      {/* Profile Filter Tabs */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap text-xs font-bold">
        <span className="text-[11px] opacity-60 mr-1">Filter by Partner:</span>
        <button
          type="button"
          onClick={() => { playPop(); setProfileFilter('all'); }}
          className={`px-2.5 py-1 rounded-xl transition-all ${
            profileFilter === 'all'
              ? 'bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm'
              : 'opacity-60 hover:opacity-100'
          }`}
        >
          All ({movies.length})
        </button>
        <button
          type="button"
          onClick={() => { playPop(); setProfileFilter('Migz'); }}
          className={`px-2.5 py-1 rounded-xl transition-all flex items-center gap-1 ${
            profileFilter === 'Migz'
              ? 'bg-sky-500 text-white shadow-sm'
              : 'opacity-60 hover:opacity-100 text-sky-500'
          }`}
        >
          <span>🐧</span>
          <span>Migz's Picks ({movies.filter(m => (m.added_by || '').includes('Migz')).length})</span>
        </button>
        <button
          type="button"
          onClick={() => { playPop(); setProfileFilter('Nekol'); }}
          className={`px-2.5 py-1 rounded-xl transition-all flex items-center gap-1 ${
            profileFilter === 'Nekol'
              ? 'bg-pink-500 text-white shadow-sm'
              : 'opacity-60 hover:opacity-100 text-pink-500'
          }`}
        >
          <span>🖤</span>
          <span>Nekol's Picks ({movies.filter(m => (m.added_by || '').includes('Nekol')).length})</span>
        </button>
      </div>

      {/* Movies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(activeTab === 'unwatched' ? unwatched : watched).map((movie) => (
          <div
            key={movie.id}
            className={`p-5 rounded-3xl border transition-all ${
              isKuromi
                ? 'bg-[#181426] border-[#382d54] hover:border-pink-500/50 text-white'
                : 'bg-white border-slate-200 hover:border-sky-300 shadow-sm text-slate-900'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Attribution Badge */}
                  {movie.added_by?.includes('Migz') && !movie.added_by?.includes('Nekol') ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-sky-500/15 text-sky-400 border border-sky-500/30">
                      🐧 Added by Migz
                    </span>
                  ) : movie.added_by?.includes('Nekol') && !movie.added_by?.includes('Migz') ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-pink-500/15 text-pink-400 border border-pink-500/30">
                      🖤 Added by Nekol
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-500/15 text-purple-400 border border-purple-500/30">
                      💕 Added by Both
                    </span>
                  )}

                  <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-pink-500/20 text-pink-500 border border-pink-500/30">
                    {movie.genre}
                  </span>
                  {movie.streaming && (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-500/20 text-slate-400">
                      📺 {movie.streaming}
                    </span>
                  )}
                  {movie.duration && (
                    <span className="text-[11px] font-bold opacity-60">⏳ {movie.duration}</span>
                  )}
                </div>

                <h4 className="font-black text-base sm:text-lg font-heading mt-1">
                  {movie.title}
                </h4>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleToggleWatched(movie)}
                  title={movie.watched ? "Mark as unwatched" : "Mark as watched"}
                  className={`p-2 rounded-xl transition-colors ${
                    movie.watched
                      ? 'text-emerald-400 hover:bg-emerald-500/10'
                      : 'text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10'
                  }`}
                >
                  <CheckCircle className={`w-5 h-5 ${movie.watched ? 'fill-emerald-500/20' : ''}`} />
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(movie.id)}
                  className="p-2 rounded-xl text-rose-400 hover:text-white hover:bg-rose-600 transition-colors"
                  title="Delete movie"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {movie.notes && (
              <p className={`mt-2 text-xs sm:text-sm font-medium italic line-clamp-2 ${
                isKuromi ? 'text-slate-300' : 'text-slate-700'
              }`}>
                "{movie.notes}"
              </p>
            )}

            {/* Live Couple Reactions Bar */}
            <div className="mt-3 pt-2.5 border-t border-slate-500/15 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1 text-xs">
                <span className="text-[10px] font-bold opacity-60 mr-1">React:</span>
                {[
                  { emoji: '🍿', text: "Let's watch!" },
                  { emoji: '😍', text: "Must see!" },
                  { emoji: '😴', text: "Pass muna" }
                ].map((reaction) => {
                  const isSelected = movie.reactions?.[activeProfile] === reaction.emoji;
                  return (
                    <button
                      key={reaction.emoji}
                      type="button"
                      onClick={async () => {
                        playPop();
                        await toggleMovieReaction(movie.id, activeProfile, reaction.emoji);
                      }}
                      className={`px-2 py-1 rounded-lg text-xs font-bold border transition-all flex items-center gap-1 ${
                        isSelected
                          ? 'bg-pink-500 text-white border-pink-500 shadow-sm scale-105'
                          : isKuromi
                            ? 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-pink-500/40'
                            : 'bg-slate-100 border-slate-200 text-slate-700 hover:border-pink-300'
                      }`}
                      title={`${reaction.text} (React as ${activeProfile})`}
                    >
                      <span>{reaction.emoji}</span>
                    </button>
                  );
                })}
              </div>

              {/* Display Partner & User Active Reactions */}
              <div className="flex items-center gap-1.5 text-[11px] font-bold">
                {movie.reactions?.Migz && (
                  <span className="px-2 py-0.5 rounded-md bg-sky-500/15 text-sky-400 border border-sky-500/30">
                    🐧 Migz: {movie.reactions.Migz}
                  </span>
                )}
                {movie.reactions?.Nekol && (
                  <span className="px-2 py-0.5 rounded-md bg-pink-500/15 text-pink-400 border border-pink-500/30">
                    🖤 Nekol: {movie.reactions.Nekol}
                  </span>
                )}
              </div>
            </div>

            {/* Heart Rating Bar */}
            <div className="mt-2.5 pt-2 border-t border-slate-500/10 flex items-center justify-between">
              <span className="text-xs font-bold opacity-60">
                {movie.watched ? 'Couple Rating:' : 'Anticipation Level:'}
              </span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => handleRateMovie(movie, star)}
                    className="p-1 hover:scale-125 transition-transform"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        star <= (movie.rating || 5)
                          ? 'text-pink-500 fill-pink-500'
                          : 'text-slate-500/40'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}

        {(activeTab === 'unwatched' ? unwatched : watched).length === 0 && (
          <div className="col-span-full py-12 text-center opacity-60">
            <Film className="w-12 h-12 mx-auto mb-2 opacity-40 text-pink-400" />
            <p className="font-bold text-sm">
              {activeTab === 'unwatched' 
                ? 'No unwatched movies right now! Add your favorite series above.' 
                : 'No watched movies yet. Watch something cozy together!'}
            </p>
          </div>
        )}
      </div>

      {/* Add Movie Modal with Prequel & Sequel Detector */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className={`w-full max-w-lg max-h-[92vh] overflow-y-auto p-6 rounded-3xl border shadow-2xl ${
            isKuromi 
              ? 'bg-[#181426] border-[#382d54] text-white' 
              : 'bg-white border-sky-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-black font-heading flex items-center gap-2">
                <span>Add Movie or Series</span>
                <span>🎬</span>
              </h3>
              <img 
                src={mascotImg} 
                alt="Cinema Mascot" 
                className="w-9 h-9 rounded-full object-cover border border-pink-400"
              />
            </div>
            
            <p className="text-xs font-semibold opacity-75 mb-4">
              Enter a link, movie title, or franchise to auto-detect genres, prequels & sequels!
            </p>

            {/* Smart Analyzer Box */}
            <div className={`p-4 rounded-2xl border mb-4 ${
              isKuromi ? 'bg-purple-950/40 border-purple-800' : 'bg-sky-50 border-sky-200'
            }`}>
              <label className="block text-xs font-extrabold mb-1.5 flex items-center gap-1 text-pink-500">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Smart Title, Link & Franchise Detector</span>
              </label>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Paste Letterboxd list, IMDb link, or movie title..."
                  value={smartMovieInput}
                  onChange={(e) => setSmartMovieInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSmartAnalyze();
                    }
                  }}
                  className={`flex-1 px-3.5 py-2.5 rounded-xl border text-xs font-semibold outline-none ${
                    isKuromi 
                      ? 'bg-slate-900 border-purple-900 text-white focus:border-pink-500' 
                      : 'bg-white border-slate-300 text-slate-900 focus:border-sky-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => handleSmartAnalyze()}
                  disabled={isAnalyzing || !smartMovieInput.trim()}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs text-white shrink-0 shadow-sm transition-transform active:scale-95 disabled:opacity-50 flex items-center gap-1.5 ${
                    isKuromi ? 'bg-pink-600 hover:bg-pink-500' : 'bg-sky-500 hover:bg-sky-400'
                  }`}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Extracting...</span>
                    </>
                  ) : (
                    <span>Auto-Fill ✨</span>
                  )}
                </button>
              </div>
            </div>

            {/* Interactive Multi-Movie List Extractor Card (Letterboxd, IMDb lists, etc.) */}
            {detectedList && (
              <div className={`p-4 rounded-2xl border mb-4 animate-fade-in ${
                isKuromi ? 'bg-purple-950/50 border-pink-500/70 shadow-lg shadow-purple-950/30' : 'bg-rose-50/80 border-pink-300 shadow-md'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Film className="w-4 h-4 text-pink-500 animate-pulse" />
                    <span className="text-xs font-black text-pink-500 uppercase tracking-wide">
                      🎬 {detectedList.listTitle}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDetectedList(null)}
                    className="text-[11px] font-bold text-slate-400 hover:text-rose-500 transition-colors"
                  >
                    Dismiss
                  </button>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-pink-500/20 text-pink-400 border border-pink-500/30">
                    {detectedList.titles.length} Movies Detected!
                  </span>
                  <span className="text-[11px] font-medium opacity-80">
                    Ready to bulk add to your catalog & roulette
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider opacity-75 mb-1">
                      Catalog Genre
                    </label>
                    <select
                      value={batchGenre}
                      onChange={(e) => setBatchGenre(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl border font-bold text-xs outline-none ${
                        isKuromi ? 'bg-slate-900 border-purple-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    >
                      {MOVIE_GENRES.filter(g => g !== 'All Genres').map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider opacity-75 mb-1">
                      Streaming / Source
                    </label>
                    <input
                      type="text"
                      value={batchStreaming}
                      onChange={(e) => setBatchStreaming(e.target.value)}
                      placeholder="e.g. Letterboxd, Cinema, Netflix"
                      className={`w-full px-3 py-2 rounded-xl border font-semibold text-xs outline-none ${
                        isKuromi ? 'bg-slate-900 border-purple-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                {/* Batch Add All Button */}
                <button
                  type="button"
                  onClick={handleAddAllListMovies}
                  disabled={isAnalyzing}
                  className={`w-full py-2.5 px-4 rounded-xl font-black text-xs text-white shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 mb-3 ${
                    isKuromi ? 'bg-gradient-to-r from-pink-600 to-purple-600 hover:opacity-95' : 'bg-gradient-to-r from-pink-500 to-rose-600 hover:opacity-95'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>+ Add All {detectedList.titles.length} Movies to Catalog & Roulette 🍿</span>
                </button>

                {/* Scrollable Preview List */}
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider opacity-60 sticky top-0 bg-inherit py-0.5">
                    Preview of Movies in this List:
                  </p>
                  {detectedList.titles.map((title, idx) => (
                    <div
                      key={idx}
                      className={`px-3 py-1.5 rounded-xl border flex items-center justify-between gap-2 text-xs transition-colors ${
                        isKuromi ? 'bg-slate-900/70 border-purple-900/40 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                      }`}
                    >
                      <span className="font-semibold truncate text-[11px]">
                        <span className="opacity-50 mr-1.5 font-mono">#{idx + 1}</span>
                        {title}
                      </span>
                      <button
                        type="button"
                        onClick={async () => {
                          playPop();
                          const movie = {
                            id: `mov-${Date.now()}-${idx}`,
                            title,
                            genre: batchGenre,
                            duration: '2h',
                            rating: 5,
                            watched: false,
                            streaming: batchStreaming,
                            notes: `From ${detectedList.listTitle} 💕`
                          };
                          await saveMovie(movie);
                          showToast(`Added "${title}"! 🍿`);
                        }}
                        className="text-[10px] font-black px-2 py-0.5 rounded bg-pink-600 hover:bg-pink-500 text-white shrink-0 shadow-sm"
                      >
                        + Add
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Interactive Prequel & Sequel Picker */}
            {detectedFranchise && (
              <div className={`p-4 rounded-2xl border mb-4 animate-fade-in ${
                isKuromi ? 'bg-pink-950/30 border-pink-700/60' : 'bg-rose-50 border-rose-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-pink-500" />
                    <span className="text-xs font-black text-pink-500 uppercase tracking-wide">
                      {detectedFranchise.franchiseName} ({detectedFranchise.movies.length} Installments)
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddAllSeries}
                    className="text-[11px] font-black underline text-pink-500 hover:text-pink-400"
                  >
                    + Add Entire Series
                  </button>
                </div>

                <p className="text-[11px] font-semibold opacity-80 mb-2.5">
                  Pick which sequel or prequel you want to watch:
                </p>

                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {detectedFranchise.movies.map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-2 rounded-xl border flex items-center justify-between gap-2 text-xs transition-colors ${
                        newTitle === item.title 
                          ? isKuromi ? 'bg-pink-900/60 border-pink-500 text-white' : 'bg-rose-100 border-pink-400 text-slate-900'
                          : isKuromi ? 'bg-slate-900/60 border-purple-900/40 hover:bg-slate-800' : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            item.type.includes('prequel') 
                              ? 'bg-amber-500/20 text-amber-400'
                              : item.type.includes('original') 
                                ? 'bg-emerald-500/20 text-emerald-400' 
                                : 'bg-purple-500/20 text-purple-300'
                          }`}>
                            {item.type}
                          </span>
                          <span className="font-bold truncate">{item.title}</span>
                          {item.year && <span className="opacity-60 text-[10px]">({item.year})</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleSelectPrequelSequel(item)}
                          className={`px-2 py-1 rounded-lg font-bold text-[10px] border ${
                            newTitle === item.title 
                              ? 'bg-pink-600 text-white border-pink-500' 
                              : isKuromi ? 'border-purple-800 hover:bg-purple-900' : 'border-slate-300 hover:bg-slate-100'
                          }`}
                        >
                          Select
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddDirect(item)}
                          className="px-2 py-1 rounded-lg font-bold text-[10px] bg-pink-600 hover:bg-pink-500 text-white"
                          title="Directly add this movie to watchlist"
                        >
                          + Add
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleAddMovie} className="space-y-4 text-xs sm:text-sm">
              <div className="flex items-center justify-between p-2.5 rounded-xl border border-pink-500/30 bg-pink-500/10">
                <span className="font-bold text-xs">Adding to Watchlist as:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => { playPop(); setAddedBySelect('Migz'); }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      addedBySelect === 'Migz'
                        ? 'bg-sky-500 text-white shadow-sm'
                        : 'bg-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    🐧 Migz
                  </button>
                  <button
                    type="button"
                    onClick={() => { playPop(); setAddedBySelect('Nekol'); }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      addedBySelect === 'Nekol'
                        ? 'bg-pink-500 text-white shadow-sm'
                        : 'bg-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    🖤 Nekol
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1 opacity-90">Movie / Series Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Spider-Man: Across the Spider-Verse"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border font-semibold outline-none ${
                    isKuromi 
                      ? 'bg-slate-900 border-purple-900 text-white focus:border-pink-500' 
                      : 'bg-white border-slate-300 text-slate-900 focus:border-sky-500'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1 opacity-90">Genre</label>
                  <select
                    value={newGenre}
                    onChange={(e) => setNewGenre(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl border font-bold outline-none ${
                      isKuromi 
                        ? 'bg-slate-900 border-purple-900 text-white' 
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  >
                    {MOVIE_GENRES.filter(g => g !== 'All Genres').map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1 opacity-90">Streaming On</label>
                  <input
                    type="text"
                    placeholder="Netflix, Disney+, etc."
                    value={newStreaming}
                    onChange={(e) => setNewStreaming(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl border font-semibold outline-none ${
                      isKuromi 
                        ? 'bg-slate-900 border-purple-900 text-white' 
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1 opacity-90">Duration</label>
                <input
                  type="text"
                  placeholder="e.g. 2h 20m"
                  value={newDuration}
                  onChange={(e) => setNewDuration(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border font-semibold outline-none ${
                    isKuromi 
                      ? 'bg-slate-900 border-purple-900 text-white' 
                      : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="block font-bold mb-1 opacity-90">Why should we watch this?</label>
                <textarea
                  rows="2"
                  placeholder="Notes, recommendations, or why you want to watch it with Nekol..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className={`w-full px-4 py-2 rounded-xl border font-medium outline-none ${
                    isKuromi 
                      ? 'bg-slate-900 border-purple-900 text-white focus:border-pink-500' 
                      : 'bg-white border-slate-300 text-slate-900 focus:border-sky-500'
                  }`}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold opacity-75 hover:opacity-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-md ${
                    isKuromi ? 'bg-pink-600 hover:bg-pink-500' : 'bg-sky-500 hover:bg-sky-400'
                  }`}
                >
                  Save to Watchlist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
