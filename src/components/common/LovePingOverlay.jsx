import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Heart, Sparkles, X } from 'lucide-react';
import { subscribeLovePings } from '../../utils/storage';
import { playSuccessFanfare, playPop } from '../../lib/soundEffects';
import { THEME_ASSETS } from '../../data/themeAssets';

export default function LovePingOverlay() {
  const [activePing, setActivePing] = useState(null);

  useEffect(() => {
    const unsub = subscribeLovePings((ping) => {
      setActivePing(ping);
      try { playSuccessFanfare(); } catch {}

      // Heart confetti explosion across screen
      confetti({
        particleCount: 80,
        spread: 100,
        origin: { y: 0.3 },
        colors: ['#f43f5e', '#ec4899', '#a855f7', '#38bdf8', '#fb7185', '#ffffff']
      });

      const timer = setTimeout(() => {
        setActivePing(null);
      }, 6000);

      return () => clearTimeout(timer);
    });

    return () => unsub();
  }, []);

  if (!activePing) return null;

  const isFromMigz = activePing.from === 'Migz';
  const avatar = isFromMigz ? THEME_ASSETS.penguin.heroAvatar : THEME_ASSETS.kuromi.heroAvatar;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] w-[92%] max-w-md animate-bounce-slow">
      <div className="p-4 rounded-3xl border-2 shadow-2xl backdrop-blur-xl bg-gradient-to-r from-pink-500/95 via-purple-600/95 to-pink-500/95 border-pink-300 text-white flex items-center gap-3 shadow-pink-500/40">
        <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-white shadow-md shrink-0 bg-white/20">
          <img 
            src={avatar} 
            alt={activePing.from} 
            className="w-full h-full object-cover"
          />
          <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-white text-xs">
            {isFromMigz ? '🐧' : '🖤'}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-pink-200">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>Love Ping from {activePing.from}!</span>
          </div>
          <p className="text-sm sm:text-base font-extrabold truncate mt-0.5 text-white">
            "{activePing.text || 'Thinking of you! 💕'}"
          </p>
          <span className="text-[10px] font-bold text-pink-200/90">
            Real-time ping via Lablab Cloud 💕
          </span>
        </div>

        <button
          onClick={() => { playPop(); setActivePing(null); }}
          className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors shrink-0 text-white"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
