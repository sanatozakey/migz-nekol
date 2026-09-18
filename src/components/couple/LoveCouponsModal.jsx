import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Ticket, Sparkles, Check, Plus, X, Heart, Gift } from 'lucide-react';
import { useProfile } from '../../context/ProfileContext';
import { useTheme } from '../../context/ThemeContext';
import { getCoupons, redeemCoupon, saveCoupon, subscribeStorage } from '../../utils/storage';
import { playPop, playSuccessFanfare } from '../../lib/soundEffects';

export default function LoveCouponsModal({ isOpen, onClose }) {
  const { isKuromi } = useTheme();
  const { activeProfile, isMigz } = useProfile();
  const [coupons, setCoupons] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'available', 'redeemed'
  const [showAddModal, setShowAddModal] = useState(false);

  // New coupon form
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Sweet Treat 🎁');
  const [newForUser, setNewForUser] = useState('Both');

  const loadData = async () => {
    const list = await getCoupons();
    setCoupons(list);
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
    const unsub = subscribeStorage(loadData);
    return () => unsub();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRedeem = async (coupon) => {
    playPop();
    try { playSuccessFanfare(); } catch {}

    // Confetti explosion
    confetti({
      particleCount: 110,
      spread: 90,
      origin: { y: 0.5 },
      colors: ['#f43f5e', '#ec4899', '#a855f7', '#fbbf24', '#ffffff']
    });

    await redeemCoupon(coupon.id, activeProfile);
  };

  const handleAddCoupon = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try { playSuccessFanfare(); } catch {}
    const coupon = {
      id: `coup-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      emoji: '🎟️',
      for_user: newForUser,
      is_redeemed: false,
      redeemed_by: null,
      redeemed_at: null,
      created_at: new Date().toISOString()
    };

    await saveCoupon(coupon);
    setNewTitle('');
    setShowAddModal(false);
  };

  const filtered = coupons.filter(c => {
    if (activeFilter === 'available') return !c.is_redeemed;
    if (activeFilter === 'redeemed') return c.is_redeemed;
    return true;
  });

  const availableCount = coupons.filter(c => !c.is_redeemed).length;
  const redeemedCount = coupons.filter(c => c.is_redeemed).length;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center pt-[calc(env(safe-area-inset-top,0px)+0.75rem)] pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] px-3 sm:px-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className={`w-full max-w-2xl max-h-[85dvh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden ${
        isKuromi ? 'bg-[#151022] border-[#382b54] text-white' : 'bg-white border-sky-200 text-slate-800'
      }`}>
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black font-heading flex items-center gap-2">
                <span>Migz & Nekol Love Coupons 🎟️</span>
              </h2>
              <p className="text-xs opacity-75">
                Redeem sweet couple perks in real-time!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => { playPop(); setShowAddModal(true); }}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-pink-500 text-white hover:bg-pink-600 transition-all flex items-center gap-1 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add Coupon</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl opacity-60 hover:opacity-100 transition-opacity"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="px-4 sm:px-6 pt-3 pb-2 flex items-center gap-2 border-b border-slate-200/10 text-xs font-bold">
          <button
            onClick={() => { playPop(); setActiveFilter('all'); }}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeFilter === 'all'
                ? 'bg-pink-500 text-white'
                : isKuromi ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Coupons ({coupons.length})
          </button>
          <button
            onClick={() => { playPop(); setActiveFilter('available'); }}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeFilter === 'available'
                ? 'bg-emerald-500 text-white'
                : isKuromi ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Available ({availableCount})
          </button>
          <button
            onClick={() => { playPop(); setActiveFilter('redeemed'); }}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeFilter === 'redeemed'
                ? 'bg-purple-600 text-white'
                : isKuromi ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Claimed ({redeemedCount})
          </button>
        </div>

        {/* Coupons List */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-3.5">
          {filtered.length === 0 ? (
            <div className="py-12 text-center opacity-60">
              <Ticket className="w-12 h-12 mx-auto mb-2 opacity-40" />
              <p className="font-bold text-sm">No coupons found in this tab!</p>
            </div>
          ) : (
            filtered.map((coupon) => {
              const isClaimed = coupon.is_redeemed;
              return (
                <div
                  key={coupon.id}
                  className={`relative p-4 sm:p-5 rounded-2xl border-2 transition-all duration-200 ${
                    isClaimed
                      ? isKuromi 
                        ? 'bg-slate-900/40 border-slate-800 opacity-60' 
                        : 'bg-slate-100/70 border-slate-300 opacity-70'
                      : isKuromi
                        ? 'bg-gradient-to-r from-purple-950/50 to-pink-950/30 border-dashed border-pink-500/60 hover:border-pink-400 shadow-md'
                        : 'bg-gradient-to-r from-rose-50/70 to-purple-50/70 border-dashed border-pink-400 hover:border-pink-500 shadow-sm'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap text-[11px] font-black">
                        <span className="px-2 py-0.5 rounded-md bg-pink-500/20 text-pink-500">
                          {coupon.category}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-400">
                          For: {coupon.for_user}
                        </span>
                      </div>

                      <h3 className={`text-sm sm:text-base font-black ${isClaimed ? 'line-through opacity-75' : 'text-slate-900 dark:text-white'}`}>
                        {coupon.title}
                      </h3>

                      {isClaimed && (
                        <p className="text-[11px] font-bold text-emerald-500 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          Claimed by {coupon.redeemed_by || 'Partner'} on {new Date(coupon.redeemed_at).toLocaleDateString()} 💕
                        </p>
                      )}
                    </div>

                    {!isClaimed && (
                      <button
                        onClick={() => handleRedeem(coupon)}
                        className="px-4 py-2.5 rounded-xl font-black text-xs bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-md shadow-pink-500/25 transition-all transform hover:scale-105 active:scale-95 shrink-0 flex items-center justify-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-yellow-200" />
                        <span>Redeem As {activeProfile}!</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Add Coupon Modal */}
        {showAddModal && (
          <div className="absolute inset-0 z-20 p-6 bg-black/90 backdrop-blur-md flex flex-col justify-center animate-fade-in">
            <div className={`p-6 rounded-3xl border shadow-2xl max-w-md mx-auto w-full ${
              isKuromi ? 'bg-[#181426] border-[#382d54] text-white' : 'bg-white border-sky-200 text-slate-800'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black font-heading">
                  Create Love Coupon 🎁
                </h3>
                <button onClick={() => setShowAddModal(false)} className="p-1 opacity-60 hover:opacity-100">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddCoupon} className="space-y-4 text-xs sm:text-sm">
                <div>
                  <label className="block font-bold mb-1">Coupon Title / Perk:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1 Free Boba Drink ordered by Migz"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border font-medium outline-none ${
                      isKuromi ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold mb-1">Category:</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className={`w-full px-3 py-2.5 rounded-xl border font-bold outline-none ${
                        isKuromi ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      <option value="Food Trip 🍽️">Food Trip 🍽️</option>
                      <option value="Relaxation 💆">Relaxation 💆</option>
                      <option value="Entertainment 🎬">Entertainment 🎬</option>
                      <option value="Sweet Treat 🎁">Sweet Treat 🎁</option>
                      <option value="Chore Pass 🧹">Chore Pass 🧹</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold mb-1">Who Can Redeem?</label>
                    <select
                      value={newForUser}
                      onChange={(e) => setNewForUser(e.target.value)}
                      className={`w-full px-3 py-2.5 rounded-xl border font-bold outline-none ${
                        isKuromi ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      <option value="Both">Both of Us 💕</option>
                      <option value="Nekol">Nekol 🖤</option>
                      <option value="Migz">Migz 🐧</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-2.5 rounded-xl font-bold border border-slate-300 dark:border-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl font-bold bg-pink-500 text-white shadow-lg shadow-pink-500/25"
                  >
                    Add to Jar 🎟️
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
