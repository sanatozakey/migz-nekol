import React from 'react';
import { Film, Utensils, Wallet, CalendarHeart } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { playPop } from '../lib/soundEffects';

export const TABS = [
  { id: 'movies', label: 'Movie Roulette', shortLabel: 'Movies', icon: Film, emoji: '🎬' },
  { id: 'food', label: 'Where to Eat', shortLabel: 'Food Trip', icon: Utensils, emoji: '🍽️' },
  { id: 'expenses', label: 'Gastos Tracker', shortLabel: 'Gastos', icon: Wallet, emoji: '💸' },
  { id: 'calendar', label: 'Shared Memories', shortLabel: 'Memories', icon: CalendarHeart, emoji: '📅' }
];

export default function Navigation({ activeTab, setActiveTab }) {
  const { isKuromi } = useTheme();

  const handleTabClick = (tabId) => {
    playPop();
    setActiveTab(tabId);
  };

  return (
    <>
      {/* Desktop & Tablet Navigation (Top Tab Bar) */}
      <nav className="hidden sm:flex justify-center my-6">
        <div className={`flex items-center p-1.5 rounded-2xl border shadow-sm ${
          isKuromi 
            ? 'bg-kuromi-surface border-kuromi-border' 
            : 'bg-white border-penguin-200 shadow-sky-100'
        }`}>
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                  isActive
                    ? isKuromi
                      ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md shadow-pink-500/20'
                      : 'bg-gradient-to-r from-sky-400 to-blue-500 text-white shadow-md shadow-sky-400/20'
                    : isKuromi
                      ? 'text-slate-400 hover:text-white hover:bg-purple-950/30'
                      : 'text-slate-600 hover:text-sky-600 hover:bg-sky-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'animate-bounce-slow' : ''}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile Navigation (Bottom Fixed App Bar) */}
      <nav className={`sm:hidden fixed bottom-0 left-0 right-0 z-40 border-t backdrop-blur-xl transition-colors duration-300 ${
        isKuromi 
          ? 'bg-kuromi-darker/95 border-kuromi-border text-white' 
          : 'bg-white/95 border-penguin-200 text-slate-800'
      }`}>
        <div className="grid grid-cols-4 h-16 max-w-md mx-auto px-2">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`flex flex-col items-center justify-center py-1 relative transition-all duration-200 ${
                  isActive
                    ? isKuromi 
                      ? 'text-pink-400 font-bold' 
                      : 'text-sky-600 font-bold'
                    : isKuromi 
                      ? 'text-slate-400 hover:text-slate-200' 
                      : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {isActive && (
                  <span className={`absolute top-1 w-8 h-1 rounded-full ${
                    isKuromi ? 'bg-pink-500 shadow-pink-500/50 shadow-sm' : 'bg-sky-500 shadow-sky-400/50 shadow-sm'
                  }`} />
                )}
                <Icon className={`w-5 h-5 mb-1 ${isActive ? 'scale-110 -translate-y-0.5' : ''} transition-transform`} />
                <span className="text-[11px] leading-tight">{tab.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
