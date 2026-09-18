import React from 'react';
import { 
  X, 
  Volume2, 
  VolumeX, 
  Download, 
  Smartphone, 
  Ticket, 
  Lock, 
  Cloud, 
  HardDrive, 
  Sparkles, 
  ArrowLeftRight,
  Palette
} from 'lucide-react';
import { THEME_ASSETS } from '../../data/themeAssets';
import { playPop } from '../../lib/soundEffects';

export default function QuickSettingsModal({
  isOpen,
  onClose,
  isKuromi,
  activeProfile,
  onToggleProfile,
  isMigz,
  partnerName,
  muted,
  onToggleMute,
  onOpenInstall,
  isStandalone,
  onOpenCoupons,
  onResetGatekeeper,
  onToggleTheme,
  isSupabaseConfigured
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className={`relative w-full max-w-md rounded-t-3xl sm:rounded-3xl border p-5 sm:p-6 shadow-2xl transition-all max-h-[90dvh] overflow-y-auto ${
        isKuromi 
          ? 'bg-[#161224] border-[#362b50] text-slate-100 shadow-purple-950/50' 
          : 'bg-white border-sky-100 text-slate-800 shadow-sky-100/50'
      }`}>
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-200/20">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚙️</span>
            <div>
              <h3 className="text-base font-black font-heading tracking-tight">
                Couple Controls & Settings
              </h3>
              <p className="text-[11px] font-semibold opacity-70">
                Quick shortcuts for Migz & Nekol 💕
              </p>
            </div>
          </div>
          <button
            onClick={() => { playPop(); onClose(); }}
            className={`p-1.5 rounded-full transition-colors ${
              isKuromi ? 'hover:bg-purple-900/60 text-slate-300' : 'hover:bg-slate-100 text-slate-500'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          {/* Active Profile Identity Switcher Card */}
          <div className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
            isKuromi 
              ? 'bg-purple-950/40 border-purple-800/40' 
              : 'bg-sky-50/70 border-sky-200/70'
          }`}>
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-2xl">{isMigz ? '🐧' : '🖤'}</span>
              <div className="min-w-0">
                <p className="text-[11px] font-bold opacity-70 uppercase tracking-wider">Browsing As</p>
                <p className="text-sm font-black truncate">
                  {activeProfile} <span className="text-pink-500 font-normal">💕</span>
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                playPop();
                onToggleProfile();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black border flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 shadow-sm shrink-0 ${
                isMigz
                  ? isKuromi ? 'bg-pink-900/50 border-pink-500/60 text-pink-200' : 'bg-rose-100 border-pink-300 text-pink-700'
                  : isKuromi ? 'bg-sky-900/50 border-sky-500/60 text-sky-200' : 'bg-sky-100 border-sky-300 text-sky-700'
              }`}
              title={`Switch profile to ${partnerName}`}
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Switch to {partnerName}</span>
            </button>
          </div>

          {/* Theme Switcher Row */}
          <div className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
            isKuromi ? 'bg-slate-900/50 border-slate-800/80' : 'bg-slate-50 border-slate-200/80'
          }`}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl overflow-hidden border border-pink-400/40 shrink-0">
                <img 
                  src={isKuromi ? THEME_ASSETS.kuromi.heroAvatar : THEME_ASSETS.penguin.heroAvatar} 
                  alt="Theme Avatar"
                  className="w-full h-full object-cover" 
                />
              </div>
              <div>
                <p className="text-xs font-black">Theme Style</p>
                <p className="text-[11px] opacity-70">
                  {isKuromi ? 'Kuromi Dark 🖤' : 'Pingu & Tuxedosam 🐧'}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                playPop();
                onToggleTheme();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all hover:scale-105 active:scale-95 ${
                isKuromi
                  ? 'bg-purple-900/40 border-purple-700 text-purple-200 hover:bg-purple-900/60'
                  : 'bg-white border-sky-200 text-sky-800 hover:bg-sky-50'
              }`}
            >
              Swap Theme
            </button>
          </div>

          {/* Sound Effects Toggle Row */}
          <div className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
            isKuromi ? 'bg-slate-900/50 border-slate-800/80' : 'bg-slate-50 border-slate-200/80'
          }`}>
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-xl shrink-0 ${
                muted 
                  ? 'bg-red-500/20 text-red-400' 
                  : 'bg-emerald-500/20 text-emerald-400'
              }`}>
                {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </div>
              <div>
                <p className="text-xs font-black">Sound Effects</p>
                <p className="text-[11px] opacity-70">
                  {muted ? 'Silent mode (all sounds off)' : 'Interactive pops, fanfare & ticks'}
                </p>
              </div>
            </div>

            <button
              onClick={onToggleMute}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all hover:scale-105 active:scale-95 ${
                muted
                  ? 'bg-red-500/20 border-red-500/40 text-red-400 hover:bg-red-500/30'
                  : isKuromi
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30'
                    : 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              {muted ? 'Unmute 🔊' : 'Mute 🔇'}
            </button>
          </div>

          {/* Install App Row */}
          <div className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
            isKuromi ? 'bg-slate-900/50 border-slate-800/80' : 'bg-slate-50 border-slate-200/80'
          }`}>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-pink-500/20 text-pink-400 shrink-0">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-black">App Installation</p>
                <p className="text-[11px] opacity-70">
                  {isStandalone ? 'Installed as native app ✨' : 'Add to Home Screen (Full Screen)'}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                playPop();
                onClose();
                onOpenInstall();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all hover:scale-105 active:scale-95 ${
                isStandalone
                  ? 'opacity-60 cursor-default border-slate-700'
                  : isKuromi
                    ? 'bg-pink-600/30 border-pink-500/50 text-pink-300 hover:bg-pink-600/50'
                    : 'bg-pink-50 border-pink-300 text-pink-600 hover:bg-pink-100'
              }`}
            >
              {isStandalone ? 'Installed' : 'Install 📲'}
            </button>
          </div>

          {/* Love Coupons Shortcut Row */}
          {onOpenCoupons && (
            <div className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
              isKuromi ? 'bg-slate-900/50 border-slate-800/80' : 'bg-slate-50 border-slate-200/80'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
                  <Ticket className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-black">Love Coupons</p>
                  <p className="text-[11px] opacity-70">
                    Redeem hug, kiss, massage & date passes
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  playPop();
                  onClose();
                  onOpenCoupons();
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all hover:scale-105 active:scale-95 ${
                  isKuromi
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30'
                    : 'bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100'
                }`}
              >
                View 🎟️
              </button>
            </div>
          )}

          {/* Lock App / Gatekeeper Re-test */}
          <div className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
            isKuromi ? 'bg-slate-900/50 border-slate-800/80' : 'bg-slate-50 border-slate-200/80'
          }`}>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-black">Gatekeeper Lock</p>
                <p className="text-[11px] opacity-70">
                  Lock app & require anniversary code
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                playPop();
                onClose();
                onResetGatekeeper();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all hover:scale-105 active:scale-95 ${
                isKuromi
                  ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Lock 🔒
            </button>
          </div>
        </div>

        {/* Modal Footer / Cloud Status */}
        <div className="mt-5 pt-3.5 border-t border-slate-200/20 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${
              isSupabaseConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
            }`} />
            <span className="font-bold opacity-80">
              {isSupabaseConfigured ? 'Live Cloud Synced (Supabase)' : 'Local Storage Mode'}
            </span>
          </div>

          <span className="opacity-50 text-[11px] font-semibold">
            Migz X Nekol 💕
          </span>
        </div>
      </div>
    </div>
  );
}
