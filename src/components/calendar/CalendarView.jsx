import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Heart, Calendar, Image as ImageIcon, Sparkles, Plus, ZoomIn, X } from 'lucide-react';
import { getMemories, saveMemory, deleteMemory, subscribeStorage } from '../../utils/storage';
import { useTheme } from '../../context/ThemeContext';
import { THEME_ASSETS } from '../../data/themeAssets';
import { playPop } from '../../lib/soundEffects';
import DayDetailModal from './DayDetailModal';

export default function CalendarView() {
  const { isKuromi } = useTheme();
  const mascotImg = isKuromi ? THEME_ASSETS.kuromi.love : THEME_ASSETS.penguin.love;
  const [memories, setMemories] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [activeLightbox, setActiveLightbox] = useState(null);
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'scrapbook'
  const [scrapbookPartnerFilter, setScrapbookPartnerFilter] = useState('all'); // 'all', 'Nekol', 'Migz'

  // Escape key listener for lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setActiveLightbox(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredMemories = memories.filter(mem => {
    if (scrapbookPartnerFilter === 'all') return true;
    return mem.captured_by === scrapbookPartnerFilter;
  });

  const loadData = async () => {
    const list = await getMemories();
    setMemories(list);
  };

  useEffect(() => {
    loadData();
    const unsub = subscribeStorage(loadData);
    return () => unsub();
  }, []);

  const handleSaveMemory = async (newMemory) => {
    setMemories(prev => [newMemory, ...prev]);
    await saveMemory(newMemory);
  };

  const handleDeleteMemory = async (id) => {
    playPop();
    setMemories(prev => prev.filter(m => m.id !== id));
    await deleteMemory(id);
  };

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const prevMonth = () => {
    playPop();
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    playPop();
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    playPop();
    setCurrentDate(new Date());
  };

  const todayStr = new Date().toISOString().split('T')[0];

  // Helper to get formatted YYYY-MM-DD
  const getDateKey = (day) => {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  };

  // Milestone calculations: 19th of every month = Monthsary, June 19th = Anniversary
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentDateNum = now.getDate();

  const isToday19th = currentDateNum === 19;
  const isTodayAnniversary = isToday19th && currentMonth === 5; // June is month index 5

  // Days until next 19th (Monthsary)
  let nextMonthsaryDate = new Date(currentYear, currentMonth, 19);
  if (currentDateNum > 19) {
    nextMonthsaryDate = new Date(currentYear, currentMonth + 1, 19);
  }
  const diffMonthsary = nextMonthsaryDate.getTime() - new Date(currentYear, currentMonth, currentDateNum).getTime();
  const daysUntilMonthsary = Math.round(diffMonthsary / (1000 * 60 * 60 * 24));

  // Days until next June 19th (Anniversary)
  let nextAnniversaryDate = new Date(currentYear, 5, 19);
  if (currentMonth > 5 || (currentMonth === 5 && currentDateNum > 19)) {
    nextAnniversaryDate = new Date(currentYear + 1, 5, 19);
  }
  const diffAnniversary = nextAnniversaryDate.getTime() - new Date(currentYear, currentMonth, currentDateNum).getTime();
  const daysUntilAnniversary = Math.round(diffAnniversary / (1000 * 60 * 60 * 24));

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Top Header & View Toggle */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold font-heading flex items-center gap-2">
            <span>Shared Love Calendar & Scrapbook</span>
            <span>📅</span>
          </h2>
          <p className="text-xs sm:text-sm opacity-75">
            Preserve every precious date, milestone, and picture with Nekol 💕
          </p>
        </div>

        <div className={`flex items-center p-1 rounded-2xl border ${
          isKuromi 
            ? 'bg-kuromi-surface border-kuromi-border' 
            : 'bg-white border-penguin-200 shadow-sm'
        }`}>
          <button
            onClick={() => { playPop(); setViewMode('calendar'); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'calendar'
                ? isKuromi ? 'bg-purple-600 text-white shadow-md' : 'bg-sky-500 text-white shadow-md'
                : 'opacity-70 hover:opacity-100'
            }`}
          >
            📅 Calendar Grid
          </button>
          <button
            onClick={() => { playPop(); setViewMode('scrapbook'); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'scrapbook'
                ? isKuromi ? 'bg-pink-600 text-white shadow-md' : 'bg-sky-500 text-white shadow-md'
                : 'opacity-70 hover:opacity-100'
            }`}
          >
            📸 Love Scrapbook ({memories.length})
          </button>
        </div>
      </div>

      {/* Couple Milestone Countdown Banner */}
      <div className={`p-4 sm:p-5 rounded-3xl border transition-all flex flex-col sm:flex-row items-center justify-between gap-4 ${
        isKuromi 
          ? 'bg-gradient-to-r from-pink-950/40 via-purple-950/40 to-slate-900 border-pink-500/40 kuromi-glow' 
          : 'bg-gradient-to-r from-pink-50 via-sky-50 to-blue-50 border-pink-200 penguin-glow'
      }`}>
        <div className="flex items-center gap-3.5 text-center sm:text-left">
          <img 
            src={mascotImg} 
            alt="Love Milestone Mascot" 
            className="w-12 h-12 rounded-2xl object-cover border-2 shadow-md border-pink-400 shrink-0"
          />
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="font-extrabold text-base sm:text-lg text-pink-500 font-heading">
                {isTodayAnniversary
                  ? '💍 HAPPY ANNIVERSARY TODAY! (June 19th) 🥂'
                  : isToday19th
                    ? '💖 HAPPY MONTHSARY TODAY! (19th) 💕'
                    : 'Our Special Dates (Every 19th & June 19th)'}
              </span>
            </div>
            <p className="text-xs opacity-75 mt-0.5">
              {isTodayAnniversary 
                ? 'Celebrating our anniversary! Another year of endless love with Nekol!'
                : isToday19th 
                  ? 'Another month of loving my bebe lablab! Time for a special date!' 
                  : 'Every 19th is our monthsary, and June 19th is our grand anniversary! 🥂'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {!isToday19th && (
            <div className="px-3.5 py-2 rounded-2xl bg-pink-500/15 border border-pink-500/30 text-center">
              <span className="text-[10px] block opacity-70 font-bold uppercase tracking-wider">Next Monthsary</span>
              <span className="text-xs sm:text-sm font-extrabold text-pink-500 font-heading">
                {daysUntilMonthsary === 0 ? 'Today! 💖' : daysUntilMonthsary === 1 ? 'Tomorrow! 💖' : `In ${daysUntilMonthsary} days 💖`}
              </span>
            </div>
          )}

          {!isTodayAnniversary && (
            <div className="px-3.5 py-2 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-center">
              <span className="text-[10px] block opacity-70 font-bold uppercase tracking-wider">Next Anniversary</span>
              <span className="text-xs sm:text-sm font-extrabold text-amber-500 font-heading">
                {daysUntilAnniversary === 0 ? 'Today! 💍' : daysUntilAnniversary === 1 ? 'Tomorrow! 💍' : `In ${daysUntilAnniversary} days 💍`}
              </span>
            </div>
          )}
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <div className={`p-4 sm:p-6 rounded-3xl border transition-all ${
          isKuromi 
            ? 'bg-kuromi-surface border-kuromi-border kuromi-glow' 
            : 'bg-white border-penguin-200 shadow-sm penguin-glow'
        }`}>
          {/* Calendar Month Controls */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <h3 className="text-xl sm:text-2xl font-bold font-heading">
                {monthNames[month]} {year}
              </h3>
              <button
                onClick={goToToday}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                  isKuromi 
                    ? 'border-kuromi-border bg-slate-900 text-purple-300 hover:bg-slate-800' 
                    : 'border-penguin-200 bg-sky-50 text-sky-700 hover:bg-sky-100'
                }`}
              >
                Today
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={prevMonth}
                className="p-2 rounded-xl border border-slate-700/30 hover:bg-slate-500/10"
                title="Previous month"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextMonth}
                className="p-2 rounded-xl border border-slate-700/30 hover:bg-slate-500/10"
                title="Next month"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-xs font-bold opacity-60 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="py-1">{d}</div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {/* Empty slots before first day */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[64px] sm:min-h-[85px] rounded-2xl opacity-20" />
            ))}

            {/* Month Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateKey = getDateKey(day);
              const dayMemories = memories.filter(m => m.date === dateKey);
              const isToday = dateKey === todayStr;
              const hasMemories = dayMemories.length > 0;
              const hasPhoto = dayMemories.some(m => m.photo_url);

              const is19th = day === 19;
              const isAnniversary = is19th && month === 5; // June is month index 5
              const isMonthsary = is19th && !isAnniversary;

              return (
                <button
                  key={day}
                  onClick={() => { playPop(); setSelectedDate(dateKey); }}
                  className={`min-h-[68px] sm:min-h-[90px] p-1.5 sm:p-2 rounded-2xl border text-left flex flex-col justify-between transition-all group relative overflow-hidden ${
                    isAnniversary
                      ? 'border-2 border-amber-400 bg-gradient-to-br from-amber-500/25 via-pink-500/20 to-purple-600/25 ring-2 ring-amber-400/60 shadow-lg shadow-amber-500/20 scale-[1.03] z-10'
                      : isMonthsary
                        ? 'border-2 border-pink-500 bg-pink-500/20 ring-2 ring-pink-500/40 shadow-md shadow-pink-500/20 scale-[1.02] z-10'
                        : isToday
                          ? isKuromi
                            ? 'border-pink-500 bg-pink-950/20 ring-2 ring-pink-500/30'
                            : 'border-sky-400 bg-sky-50 ring-2 ring-sky-400/30'
                          : isKuromi
                            ? 'border-kuromi-border/60 bg-slate-900/40 hover:bg-purple-950/30 hover:border-pink-500/40'
                            : 'border-slate-100 bg-slate-50/50 hover:bg-sky-50/70 hover:border-sky-200'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={`text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ${
                      isAnniversary
                        ? 'bg-gradient-to-r from-amber-500 to-pink-500 text-white font-extrabold shadow-sm'
                        : isMonthsary
                          ? 'bg-pink-500 text-white font-extrabold shadow-sm'
                          : isToday 
                            ? 'bg-pink-500 text-white' 
                            : 'opacity-80'
                    }`}>
                      {day}
                    </span>

                    <div className="flex items-center gap-1">
                      {isAnniversary && (
                        <span className="text-xs animate-bounce-slow" title="Grand Anniversary! 💍">💍</span>
                      )}
                      {isMonthsary && (
                        <span className="text-xs animate-pulse" title="Happy Monthsary! 💖">💖</span>
                      )}
                      {hasMemories && (
                        <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500 animate-pulse" />
                      )}
                    </div>
                  </div>

                  {/* Special Milestone Tag on Date */}
                  {isAnniversary && (
                    <div className="w-full mt-1 px-1.5 py-0.5 rounded bg-amber-500/30 border border-amber-400/40 text-[9px] font-black text-amber-300 truncate tracking-tight uppercase">
                      💍 Anniversary!
                    </div>
                  )}
                  {isMonthsary && (
                    <div className="w-full mt-1 px-1.5 py-0.5 rounded bg-pink-500/30 border border-pink-400/40 text-[9px] font-black text-pink-300 truncate tracking-tight uppercase">
                      💖 Monthsary!
                    </div>
                  )}

                  {/* Badges or photo preview on date cell */}
                  {hasMemories && (
                    <div className="w-full mt-1">
                      {hasPhoto ? (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-pink-400 truncate">
                          <ImageIcon className="w-3 h-3 shrink-0" />
                          <span className="hidden sm:inline truncate">{dayMemories[0].title}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-semibold opacity-75 truncate block">
                          {dayMemories[0].title}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Tap hint */}
                  <span className="text-[9px] opacity-0 group-hover:opacity-60 transition-opacity self-end hidden sm:block">
                    + log
                  </span>
                </button>
              );
            })}
          </div>

          <p className="text-center text-xs opacity-60 mt-4">
            💡 Tap any day to add a photo, write what happened, or look back at romantic moments!
          </p>
        </div>
      ) : (
        /* Polaroid Scrapbook Feed */
        <div className="space-y-6">
          {/* Top Scrapbook Action Bar */}
          <div className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 ${
            isKuromi ? 'bg-[#151022] border-[#352b52]' : 'bg-white border-sky-200 shadow-sm'
          }`}>
            <div>
              <h3 className="font-black text-base sm:text-lg font-heading flex items-center gap-2">
                <span>Our Couple Scrapbook Wall</span>
                <span>📸</span>
              </h3>
              <p className={`text-xs font-semibold ${isKuromi ? 'text-slate-300' : 'text-slate-700'}`}>
                Photo memories and date journal entries with Nekol ({filteredMemories.length} saved)
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
              {/* Partner Filter Pills */}
              <div className="flex items-center gap-1.5">
                {[
                  { id: 'all', label: 'All 💕' },
                  { id: 'Nekol', label: 'Nekol 🖤' },
                  { id: 'Migz', label: 'Migz 🐧' }
                ].map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => { playPop(); setScrapbookPartnerFilter(p.id); }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      scrapbookPartnerFilter === p.id
                        ? isKuromi ? 'bg-pink-600 text-white shadow-sm' : 'bg-sky-500 text-white shadow-sm'
                        : isKuromi ? 'bg-purple-950/40 text-purple-200 border border-purple-900/60' : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  playPop();
                  setSelectedDate(new Date().toISOString().split('T')[0]);
                }}
                className={`w-full sm:w-auto px-4 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 text-white shadow-md transition-transform active:scale-95 ${
                  isKuromi ? 'bg-pink-600 hover:bg-pink-500 shadow-pink-500/25' : 'bg-sky-500 hover:bg-sky-400 shadow-sky-500/25'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Memory / Photo</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {filteredMemories.map(mem => (
              <div
                key={mem.id}
                className={`p-5 rounded-3xl border transition-all ${
                  isKuromi
                    ? 'bg-[#181426] border-[#382d54] hover:border-pink-500/60 text-white'
                    : 'bg-white border-slate-200 shadow-md hover:border-sky-300 text-slate-900'
                }`}
              >
                {/* Polaroid Frame */}
                {mem.photo_url ? (
                  <div 
                    onClick={() => { playPop(); setActiveLightbox(mem); }}
                    className="w-full aspect-[4/3] rounded-2xl overflow-hidden mb-3 border border-slate-200/40 bg-black/10 relative group cursor-pointer"
                    title="Click to view full photo 🔍"
                  >
                    <img
                      src={mem.photo_url}
                      alt={mem.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="px-3 py-1.5 rounded-full bg-black/70 text-white backdrop-blur-sm border border-white/20 shadow-lg flex items-center gap-1.5 text-xs font-bold transform translate-y-1 group-hover:translate-y-0 transition-transform">
                        <ZoomIn className="w-3.5 h-3.5 text-pink-400" />
                        <span>Enlarge Photo</span>
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className={`w-full aspect-[16/9] rounded-2xl flex flex-col items-center justify-center mb-3 border border-dashed ${
                    isKuromi ? 'border-purple-800/60 bg-purple-950/30' : 'border-sky-300 bg-sky-50/70'
                  }`}>
                    <Heart className="w-8 h-8 text-pink-500 mb-1" />
                    <span className={`text-xs font-bold ${isKuromi ? 'text-purple-300' : 'text-sky-800'}`}>Love Journal Entry</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs flex-wrap gap-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full font-extrabold bg-pink-500/20 text-pink-500 border border-pink-500/30">
                        {mem.mood}
                      </span>
                      {mem.captured_by && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          mem.captured_by === 'Nekol'
                            ? 'bg-pink-500/15 text-pink-400 border border-pink-500/30'
                            : mem.captured_by === 'Migz'
                              ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                              : 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                        }`}>
                          📸 {mem.captured_by}
                        </span>
                      )}
                    </div>
                    <span className={`font-bold ${isKuromi ? 'text-slate-300' : 'text-slate-700'}`}>
                      {new Date(mem.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  <h4 className="text-lg font-black font-heading mt-1">
                    {mem.title}
                  </h4>

                  {mem.notes && (
                    <p className={`text-xs sm:text-sm font-medium italic leading-relaxed p-2.5 rounded-xl border ${
                      isKuromi 
                        ? 'bg-purple-950/30 border-purple-900/40 text-slate-200' 
                        : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}>
                      "{mem.notes}"
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/20 flex justify-end">
                  <button
                    onClick={() => handleDeleteMemory(mem.id)}
                    className="text-xs font-semibold text-slate-400 hover:text-red-500 flex items-center gap-1"
                  >
                    Delete entry
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredMemories.length === 0 && (
            <div className="py-16 text-center opacity-60">
              <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="font-semibold text-sm">No memories recorded yet for this view!</p>
            </div>
          )}
        </div>
      )}

      {/* Day Detail & Upload Modal */}
      {selectedDate && (
        <DayDetailModal
          date={selectedDate}
          memories={memories}
          onClose={() => setSelectedDate(null)}
          onSaveMemory={handleSaveMemory}
          onDeleteMemory={handleDeleteMemory}
        />
      )}

      {/* Photo Fullscreen Lightbox Modal */}
      {activeLightbox && (
        <div 
          onClick={() => setActiveLightbox(null)}
          className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-fade-in cursor-zoom-out"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full max-h-[92vh] flex flex-col items-center cursor-default"
          >
            {/* Close Button */}
            <button
              onClick={() => setActiveLightbox(null)}
              className="absolute -top-11 right-0 sm:top-2 sm:right-2 z-10 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm border border-white/20 transition-transform active:scale-90"
              title="Close full photo (Esc)"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Main Image */}
            <div className="rounded-3xl overflow-hidden shadow-2xl border border-white/10 max-h-[72vh] flex items-center justify-center bg-black/50">
              <img
                src={activeLightbox.photo_url}
                alt={activeLightbox.title}
                className="max-h-[72vh] w-auto max-w-full object-contain rounded-2xl select-none"
              />
            </div>

            {/* Bottom Caption Bar */}
            <div className="mt-3 w-full max-w-2xl px-4 sm:px-5 py-3 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-pink-500/30 text-pink-300 border border-pink-400/40">
                    {activeLightbox.mood}
                  </span>
                  {activeLightbox.captured_by && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/30 text-purple-200 border border-purple-400/40">
                      📸 Captured by {activeLightbox.captured_by}
                    </span>
                  )}
                  <span className="text-xs opacity-75 font-semibold">
                    {new Date(activeLightbox.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <h3 className="font-extrabold text-base sm:text-lg truncate">
                  {activeLightbox.title}
                </h3>
                {activeLightbox.notes && (
                  <p className="text-xs opacity-85 italic line-clamp-2 mt-0.5">
                    "{activeLightbox.notes}"
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
