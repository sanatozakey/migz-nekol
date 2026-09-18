import React, { useState, useEffect } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import { THEME_ASSETS } from '../data/themeAssets';
import { useProfile } from '../context/ProfileContext';
import { playPop, isAudioMuted, subscribeAudioMute } from '../lib/soundEffects';

export default function Header({ onOpenSettings }) {
  const { toggleTheme, isKuromi } = useTheme();
  const { activeProfile, toggleProfile, isMigz, myEmoji, partnerName } = useProfile();
  const [muted, setMuted] = useState(() => isAudioMuted());

  useEffect(() => {
    const unsub = subscribeAudioMute((val) => setMuted(val));
    return () => unsub();
  }, []);

  return (
    <header className={`sticky top-0 z-30 w-full border-b backdrop-blur-md transition-colors duration-300 ${
      isKuromi 
        ? 'bg-[#0a0812]/95 border-[#271d3d] text-white shadow-lg shadow-purple-950/20' 
        : 'bg-white/95 border-sky-100 text-slate-800 shadow-sm'
    }`}>
      <div className="max-w-5xl mx-auto px-3.5 sm:px-6 h-16 sm:h-18 flex items-center justify-between gap-2">
        {/* Brand & Logo with Official Character Art */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className={`relative shrink-0 w-9 h-9 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center overflow-hidden border shadow-md transition-transform hover:scale-105 ${
            isKuromi 
              ? 'bg-purple-950/60 border-purple-700/60' 
              : 'bg-sky-50 border-sky-200'
          }`}>
            <img 
              src={isKuromi ? THEME_ASSETS.kuromi.heroAvatar : THEME_ASSETS.penguin.heroAvatar} 
              alt={isKuromi ? "Kuromi" : "Penguin"} 
              className="w-full h-full object-cover"
            />
            {/* Subtle live cloud sync status dot right on avatar badge */}
            <span 
              title={isSupabaseConfigured ? "Live Cloud Synced (Supabase)" : "Local Storage Mode"}
              className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 ${
                isKuromi ? 'border-[#0a0812]' : 'border-white'
              } ${isSupabaseConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} 
            />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1 sm:gap-1.5">
              <h1 className="text-base sm:text-2xl font-black font-heading tracking-tight truncate">
                Migz <span className="text-pink-500 font-normal">X</span> Nekol
              </h1>
              <span className="text-pink-500 text-xs sm:text-base animate-pulse shrink-0">💕</span>
            </div>
          </div>
        </div>

        {/* Right Controls - Modern & Clean (Profile, Theme, Settings) */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* 1. Active Profile Switcher Pill */}
          <button
            onClick={() => { playPop(); toggleProfile(); }}
            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-black border shadow-sm transition-all hover:scale-105 active:scale-95 shrink-0 ${
              isMigz
                ? isKuromi ? 'bg-sky-950/70 border-sky-600/70 text-sky-300' : 'bg-sky-50 border-sky-300 text-sky-700'
                : isKuromi ? 'bg-pink-950/70 border-pink-600/70 text-pink-300' : 'bg-rose-50 border-pink-300 text-pink-700'
            }`}
            title={`Currently browsing as ${activeProfile}. Tap to switch to ${partnerName}!`}
          >
            <span>{myEmoji}</span>
            <span className="font-extrabold">{activeProfile}</span>
          </button>

          {/* 2. One-Tap Theme Mascot Switcher */}
          <button
            onClick={() => { playPop(); toggleTheme(); }}
            className={`relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-2xl border transition-all hover:scale-105 active:scale-95 shadow-sm shrink-0 ${
              isKuromi 
                ? 'bg-purple-950/70 border-pink-500/60 text-pink-300 hover:border-pink-400' 
                : 'bg-sky-50 border-sky-300 text-sky-800 hover:bg-sky-100'
            }`}
            title={`Toggle to ${isKuromi ? 'Noot Noot 🐧' : 'Kuromi 🖤'} Theme`}
          >
            <img 
              src={isKuromi ? THEME_ASSETS.kuromi.heroAvatar : THEME_ASSETS.penguin.heroAvatar} 
              alt="Theme Mascot" 
              className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover border border-pink-400/40"
            />
          </button>

          {/* 3. Settings & Shortcuts Drawer Button */}
          <button
            onClick={() => { playPop(); onOpenSettings(); }}
            className={`relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-2xl border transition-all hover:scale-105 active:scale-95 shadow-sm shrink-0 ${
              isKuromi
                ? 'border-purple-800/60 bg-purple-950/50 text-purple-200 hover:bg-purple-900/60'
                : 'border-sky-200 bg-white text-slate-700 hover:bg-sky-50'
            }`}
            title="Open Couple Settings & Shortcuts ⚙️"
          >
            <SlidersHorizontal className="w-4 h-4" />
            {/* Red dot if sound muted */}
            {muted && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-400 border border-white" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
