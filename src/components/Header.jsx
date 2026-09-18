import React from 'react';
import { Cloud, HardDrive, RefreshCw } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import { THEME_ASSETS } from '../data/themeAssets';

import { useProfile } from '../context/ProfileContext';
import { playPop } from '../lib/soundEffects';

export default function Header({ onResetGatekeeper, onOpenCoupons }) {
  const { theme, toggleTheme, isKuromi } = useTheme();
  const { activeProfile, toggleProfile, isMigz, myEmoji, partnerName } = useProfile();

  return (
    <header className={`sticky top-0 z-30 w-full border-b backdrop-blur-md transition-colors duration-300 ${
      isKuromi 
        ? 'bg-[#0a0812]/95 border-[#271d3d] text-white shadow-lg shadow-purple-950/20' 
        : 'bg-white/95 border-sky-100 text-slate-800 shadow-sm'
    }`}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 sm:h-18 flex items-center justify-between">
        {/* Brand & Logo with Official Character Art */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className={`relative w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center overflow-hidden border shadow-md transition-transform hover:scale-105 ${
            isKuromi 
              ? 'bg-purple-950/60 border-purple-700/60' 
              : 'bg-sky-50 border-sky-200'
          }`}>
            <img 
              src={isKuromi ? THEME_ASSETS.kuromi.heroAvatar : THEME_ASSETS.penguin.heroAvatar} 
              alt={isKuromi ? "Kuromi" : "Penguin"} 
              className="w-full h-full object-cover"
            />
          </div>

          <div>
            <div className="flex items-center gap-1 sm:gap-1.5">
              <h1 className="text-lg sm:text-2xl font-black font-heading tracking-tight">
                Migz <span className="text-pink-500 font-normal">X</span> Nekol
              </h1>
              <span className="text-pink-500 text-sm sm:text-base animate-pulse">💕</span>
            </div>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Active Profile Switcher Pill */}
          <button
            onClick={() => { playPop(); toggleProfile(); }}
            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-black border shadow-sm transition-all hover:scale-105 active:scale-95 ${
              isMigz
                ? isKuromi ? 'bg-sky-950/60 border-sky-600/60 text-sky-300' : 'bg-sky-50 border-sky-300 text-sky-700'
                : isKuromi ? 'bg-pink-950/60 border-pink-600/60 text-pink-300' : 'bg-rose-50 border-pink-300 text-pink-700'
            }`}
            title={`Currently browsing as ${activeProfile}. Tap to switch to ${partnerName}!`}
          >
            <span>{myEmoji}</span>
            <span className="truncate">{activeProfile}</span>
          </button>

          {/* Cloud Sync Status Badge */}
          <div 
            title={isSupabaseConfigured ? "Connected to Supabase Real-Time Cloud" : "Local Storage Mode (Add Supabase keys in Vercel / .env for multi-phone cloud sync)"}
            className={`hidden xs:flex sm:flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold border transition-all ${
              isSupabaseConfigured
                ? isKuromi
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700/60 shadow-sm shadow-emerald-950/50'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-sm'
                : isKuromi
                  ? 'bg-amber-950/40 text-amber-300 border-amber-800/60'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
          >
            {isSupabaseConfigured ? (
              <>
                <Cloud className="w-3 h-3 text-emerald-500 shrink-0 animate-pulse" />
                <span>Cloud</span>
              </>
            ) : (
              <>
                <HardDrive className="w-3 h-3 text-amber-500 shrink-0" />
                <span>Local</span>
              </>
            )}
          </div>

          {/* Character Theme Switcher */}
          <button
            onClick={toggleTheme}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl border transition-all duration-300 shadow-md ${
              isKuromi 
                ? 'bg-purple-950/70 border-pink-500/60 text-pink-300 hover:border-pink-400' 
                : 'bg-sky-50 border-sky-300 text-sky-800 hover:bg-sky-100'
            }`}
            title="Toggle between Noot Noot 🐧 & Kuromi 🖤 Themes"
          >
            <div className="flex items-center gap-1.5 text-xs font-black">
              <img 
                src={isKuromi ? THEME_ASSETS.kuromi.heroAvatar : THEME_ASSETS.penguin.heroAvatar} 
                alt="Theme Mascot" 
                className="w-5 h-5 rounded-full object-cover border border-pink-400/40"
              />
              <span className="hidden sm:inline">{isKuromi ? 'Kuromi 🖤' : 'Noot Noot 🐧'}</span>
            </div>
          </button>

          {/* Reset Gatekeeper Test */}
          <button
            onClick={onResetGatekeeper}
            className={`p-2 rounded-xl text-xs font-medium border transition-colors ${
              isKuromi 
                ? 'border-purple-800/60 bg-purple-950/40 text-purple-200 hover:bg-purple-900/60' 
                : 'border-sky-200 bg-white text-slate-700 hover:bg-sky-50'
            }`}
            title="Re-test Gatekeeper Verification"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
