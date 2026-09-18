import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { ShieldAlert, Heart, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { playSuccessFanfare, startIntruderSiren, stopIntruderSiren, playPop } from '../lib/soundEffects';
import { setUserVerified } from '../utils/storage';
import { useTheme } from '../context/ThemeContext';
import { THEME_ASSETS } from '../data/themeAssets';

import { useProfile } from '../context/ProfileContext';

export default function GatekeeperModal({ onVerified }) {
  const { isKuromi } = useTheme();
  const { setActiveProfile } = useProfile();
  const [intruderMode, setIntruderMode] = useState(false);
  const [soundMuted, setSoundMuted] = useState(false);
  const [noButtonPos, setNoButtonPos] = useState({ x: 0, y: 0 });
  const [evasionCount, setEvasionCount] = useState(0);

  // Runaway button physics
  const handleNoButtonHover = () => {
    playPop();
    const randomX = (Math.random() - 0.5) * 240;
    const randomY = (Math.random() - 0.5) * 160;
    setNoButtonPos({ x: randomX, y: randomY });
    setEvasionCount(prev => prev + 1);
  };

  // If user somehow clicks No
  const handleNoClick = () => {
    setIntruderMode(true);
    if (!soundMuted) {
      startIntruderSiren();
    }
  };

  // User clicked YES - either Nekol or Migz
  const handleSelectIdentity = (profile) => {
    stopIntruderSiren();
    playSuccessFanfare();
    setActiveProfile(profile);

    // Trigger full screen confetti burst
    confetti({
      particleCount: 130,
      spread: 90,
      origin: { y: 0.6 },
      colors: profile === 'Nekol'
        ? ['#f43f5e', '#ec4899', '#a855f7', '#c084fc', '#ffffff'] 
        : ['#38bdf8', '#0284c7', '#fb923c', '#ffffff', '#fda4af']
    });

    setUserVerified(true);
    onVerified();
  };

  const handleRedeem = (profile = 'Nekol') => {
    stopIntruderSiren();
    handleSelectIdentity(profile);
  };

  const toggleSound = () => {
    if (soundMuted) {
      setSoundMuted(false);
      if (intruderMode) startIntruderSiren();
    } else {
      setSoundMuted(true);
      stopIntruderSiren();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pt-[calc(env(safe-area-inset-top,0px)+1rem)] pb-[calc(env(safe-area-inset-bottom,0px)+1rem)] px-4 bg-black/80 backdrop-blur-md">
      {!intruderMode ? (
        // Normal Gatekeeper Dialog
        <div className={`relative w-full max-w-md max-h-[85dvh] overflow-y-auto p-6 sm:p-8 rounded-3xl shadow-2xl border text-center transition-all duration-300 ${
          isKuromi 
            ? 'bg-[#151022] border-[#382b54] text-white shadow-pink-500/20 shadow-2xl' 
            : 'bg-white border-sky-200 text-slate-800 shadow-xl'
        }`}>
          {/* Character Mascots Banner */}
          <div className="flex justify-center items-center gap-3 mb-4">
            <img 
              src={isKuromi ? THEME_ASSETS.kuromi.love : THEME_ASSETS.penguin.love} 
              alt="Love Mascot" 
              className="w-24 h-24 rounded-2xl object-cover border-2 shadow-lg border-pink-400 animate-bounce-slow"
            />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold font-heading mb-1 tracking-wide text-pink-500">
            Halt! Identity Verification 👮‍♂️
          </h2>

          <p className="text-xs sm:text-sm font-semibold opacity-75 mb-4">
            Welcome to <strong>Migz X Nekol</strong> Sanctuary
          </p>

          <div className={`p-4 rounded-2xl mb-5 text-sm sm:text-base font-bold border ${
            isKuromi 
              ? 'bg-purple-950/60 border-purple-800 text-pink-200' 
              : 'bg-rose-50 border-rose-200 text-rose-950'
          }`}>
            Who is accessing our sanctuary today? 🥺👉👈
          </div>

          {evasionCount > 0 && evasionCount < 5 && (
            <p className="text-xs text-pink-500 font-bold mb-3 animate-pulse">
              Nice try! The stranger button is actively dodging your cursor! 😂
            </p>
          )}

          {evasionCount >= 5 && (
            <p className="text-xs text-purple-400 font-bold mb-3">
              Why are you trying so hard to dodge? Aminin mo na kung sino ka! 😤
            </p>
          )}

          {/* Identity Buttons */}
          <div className="space-y-2.5 mb-4">
            <button
              onClick={() => handleSelectIdentity('Nekol')}
              className="w-full py-3.5 px-4 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2 text-white bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 shadow-lg shadow-pink-500/25 transition-all transform hover:scale-[1.02] active:scale-95"
            >
              <Heart className="w-5 h-5 fill-current animate-pulse text-white" />
              <span>I'm Nekol my bebe! 🖤✨</span>
            </button>

            <button
              onClick={() => handleSelectIdentity('Migz')}
              className="w-full py-3.5 px-4 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2 text-white bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600 hover:from-sky-500 hover:to-blue-600 shadow-lg shadow-sky-500/25 transition-all transform hover:scale-[1.02] active:scale-95"
            >
              <span>🐧</span>
              <span>I'm Migz! 🐧❄️</span>
            </button>
          </div>

          {/* The RUNAWAY STRANGER Button */}
          <div className="relative min-h-[50px] flex items-center justify-center">
            <button
              onMouseEnter={handleNoButtonHover}
              onTouchStart={handleNoButtonHover}
              onClick={handleNoClick}
              style={{
                transform: `translate(${noButtonPos.x}px, ${noButtonPos.y}px)`,
                transition: 'transform 0.15s ease-out'
              }}
              className={`px-4 py-2 rounded-xl font-bold text-xs transition-colors ${
                isKuromi
                  ? 'bg-slate-800/80 text-slate-400 hover:bg-slate-700'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              I'm neither / stranger 👻
            </button>
          </div>

          <p className="mt-6 text-xs text-slate-400 font-medium">
            Migz X Nekol Private Sanctuary 🔒
          </p>
        </div>
      ) : (
        // INTRUDER LOCKDOWN SCREEN
        <div className="relative w-full max-w-lg p-6 sm:p-8 rounded-3xl shadow-2xl border-2 border-red-500 bg-[#0c0709] text-white text-center animate-shake">
          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="absolute top-4 right-4 p-2 rounded-full bg-red-950/80 border border-red-500 text-red-300 hover:text-white"
            title="Toggle Alarm Siren"
          >
            {soundMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 animate-pulse" />}
          </button>

          <div className="flex justify-center items-center gap-4 mb-3">
            <img 
              src="/assets/characters/bodyguard_penguin.jpg" 
              alt="Bodyguard Penguin" 
              className="w-20 h-20 rounded-2xl object-cover border-2 border-red-500 shadow-lg shadow-red-500/40 animate-bounce-slow"
            />
            <div className="w-14 h-14 rounded-full bg-red-600/20 border-2 border-red-500 flex items-center justify-center text-red-500 animate-pulse shrink-0">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <img 
              src="/assets/characters/kuromi_angry.jpg" 
              alt="Angry Kuromi" 
              className="w-20 h-20 rounded-2xl object-cover border-2 border-red-500 shadow-lg shadow-red-500/40 animate-bounce-slow"
            />
          </div>

          <div className="inline-block px-4 py-1.5 rounded-full bg-red-600 text-white font-mono font-bold text-xs tracking-widest mb-3 animate-pulse">
            🚨 LEVEL 5 INTRUDER PROTOCOL ACTIVE 🚨
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-red-400 font-heading mb-2">
            ACCESS STRICTLY FORBIDDEN!
          </h2>

          <p className="text-slate-200 text-sm sm:text-base mb-4 leading-relaxed font-medium">
            You clicked <span className="font-bold text-red-400">"No"</span>! Tactical bodyguard penguins (Pingu, Tuxedosam, Badtz-Maru) 🐧🥋 and angry Kuromi squad 😈💣 have been dispatched!
          </p>

          <div className="p-4 rounded-2xl bg-red-950/60 border border-red-800 mb-6 text-left text-xs sm:text-sm font-mono text-red-200 space-y-1">
            <p>🔒 REASON: Unauthorized entity detected.</p>
            <p>🐧 STATUS: Badtz-Maru & Tuxedosam blocking all exits.</p>
            <p>😈 PROTOCOL: Only Nekol has clearance for Migz's heart.</p>
          </div>

          {/* Redemption Section */}
          <div className="bg-slate-900/90 border border-slate-700 rounded-2xl p-5 mb-4">
            <h3 className="font-bold text-sm text-pink-300 mb-2 flex items-center justify-center gap-1.5">
              <Sparkles className="w-4 h-4 text-pink-400" />
              Wait... are you actually teasing with a prank? 🥺
            </h3>
            <p className="text-xs text-slate-300 mb-3">
              If you are Nekol or Migz, tap below to disarm the alarm:
            </p>

            <div className="space-y-2">
              <button
                onClick={() => handleRedeem('Nekol')}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-lg shadow-pink-500/30 transition-all transform hover:scale-[1.02] active:scale-95"
              >
                Wait! Ako talaga si Nekol! Teasing Migz lang! 🥺👉👈💕
              </button>
              <button
                onClick={() => handleRedeem('Migz')}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-lg shadow-sky-500/30 transition-all transform hover:scale-[1.02] active:scale-95"
              >
                Wait! Ako si Migz! Accidental click lang! 🐧❄️
              </button>
            </div>
          </div>

          <p className="text-[11px] text-slate-400">
            Emergency lock will remain in effect until verified.
          </p>
        </div>
      )}
    </div>
  );
}
