import React from 'react';
import { Smartphone, Download, Share, PlusSquare, CheckCircle2, X, Sparkles } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { THEME_ASSETS } from '../../data/themeAssets';
import { playPop } from '../../lib/soundEffects';

export default function InstallAppModal({ isOpen, onClose, onInstallDirect, canInstallDirect, isIos }) {
  const { isKuromi } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center pt-[calc(env(safe-area-inset-top,0px)+1rem)] pb-[calc(env(safe-area-inset-bottom,0px)+1rem)] px-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className={`w-full max-w-md max-h-[85dvh] overflow-y-auto p-6 rounded-3xl border shadow-2xl relative ${
        isKuromi ? 'bg-[#181426] border-[#382d54] text-white' : 'bg-white border-sky-200 text-slate-800'
      }`}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full opacity-60 hover:opacity-100 transition-opacity"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Mascot & Heading */}
        <div className="text-center space-y-3 mb-5">
          <div className="relative w-16 h-16 mx-auto rounded-3xl overflow-hidden border-2 border-pink-400 shadow-lg bg-pink-100 flex items-center justify-center">
            <img
              src={isKuromi ? THEME_ASSETS.kuromi.heroAvatar : THEME_ASSETS.penguin.heroAvatar}
              alt="Couple App Icon"
              className="w-full h-full object-cover"
            />
          </div>

          <h3 className="text-xl font-black font-heading flex items-center justify-center gap-2">
            <span>Install Migz X Nekol</span>
            <span>📲</span>
          </h3>

          <p className="text-xs font-semibold opacity-80 max-w-xs mx-auto">
            Install on your phone's home screen for a 100% full-screen app experience without browser URL bars!
          </p>
        </div>

        {/* Benefits Pill */}
        <div className={`p-3 rounded-2xl border mb-5 space-y-1.5 text-xs font-bold ${
          isKuromi ? 'bg-purple-950/40 border-purple-800/40 text-purple-200' : 'bg-sky-50 border-sky-200 text-sky-800'
        }`}>
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-pink-400 shrink-0" />
            <span>Opens like a real App Store / Play Store app</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-pink-400 shrink-0" />
            <span>Instant startup & offline caching</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-pink-400 shrink-0" />
            <span>Cute couple app icon right on your home screen</span>
          </div>
        </div>

        {/* Direct Install Button (Android / Chrome) */}
        {canInstallDirect ? (
          <div className="space-y-3">
            <button
              onClick={() => { playPop(); onInstallDirect(); }}
              className={`w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 text-white shadow-lg transition-transform active:scale-95 ${
                isKuromi
                  ? 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 shadow-pink-500/25'
                  : 'bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-500 hover:to-blue-600 shadow-sky-400/25'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>Install to Home Screen Now</span>
            </button>
            <p className="text-[11px] text-center opacity-60">Tap "Install" when the browser prompt appears.</p>
          </div>
        ) : (
          /* Step-by-Step Instructions (iOS Safari / Other) */
          <div className="space-y-3">
            <div className={`p-3.5 rounded-2xl border space-y-2.5 text-xs ${
              isKuromi ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-pink-500 text-white flex items-center justify-center font-black text-[11px] shrink-0">1</span>
                <div>
                  <p className="font-bold flex items-center gap-1.5">
                    <span>Tap the</span>
                    <span className="px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-400 font-extrabold flex items-center gap-1">
                      <Share className="w-3 h-3" /> Share button
                    </span>
                  </p>
                  <p className="text-[11px] opacity-70">Located at the bottom of Safari on iPhone or browser menu.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-pink-500 text-white flex items-center justify-center font-black text-[11px] shrink-0">2</span>
                <div>
                  <p className="font-bold flex items-center gap-1.5">
                    <span>Select</span>
                    <span className="px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-400 font-extrabold flex items-center gap-1">
                      <PlusSquare className="w-3 h-3" /> Add to Home Screen
                    </span>
                  </p>
                  <p className="text-[11px] opacity-70">Scroll down in the share menu until you see the plus icon.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-pink-500 text-white flex items-center justify-center font-black text-[11px] shrink-0">3</span>
                <div>
                  <p className="font-bold">Tap "Add" in top-right corner!</p>
                  <p className="text-[11px] opacity-70">The app will now sit on your home screen ready to use anytime 💕</p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className={`w-full py-2.5 rounded-xl font-bold text-xs text-center border transition-all ${
                isKuromi ? 'border-purple-800/60 hover:bg-purple-900/60' : 'border-slate-200 hover:bg-slate-100'
              }`}
            >
              Got it!
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
