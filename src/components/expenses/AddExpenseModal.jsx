import React, { useState } from 'react';
import { Plus, Wallet, Heart } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { playPop, playSuccessFanfare } from '../../lib/soundEffects';

import { EXPENSE_CATEGORIES, PAID_BY_OPTIONS } from '../../data/expenseCategories';
import { useProfile } from '../../context/ProfileContext';

export default function AddExpenseModal({ isOpen, onClose, onAddExpense }) {
  const { isKuromi } = useTheme();
  const { activeProfile, isMigz } = useProfile();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food Trip');
  const [paidBy, setPaidBy] = useState(() => isMigz ? 'Migz 🐧' : 'Nekol 🖤');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!title.trim() || isNaN(numAmount) || numAmount <= 0) return;
    try { playSuccessFanfare(); } catch {}

    onAddExpense({
      id: `exp-${Date.now()}`,
      title: title.trim(),
      amount: numAmount,
      category,
      paid_by: paidBy,
      logged_by: activeProfile,
      date,
      notes: notes.trim()
    });

    setTitle('');
    setAmount('');
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className={`w-full max-w-md p-6 rounded-3xl border shadow-2xl ${
        isKuromi 
          ? 'bg-[#181426] border-[#382d54] text-white' 
          : 'bg-white border-sky-200 text-slate-800'
      }`}>
        <h3 className="text-xl font-bold font-heading mb-4 flex items-center gap-2">
          <span>Log Couple Expense</span>
          <span>💸</span>
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block font-semibold mb-1 opacity-80">What did we buy?</label>
            <input
              type="text"
              required
              placeholder="e.g. Samgyup date, Tiger Sugar boba, Cinema..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-xl border font-medium outline-none ${
                isKuromi 
                  ? 'bg-slate-900 border-kuromi-border text-white focus:border-pink-500' 
                  : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-sky-500'
              }`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1 opacity-80">Amount (₱ PHP)</label>
              <input
                type="number"
                step="any"
                required
                min="1"
                placeholder="₱ 350"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`w-full px-3 py-2.5 rounded-xl border font-semibold outline-none text-base ${
                  isKuromi 
                    ? 'bg-slate-900 border-kuromi-border text-pink-400' 
                    : 'bg-slate-50 border-slate-200 text-sky-600'
                }`}
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 opacity-80">Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`w-full px-3 py-2.5 rounded-xl border font-medium outline-none ${
                  isKuromi 
                    ? 'bg-slate-900 border-kuromi-border text-white' 
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1.5 opacity-80">Sino nagbayad? (Who paid?)</label>
            <div className="grid grid-cols-2 gap-2">
              {PAID_BY_OPTIONS.map(payer => (
                <button
                  type="button"
                  key={payer}
                  onClick={() => { playPop(); setPaidBy(payer); }}
                  className={`py-2 px-3 rounded-xl font-bold text-xs border transition-all ${
                    paidBy === payer
                      ? isKuromi
                        ? 'bg-gradient-to-r from-pink-600 to-purple-600 border-pink-500 text-white shadow-sm'
                        : 'bg-gradient-to-r from-sky-400 to-blue-500 border-sky-400 text-white shadow-sm'
                      : isKuromi
                        ? 'bg-slate-900 border-kuromi-border text-slate-300 hover:text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {payer}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1 opacity-80">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={`w-full px-3 py-2.5 rounded-xl border font-medium outline-none ${
                isKuromi 
                  ? 'bg-slate-900 border-kuromi-border text-white' 
                  : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              {EXPENSE_CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1 opacity-80">Notes / Sweet Memory</label>
            <textarea
              rows="2"
              placeholder="e.g. Nekol treated because of good grades! 🥰"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={`w-full px-4 py-2 rounded-xl border font-medium outline-none ${
                isKuromi 
                  ? 'bg-slate-900 border-kuromi-border text-white' 
                  : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold opacity-70 hover:opacity-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-md ${
                isKuromi ? 'bg-pink-600 hover:bg-pink-500' : 'bg-sky-500 hover:bg-sky-400'
              }`}
            >
              Record Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
