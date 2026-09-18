import React, { useState, useEffect } from 'react';
import { Heart, Sparkles, BatteryCharging, Smile, Send, Edit3, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useProfile } from '../../context/ProfileContext';
import { useTheme } from '../../context/ThemeContext';
import { getCoupleStatus, saveCoupleStatus, sendLovePing, subscribeStorage } from '../../utils/storage';
import { THEME_ASSETS } from '../../data/themeAssets';
import { playPop, playSuccessFanfare } from '../../lib/soundEffects';

const MOOD_PRESETS = [
  { label: 'Craving Boba 🧋', emoji: '🧋' },
  { label: 'Craving Ramen 🍜', emoji: '🍜' },
  { label: 'Craving Fastfood 🍕', emoji: '🍕' },
  { label: 'Missing You 🥺', emoji: '🥺' },
  { label: 'Super In Love 🥰', emoji: '🥰' },
  { label: 'Sleepy & Pagod 😴', emoji: '😴' },
  { label: 'Movie Mode 🎬', emoji: '🎬' },
  { label: 'Busy Working 💻', emoji: '💻' },
  { label: 'Gaming Mode 🎮', emoji: '🎮' },
  { label: 'Hangry! Feed Me 😤', emoji: '😤' }
];

export default function CoupleMoodBar({ onOpenCoupons }) {
  const { isKuromi } = useTheme();
  const { activeProfile, isMigz } = useProfile();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem('lablab_mood_bar_collapsed_v1') === 'true';
    } catch {
      return false;
    }
  });
  const [statuses, setStatuses] = useState({
    migz: { partner_name: 'Migz', mood: 'Craving Ramen 🍜', custom_status: 'Missing my bebe Nekol! 💕', battery_level: 100 },
    nekol: { partner_name: 'Nekol', mood: 'Craving Boba 🧋', custom_status: 'Thinking of Migz 🖤', battery_level: 100 }
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPingModal, setShowPingModal] = useState(false);
  const [customText, setCustomText] = useState('');
  const [pingMessage, setPingMessage] = useState('Thinking of you right now! 💕');
  const [selectedMood, setSelectedMood] = useState('Super In Love 🥰');
  const [battery, setBattery] = useState(100);

  const toggleCollapse = () => {
    playPop();
    setIsCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('lablab_mood_bar_collapsed_v1', next ? 'true' : 'false');
      } catch {}
      return next;
    });
  };

  const loadData = async () => {
    const data = await getCoupleStatus();
    if (data) setStatuses(data);
  };

  useEffect(() => {
    loadData();
    const unsub = subscribeStorage(loadData);
    return () => unsub();
  }, []);

  const handleOpenEdit = () => {
    playPop();
    const myKey = activeProfile.toLowerCase();
    const current = statuses[myKey] || {};
    setSelectedMood(current.mood || 'Super In Love 🥰');
    setCustomText(current.custom_status || '');
    setBattery(current.battery_level ?? 100);
    setShowEditModal(true);
  };

  const handleSaveMood = async (e) => {
    e.preventDefault();
    try { playSuccessFanfare(); } catch {}
    await saveCoupleStatus(activeProfile, {
      mood: selectedMood,
      custom_status: customText.trim(),
      battery_level: Number(battery)
    });
    setShowEditModal(false);
  };

  const handleSendPing = async (e) => {
    e.preventDefault();
    playPop();
    await sendLovePing(activeProfile, pingMessage.trim() || 'Thinking of you right now! 💕');
    setShowPingModal(false);
  };

  const migzData = statuses.migz || {};
  const nekolData = statuses.nekol || {};

  return (
    <div className="w-full mb-4 sm:mb-6">
      <div className={`p-4 sm:p-5 rounded-3xl border shadow-md transition-all ${
        isKuromi 
          ? 'bg-[#151022]/90 border-[#2f2347] text-white shadow-purple-950/30' 
          : 'bg-white/90 border-sky-100 text-slate-800 shadow-sky-100/50'
      }`}>
        {/* Top bar header */}
        <div className="flex items-center justify-between gap-2 mb-3 pb-2.5 border-b border-slate-200/20">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <span className="p-1.5 rounded-xl bg-pink-500/20 text-pink-500 shrink-0">
              <Heart className="w-4 h-4 fill-pink-500 animate-pulse" />
            </span>
            <h2 className="text-xs sm:text-sm font-black font-heading tracking-wide uppercase truncate">
              Couple Vibe & Live Status 💕
            </h2>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Love Coupons Button */}
            {onOpenCoupons && (
              <button
                onClick={() => { playPop(); onOpenCoupons(); }}
                className="px-2 sm:px-3 py-1 rounded-xl text-xs font-black border transition-all flex items-center gap-1.5 bg-gradient-to-r from-amber-500/20 to-pink-500/20 text-amber-500 border-amber-400/40 hover:scale-105"
                title="Open Couple Love Coupons"
              >
                <span>🎟️</span>
                <span className="hidden sm:inline">Love Coupons</span>
              </button>
            )}

            {/* Quick Send Ping */}
            <button
              onClick={() => { playPop(); setShowPingModal(true); }}
              className="px-2.5 sm:px-3 py-1 rounded-xl text-xs font-black border transition-all flex items-center gap-1.5 bg-pink-500/10 text-pink-500 border-pink-500/30 hover:bg-pink-500 hover:text-white"
            >
              <Send className="w-3 h-3" />
              <span className="hidden xs:inline sm:inline">Send Ping</span>
            </button>

            {/* Collapse / Expand Toggle */}
            <button
              type="button"
              onClick={toggleCollapse}
              className={`p-1.5 rounded-xl border text-xs transition-all ${
                isKuromi 
                  ? 'border-purple-800/60 bg-purple-950/40 text-purple-300 hover:bg-purple-900/60' 
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
              title={isCollapsed ? "Expand Couple Mood Bar" : "Collapse Couple Mood Bar"}
            >
              {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Collapsed Compact View vs Full Side-by-Side Cards */}
        {isCollapsed ? (
          <div className="flex items-center justify-between gap-2 pt-0.5 animate-fade-in">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none text-xs font-bold py-0.5 flex-1 min-w-0">
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl shrink-0 border ${
                isKuromi ? 'bg-sky-950/40 border-sky-800/50 text-sky-200' : 'bg-sky-50 border-sky-200 text-sky-800'
              }`}>
                <span>🐧 Migz:</span>
                <span className="font-extrabold">{migzData.mood || 'Super In Love 🥰'}</span>
                <span className="text-[10px] opacity-75 font-mono">({migzData.battery_level ?? 100}%)</span>
              </div>

              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl shrink-0 border ${
                isKuromi ? 'bg-pink-950/40 border-pink-800/50 text-pink-200' : 'bg-rose-50 border-pink-200 text-pink-800'
              }`}>
                <span>🖤 Nekol:</span>
                <span className="font-extrabold">{nekolData.mood || 'Craving Boba 🧋'}</span>
                <span className="text-[10px] opacity-75 font-mono">({nekolData.battery_level ?? 100}%)</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleOpenEdit}
                className={`px-2.5 py-1 rounded-xl border text-xs font-bold transition-all flex items-center gap-1 ${
                  isKuromi ? 'border-purple-800/60 bg-purple-950/40 text-purple-200 hover:bg-purple-900/60' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
                title="Update My Status"
              >
                <Edit3 className="w-3 h-3 text-pink-400" />
                <span className="hidden sm:inline">Update</span>
              </button>
            </div>
          </div>
        ) : (
          /* Both Partners' Status Cards Side-by-Side */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fade-in">
            {/* Migz Card */}
            <div className={`p-3.5 rounded-2xl border transition-all relative ${
              isMigz ? 'ring-2 ring-sky-400/60' : ''
            } ${
              isKuromi 
                ? 'bg-purple-950/40 border-purple-900/40' 
                : 'bg-sky-50/60 border-sky-200/70'
            }`}>
              <div className="flex items-start gap-3">
                <div className="relative w-12 h-12 rounded-2xl overflow-hidden border border-sky-300 shadow-sm shrink-0 bg-sky-100">
                  <img src={THEME_ASSETS.penguin.heroAvatar} alt="Migz" className="w-full h-full object-cover" />
                  <span className="absolute -bottom-1 -right-1 text-xs">🐧</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-sm sm:text-base font-heading text-sky-400">Migz</span>
                      {isMigz && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-sky-500/20 text-sky-400 border border-sky-500/30">
                          YOU
                        </span>
                      )}
                    </div>

                    {/* Social Battery Indicator */}
                    <div className="flex items-center gap-1 text-[11px] font-bold font-mono text-sky-400">
                      <BatteryCharging className="w-3 h-3" />
                      <span>{migzData.battery_level ?? 100}%</span>
                    </div>
                  </div>

                  {/* Mood Badge */}
                  <div className="mt-1">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                      {migzData.mood || 'Super In Love 🥰'}
                    </span>
                  </div>

                  {/* Custom sweet note */}
                  {migzData.custom_status && (
                    <p className="text-xs opacity-75 italic mt-1 line-clamp-2">
                      "{migzData.custom_status}"
                    </p>
                  )}
                </div>
              </div>

              {isMigz && (
                <button
                  onClick={handleOpenEdit}
                  className="mt-2.5 w-full py-1 rounded-xl text-[11px] font-bold border border-sky-500/30 text-sky-400 hover:bg-sky-500 hover:text-white transition-colors flex items-center justify-center gap-1"
                >
                  <Edit3 className="w-3 h-3" /> Update My Vibe
                </button>
              )}
            </div>

            {/* Nekol Card */}
            <div className={`p-3.5 rounded-2xl border transition-all relative ${
              !isMigz ? 'ring-2 ring-pink-400/60' : ''
            } ${
              isKuromi 
                ? 'bg-pink-950/30 border-pink-900/40' 
                : 'bg-rose-50/60 border-pink-200/70'
            }`}>
              <div className="flex items-start gap-3">
                <div className="relative w-12 h-12 rounded-2xl overflow-hidden border border-pink-300 shadow-sm shrink-0 bg-pink-100">
                  <img src={THEME_ASSETS.kuromi.heroAvatar} alt="Nekol" className="w-full h-full object-cover" />
                  <span className="absolute -bottom-1 -right-1 text-xs">🖤</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-sm sm:text-base font-heading text-pink-400">Nekol</span>
                      {!isMigz && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-pink-500/20 text-pink-400 border border-pink-500/30">
                          YOU
                        </span>
                      )}
                    </div>

                    {/* Social Battery Indicator */}
                    <div className="flex items-center gap-1 text-[11px] font-bold font-mono text-pink-400">
                      <BatteryCharging className="w-3 h-3" />
                      <span>{nekolData.battery_level ?? 100}%</span>
                    </div>
                  </div>

                  {/* Mood Badge */}
                  <div className="mt-1">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30">
                      {nekolData.mood || 'Craving Boba 🧋'}
                    </span>
                  </div>

                  {/* Custom sweet note */}
                  {nekolData.custom_status && (
                    <p className="text-xs opacity-75 italic mt-1 line-clamp-2">
                      "{nekolData.custom_status}"
                    </p>
                  )}
                </div>
              </div>

              {!isMigz && (
                <button
                  onClick={handleOpenEdit}
                  className="mt-2.5 w-full py-1 rounded-xl text-[11px] font-bold border border-pink-500/30 text-pink-400 hover:bg-pink-500 hover:text-white transition-colors flex items-center justify-center gap-1"
                >
                  <Edit3 className="w-3 h-3" /> Update My Vibe
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Edit Mood Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className={`w-full max-w-md p-6 rounded-3xl border shadow-2xl ${
            isKuromi ? 'bg-[#181426] border-[#382d54] text-white' : 'bg-white border-sky-200 text-slate-800'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black font-heading flex items-center gap-2">
                <span>Update Vibe for {activeProfile}</span>
                <span>{isMigz ? '🐧' : '🖤'}</span>
              </h3>
              <button onClick={() => setShowEditModal(false)} className="p-1 rounded-lg opacity-60 hover:opacity-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMood} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold mb-2">Select Your Current Mood / Craving:</label>
                <div className="grid grid-cols-2 gap-2">
                  {MOOD_PRESETS.map((m) => (
                    <button
                      key={m.label}
                      type="button"
                      onClick={() => { playPop(); setSelectedMood(m.label); }}
                      className={`p-2.5 rounded-xl border text-left font-bold text-xs transition-all flex items-center gap-2 ${
                        selectedMood === m.label
                          ? 'bg-pink-500 text-white border-pink-500 shadow-md scale-[1.02]'
                          : isKuromi 
                            ? 'bg-slate-900 border-slate-700 text-slate-300 hover:border-pink-500/50' 
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-sky-300'
                      }`}
                    >
                      <span className="text-base">{m.emoji}</span>
                      <span className="truncate">{m.label.replace(m.emoji, '').trim()}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Custom Sweet Note (Optional):</label>
                <input
                  type="text"
                  placeholder="e.g. Missing you so much today bebe! 💕"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border font-medium outline-none ${
                    isKuromi ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>

              <div>
                <div className="flex items-center justify-between font-bold mb-1">
                  <span>Social / Love Battery:</span>
                  <span className="text-pink-500 font-extrabold">{battery}% 🔋</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={battery}
                  onChange={(e) => setBattery(e.target.value)}
                  className="w-full accent-pink-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-2.5 rounded-xl font-bold border border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/25"
                >
                  Save & Broadcast 💕
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Send Love Ping Modal */}
      {showPingModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className={`w-full max-w-md p-6 rounded-3xl border shadow-2xl ${
            isKuromi ? 'bg-[#181426] border-[#382d54] text-white' : 'bg-white border-sky-200 text-slate-800'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black font-heading flex items-center gap-2">
                <span>Send Love Ping from {activeProfile} 💌</span>
              </h3>
              <button onClick={() => setShowPingModal(false)} className="p-1 rounded-lg opacity-60 hover:opacity-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs sm:text-sm mb-4 opacity-80 leading-relaxed">
              Tapping send will trigger a real-time floating heart burst and notification on <strong>{isMigz ? 'Nekol' : 'Migz'}</strong>'s phone screen!
            </p>

            <form onSubmit={handleSendPing} className="space-y-4">
              <div className="space-y-2">
                {[
                  'Thinking of you right now! 💕',
                  'Sending you a huge tight hug! 🫂✨',
                  'I love you so much my bebe! 🥰',
                  'Eat your food na please! 🍜',
                  'Noot Noot! 🐧💕'
                ].map((msg) => (
                  <button
                    key={msg}
                    type="button"
                    onClick={() => { playPop(); setPingMessage(msg); }}
                    className={`w-full p-2.5 rounded-xl border text-left text-xs font-bold transition-all ${
                      pingMessage === msg
                        ? 'bg-pink-500 text-white border-pink-500'
                        : isKuromi ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    {msg}
                  </button>
                ))}
              </div>

              <input
                type="text"
                placeholder="Or write custom love message..."
                value={pingMessage}
                onChange={(e) => setPingMessage(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-medium outline-none ${
                  isKuromi ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              />

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPingModal(false)}
                  className="flex-1 py-2.5 rounded-xl font-bold border border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/25 flex items-center justify-center gap-1.5"
                >
                  <Send className="w-4 h-4" /> Send Ping Now 💕
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
