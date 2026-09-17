import React from 'react';
import { Cloud, HardDrive, RefreshCw } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import { THEME_ASSETS } from '../data/themeAssets';

export default function Header({ onResetGatekeeper }) {
  const { theme, toggleTheme, isKuromi } = useTheme();

  return (
    <header className={`sticky top-0 z-30 w-full border-b backdrop-blur-md transition-colors duration-300 ${
      isKuromi 
        ? 'bg-[#0a0812]/95 border-[#271d3d] text-white shadow-lg shadow-purple-950/20' 
        : 'bg-white/95 border-sky-100 text-slate-800 shadow-sm'
    }`}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 sm:h-18 flex items-center justify-between">
        {/* Brand & Logo with Official Character Art */}
        <div className="flex items-center gap-3">
          <div className={`relative w-11 h-11 rounded-2xl flex items-center justify-center overflow-hidden border shadow-md transition-transform hover:scale-105 ${
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
            <div className="flex items-center gap-1.5">
              <h1 className="text-xl sm:text-2xl font-black font-heading tracking-tight">
                Migz <span className="text-pink-500 font-normal">X</span> Nekol
              </h1>
              <span className="text-pink-500 text-base animate-pulse">💕</span>
            </div>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Cloud Sync Status Badge */}
          <div 
            title={isSupabaseConfigured ? "Connected to Supabase Real-Time Cloud" : "Local Storage Mode (Add Supabase keys in .env for multi-phone cloud sync)"}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
              isSupabaseConfigured
                ? isKuromi
                  ? 'bg-emerald-950/50 text-emerald-300 border-emerald-800/60'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : isKuromi
                  ? 'bg-slate-900 text-slate-300 border-slate-700'
                  : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            {isSupabaseConfigured ? (
              <>
                <Cloud className="w-3.5 h-3.5 text-emerald-500" />
                <span>Cloud Sync</span>
              </>
            ) : (
              <>
                <HardDrive className="w-3.5 h-3.5 text-slate-400" />
                <span>Local Mode</span>
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
