import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Dices, Film, Heart, CheckCircle2, Plus, ListFilter, Play } from 'lucide-react';
import { MOVIE_GENRES } from '../../data/defaultMovies';
import { getMovies, saveMovie, subscribeStorage } from '../../utils/storage';
import { playTick, playSuccessFanfare, playPop } from '../../lib/soundEffects';
import { useTheme } from '../../context/ThemeContext';
import { THEME_ASSETS } from '../../data/themeAssets';
import Watchlist from './Watchlist';

export default function MovieRoulette() {
  const { isKuromi } = useTheme();
  const mascotImg = isKuromi ? THEME_ASSETS.kuromi.movies : THEME_ASSETS.penguin.movies;
  const [movies, setMovies] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('All Genres');
  const [profilePool, setProfilePool] = useState('all'); // 'all', 'Migz', 'Nekol'
  const [viewMode, setViewMode] = useState('roulette'); // 'roulette' or 'watchlist'
  
  // Roulette spinning state
  const [isSpinning, setIsSpinning] = useState(false);
  const [highlightedMovie, setHighlightedMovie] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const spinTimerRef = useRef(null);

  // Load movies
  const loadData = async () => {
    const list = await getMovies();
    setMovies(list);
  };

  useEffect(() => {
    loadData();
    const unsub = subscribeStorage(loadData);
    return () => unsub();
  }, []);

  // Filter unwatched movies by partner pool and selected genre
  const unwatchedMovies = movies.filter(m => !m.watched);
  const poolMovies = unwatchedMovies.filter(m => {
    if (profilePool === 'all') return true;
    return (m.added_by || 'Migz & Nekol').toLowerCase().includes(profilePool.toLowerCase());
  });

  const filteredCandidates = selectedGenre === 'All Genres' 
    ? poolMovies 
    : poolMovies.filter(m => m.genre === selectedGenre);

  // Spin Roulette Wheel / Randomizer
  const handleSpin = () => {
    if (filteredCandidates.length === 0) return;
    playPop();
    setIsSpinning(true);
    setSelectedMovie(null);

    let step = 0;
    const totalSteps = 28 + Math.floor(Math.random() * 8);
    let speed = 40;

    const runStep = () => {
      step++;
      const randomCandidate = filteredCandidates[Math.floor(Math.random() * filteredCandidates.length)];
      setHighlightedMovie(randomCandidate);
      playTick();

      if (step < totalSteps) {
        if (step > totalSteps - 10) {
          speed += 30; // Decelerate towards end
        }
        spinTimerRef.current = setTimeout(runStep, speed);
      } else {
        // Finished!
        setIsSpinning(false);
        const finalWinner = filteredCandidates[Math.floor(Math.random() * filteredCandidates.length)];
        setHighlightedMovie(finalWinner);
        setSelectedMovie(finalWinner);
        playSuccessFanfare();
        confetti({
          particleCount: 70,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    };

    runStep();
  };

  const handleInstantPick = () => {
    if (filteredCandidates.length === 0) return;
    playPop();
    const pick = filteredCandidates[Math.floor(Math.random() * filteredCandidates.length)];
    setHighlightedMovie(pick);
    setSelectedMovie(pick);
    playSuccessFanfare();
  };

  const handleMarkWatched = async (movie) => {
    playPop();
    await saveMovie({
      ...movie,
      watched: true,
      watchedAt: new Date().toISOString()
    });
    setSelectedMovie(null);
    setHighlightedMovie(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Top Controls: View Toggle (Roulette vs Watchlist) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img 
            src={mascotImg} 
            alt="Cinema Mascot" 
            className="w-12 h-12 rounded-2xl object-cover border-2 shadow-md border-pink-400/50"
          />
          <div>
            <h2 className="text-2xl sm:text-3xl font-black font-heading flex items-center gap-2">
              <span>Movie Night Roulette</span>
              <span>🎬</span>
            </h2>
            <p className="text-xs sm:text-sm font-semibold opacity-75">
              Can't decide what to watch? Let fate pick a cozy date movie for Migz & Nekol!
            </p>
          </div>
        </div>

        <div className={`flex items-center p-1 rounded-2xl border ${
          isKuromi 
            ? 'bg-[#181426] border-[#382d54]' 
            : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <button
            onClick={() => { playPop(); setViewMode('roulette'); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'roulette'
                ? isKuromi
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-sky-500 text-white shadow-md'
                : 'opacity-70 hover:opacity-100'
            }`}
          >
            🎲 Roulette Wheel
          </button>
          <button
            onClick={() => { playPop(); setViewMode('watchlist'); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'watchlist'
                ? isKuromi
                  ? 'bg-pink-600 text-white shadow-md'
                  : 'bg-sky-500 text-white shadow-md'
                : 'opacity-70 hover:opacity-100'
            }`}
          >
            📋 Watchlist & Watched ({movies.length})
          </button>
        </div>
      </div>

      {viewMode === 'roulette' ? (
        <div className="space-y-4 sm:space-y-6">
          {/* Partner Pool & Genre Filter Controls */}
          <div className="space-y-2.5">
            {/* Partner Pool Filter */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap text-xs font-bold">
              <span className="text-[11px] opacity-70 mr-1">Spin From Pool:</span>
              <button
                type="button"
                disabled={isSpinning}
                onClick={() => { playPop(); setProfilePool('all'); setSelectedMovie(null); }}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  profilePool === 'all'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'opacity-60 hover:opacity-100'
                }`}
              >
                Both of Us 💕 ({unwatchedMovies.length})
              </button>
              <button
                type="button"
                disabled={isSpinning}
                onClick={() => { playPop(); setProfilePool('Migz'); setSelectedMovie(null); }}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
                  profilePool === 'Migz'
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'opacity-60 hover:opacity-100 text-sky-500'
                }`}
              >
                <span>🐧</span>
                <span>Migz's Only ({unwatchedMovies.filter(m => (m.added_by || '').includes('Migz')).length})</span>
              </button>
              <button
                type="button"
                disabled={isSpinning}
                onClick={() => { playPop(); setProfilePool('Nekol'); setSelectedMovie(null); }}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
                  profilePool === 'Nekol'
                    ? 'bg-pink-500 text-white shadow-sm'
                    : 'opacity-60 hover:opacity-100 text-pink-500'
                }`}
              >
                <span>🖤</span>
                <span>Nekol's Only ({unwatchedMovies.filter(m => (m.added_by || '').includes('Nekol')).length})</span>
              </button>
            </div>

            {/* Genre Filter Pills */}
            <div className="overflow-x-auto pb-2 scrollbar-none">
              <div className="flex items-center gap-2 min-w-max">
                <span className="text-xs font-black mr-1 flex items-center gap-1 opacity-80">
                  <ListFilter className="w-3.5 h-3.5" /> Genre:
                </span>
                {MOVIE_GENRES.map(genre => (
                  <button
                    key={genre}
                    disabled={isSpinning}
                    onClick={() => { playPop(); setSelectedGenre(genre); setSelectedMovie(null); }}
                    className={`px-3 py-1.2 rounded-full text-xs font-bold transition-all ${
                      selectedGenre === genre
                        ? isKuromi
                          ? 'bg-pink-500 text-white shadow-sm shadow-pink-500/30 scale-105'
                          : 'bg-sky-500 text-white shadow-sm shadow-sky-400/30 scale-105'
                        : isKuromi
                          ? 'bg-[#181426] border border-[#382d54] text-slate-300 hover:border-pink-400/50'
                          : 'bg-white border border-slate-200 text-slate-700 hover:border-sky-300'
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Roulette Arena */}
          <div className={`relative p-6 sm:p-10 rounded-3xl border text-center transition-all ${
            isKuromi
              ? 'bg-gradient-to-b from-[#181426] to-[#0c0a14] border-[#382d54] shadow-xl shadow-purple-950/20'
              : 'bg-gradient-to-b from-white to-sky-50/70 border-slate-200 shadow-md'
          }`}>
            {/* Spinning card visual */}
            <div className={`relative max-w-md mx-auto min-h-[220px] flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed transition-all duration-200 ${
              isSpinning 
                ? 'border-pink-500 scale-105 bg-pink-500/5 animate-pulse' 
                : isKuromi 
                  ? 'border-purple-800/60 bg-purple-950/20' 
                  : 'border-sky-300 bg-sky-50/50'
            }`}>
              {highlightedMovie ? (
                <div className={`space-y-3 transition-all ${isSpinning ? 'opacity-80 scale-95' : 'opacity-100 scale-100'}`}>
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    {/* Attribution Badge */}
                    {highlightedMovie.added_by?.includes('Migz') && !highlightedMovie.added_by?.includes('Nekol') ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-sky-500/15 text-sky-400 border border-sky-500/30">
                        🐧 Migz's Pick
                      </span>
                    ) : highlightedMovie.added_by?.includes('Nekol') && !highlightedMovie.added_by?.includes('Migz') ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-pink-500/15 text-pink-400 border border-pink-500/30">
                        🖤 Nekol's Pick
                      </span>
                    ) : null}

                    <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-pink-500/20 text-pink-500 border border-pink-500/30">
                      {highlightedMovie.genre}
                    </span>
                    {highlightedMovie.streaming && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-500/20 text-slate-400 border border-slate-500/30">
                        📺 {highlightedMovie.streaming}
                      </span>
                    )}
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-black font-heading text-pink-500">
                    {highlightedMovie.title}
                  </h3>

                  {highlightedMovie.duration && (
                    <p className="text-xs font-bold opacity-75">⏳ {highlightedMovie.duration}</p>
                  )}

                  <p className={`text-sm italic font-medium max-w-sm mx-auto ${isKuromi ? 'text-slate-300' : 'text-slate-700'}`}>
                    "{highlightedMovie.notes || 'Cozy date night pick!'}"
                  </p>
                </div>
              ) : (
                <div className="space-y-3 opacity-60 py-4">
                  <Film className="w-12 h-12 mx-auto animate-bounce-slow" />
                  <p className="font-semibold text-sm">
                    {filteredCandidates.length > 0 
                      ? `Ready with ${filteredCandidates.length} movies in '${selectedGenre}'!` 
                      : 'No unwatched movies in this genre! Check the Watchlist to add some.'}
                  </p>
                </div>
              )}
            </div>

            {/* Spin Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
              <button
                onClick={handleSpin}
                disabled={isSpinning || filteredCandidates.length === 0}
                className={`w-full sm:w-auto flex-1 py-4 px-6 rounded-2xl font-bold text-base flex items-center justify-center gap-2.5 shadow-lg transition-all transform active:scale-95 disabled:opacity-50 ${
                  isKuromi
                    ? 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white shadow-pink-500/25'
                    : 'bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-500 hover:to-blue-600 text-white shadow-sky-400/25'
                }`}
              >
                <Dices className={`w-5 h-5 ${isSpinning ? 'animate-spin' : ''}`} />
                <span>{isSpinning ? 'Spinning Destiny...' : 'Spin the Roulette! 🎲'}</span>
              </button>

              <button
                onClick={handleInstantPick}
                disabled={isSpinning || filteredCandidates.length === 0}
                className={`w-full sm:w-auto py-4 px-5 rounded-2xl font-bold text-xs sm:text-sm border transition-all ${
                  isKuromi
                    ? 'border-kuromi-border bg-kuromi-surface hover:bg-purple-950/40 text-slate-200'
                    : 'border-penguin-200 bg-white hover:bg-sky-50 text-slate-700'
                }`}
              >
                ⚡ Instant Pick
              </button>
            </div>

            {/* Winner Confirmed Action Bar */}
            {selectedMovie && (
              <div className="mt-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 animate-fade-in">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                  <Sparkles className="w-5 h-5" />
                  <span>It's a match! Are we watching <strong>{selectedMovie.title}</strong> tonight?</span>
                </div>
                <button
                  onClick={() => handleMarkWatched(selectedMovie)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Mark as Watched!
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Watchlist & Watched View */
        <Watchlist movies={movies} />
      )}
    </div>
  );
}
