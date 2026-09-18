import React, { useState, useEffect } from 'react';
import { Wallet, Plus, Trash2, Heart, Coffee, UtensilsCrossed, Settings, Target, AlertTriangle, CheckCircle2, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { getExpenses, saveExpense, deleteExpense, getBudgetTargets, saveBudgetTargets, subscribeStorage } from '../../utils/storage';
import { useTheme } from '../../context/ThemeContext';
import { playPop, playSuccessFanfare } from '../../lib/soundEffects';
import AddExpenseModal from './AddExpenseModal';
import { EXPENSE_CATEGORIES } from '../../data/expenseCategories';
import { THEME_ASSETS } from '../../data/themeAssets';

export default function ExpenseTracker() {
  const { isKuromi } = useTheme();
  const [expenses, setExpenses] = useState([]);
  const [filterCategory, setFilterCategory] = useState('all');
  const [partnerFilter, setPartnerFilter] = useState('all'); // 'all', 'Nekol', 'Migz'
  const [budgetPeriod, setBudgetPeriod] = useState('month'); // 'month', 'week', 'day', 'all'
  const [selectedMonthDate, setSelectedMonthDate] = useState(() => new Date());
  const [budgetTargets, setBudgetTargets] = useState({ monthly: 10000, weekly: 2500, daily: 500 });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Edit budget target state
  const [editMonthly, setEditMonthly] = useState(10000);
  const [editWeekly, setEditWeekly] = useState(2500);
  const [editDaily, setEditDaily] = useState(500);

  const loadData = async () => {
    const list = await getExpenses();
    setExpenses(list);
    const targets = await getBudgetTargets();
    setBudgetTargets(targets);
    setEditMonthly(targets.monthly || 10000);
    setEditWeekly(targets.weekly || 2500);
    setEditDaily(targets.daily || 500);
  };

  useEffect(() => {
    loadData();
    const unsub = subscribeStorage(loadData);
    return () => unsub();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleAdd = async (newExpense) => {
    setExpenses(prev => [newExpense, ...prev]);
    await saveExpense(newExpense);
    setShowAddModal(false);
    showToast(`Added ₱${newExpense.amount.toLocaleString()} for ${newExpense.title}! ✨`);
  };

  const handleDelete = async (id) => {
    playPop();
    const itemToDelete = expenses.find(e => e.id === id);
    setExpenses(prev => prev.filter(e => e.id !== id));
    await deleteExpense(id);
    showToast(`Removed "${itemToDelete?.title || 'Expense'}" from ledger`);
  };

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    playSuccessFanfare();
    const updated = {
      monthly: parseFloat(editMonthly) || 10000,
      weekly: parseFloat(editWeekly) || 2500,
      daily: parseFloat(editDaily) || 500
    };
    setBudgetTargets(updated);
    setShowBudgetModal(false);
    showToast('Updated couple budget targets! 🎯');
    await saveBudgetTargets(updated);
  };

  // Safe local date calculations
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
  const todayStr = `${currentYear}-${currentMonth}-${String(now.getDate()).padStart(2, '0')}`;

  // Month navigation calculations
  const selYear = selectedMonthDate.getFullYear();
  const selMonth = String(selectedMonthDate.getMonth() + 1).padStart(2, '0');
  const selectedYearMonth = `${selYear}-${selMonth}`; // 'YYYY-MM'
  const selectedMonthLabel = selectedMonthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const isCurrentMonthSelected = (now.getFullYear() === selYear && now.getMonth() === selectedMonthDate.getMonth());

  const handlePrevMonth = () => {
    playPop();
    setSelectedMonthDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    playPop();
    setSelectedMonthDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleCurrentMonth = () => {
    playPop();
    setSelectedMonthDate(new Date());
  };

  // Start of week (Sunday)
  const dayOfWeek = now.getDay();
  const startOfWeekDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
  const startOfWeekStr = `${startOfWeekDate.getFullYear()}-${String(startOfWeekDate.getMonth() + 1).padStart(2, '0')}-${String(startOfWeekDate.getDate()).padStart(2, '0')}`;

  // Period filtered expenses for budget card
  const periodExpenses = expenses.filter(e => {
    if (!e.date) return true;
    if (budgetPeriod === 'day') return e.date === todayStr;
    if (budgetPeriod === 'week') return e.date >= startOfWeekStr && e.date <= todayStr;
    if (budgetPeriod === 'month') return e.date.startsWith(selectedYearMonth);
    return true; // 'all'
  });

  const periodActualAmount = periodExpenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  
  const currentTarget = budgetPeriod === 'month' 
    ? budgetTargets.monthly 
    : budgetPeriod === 'week' 
      ? budgetTargets.weekly 
      : budgetPeriod === 'day'
        ? budgetTargets.daily
        : budgetTargets.monthly;

  const percentageUsed = currentTarget > 0 ? (periodActualAmount / currentTarget) * 100 : 0;
  const remainingBalance = currentTarget - periodActualAmount;

  // Overall totals
  const totalAllTime = expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  // Milktea & drinks total
  const milkteaTotal = expenses
    .filter(e => e.category === 'Milktea & Drinks' || e.category === 'Boba & Coffee' || e.title.toLowerCase().includes('tea') || e.title.toLowerCase().includes('boba'))
    .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  // Food trips total
  const foodTripTotal = expenses
    .filter(e => e.category === 'Food Trip' || e.category === 'Date Night')
    .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  // Filter the list displayed at the bottom by both Period and Category!
  const displayedExpenses = expenses.filter(e => {
    // 1. Period match
    let matchPeriod = true;
    if (budgetPeriod === 'day') matchPeriod = (e.date === todayStr);
    else if (budgetPeriod === 'week') matchPeriod = (e.date >= startOfWeekStr && e.date <= todayStr);
    else if (budgetPeriod === 'month') matchPeriod = (e.date && e.date.startsWith(selectedYearMonth));

    // 2. Category match
    let matchCategory = true;
    if (filterCategory !== 'all') {
      matchCategory = (e.category === filterCategory);
    }

    // 3. Partner match
    let matchPartner = true;
    if (partnerFilter === 'Nekol') {
      matchPartner = (e.logged_by === 'Nekol' || (e.paid_by && e.paid_by.includes('Nekol')));
    } else if (partnerFilter === 'Migz') {
      matchPartner = (e.logged_by === 'Migz' || (e.paid_by && e.paid_by.includes('Migz')));
    }

    return matchPeriod && matchCategory && matchPartner;
  });

  const mascotImg = isKuromi ? THEME_ASSETS.kuromi.gastos : THEME_ASSETS.penguin.gastos;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 px-4 py-2.5 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-xl flex items-center gap-2 animate-bounce-slow">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img 
            src={mascotImg} 
            alt="Savings Mascot" 
            className="w-12 h-12 rounded-2xl object-cover border-2 shadow-md border-pink-400/50"
          />
          <div>
            <h2 className="text-2xl sm:text-3xl font-black font-heading flex items-center gap-2">
              <span>Gastos Tracker</span>
              <span>💸</span>
            </h2>
            <p className="text-xs sm:text-sm font-semibold opacity-75">
              Migz & Nekol's date ledger, budget limits, and milktea fund!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => { playPop(); setShowBudgetModal(true); }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-transform active:scale-95 shadow-sm ${
              isKuromi 
                ? 'border-purple-800 bg-purple-950/60 hover:bg-purple-900/80 text-purple-200' 
                : 'border-slate-300 bg-white hover:bg-slate-50 text-slate-700'
            }`}
          >
            <Settings className="w-4 h-4 text-pink-500" />
            <span>Set Budget</span>
          </button>

          <button
            type="button"
            onClick={() => { playPop(); setShowAddModal(true); }}
            className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 text-white shadow-md transition-transform active:scale-95 ${
              isKuromi ? 'bg-pink-600 hover:bg-pink-500 shadow-pink-500/25' : 'bg-sky-500 hover:bg-sky-400 shadow-sky-500/25'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>+ Log Gastos</span>
          </button>
        </div>
      </div>

      {/* Main Budget vs. Actual Card with Mascot & Period Switcher */}
      <div className={`p-5 sm:p-6 rounded-3xl border transition-all ${
        isKuromi 
          ? 'bg-[#181426] border-[#382d54] shadow-lg shadow-purple-950/20 text-white' 
          : 'bg-white border-sky-200 shadow-md text-slate-900'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <Target className="w-5 h-5 text-pink-500" />
            <h3 className="text-base sm:text-lg font-black font-heading">
              Budget vs. Actual Gastos
            </h3>
          </div>

          {/* Period Toggle Pills: This Month / This Week / Today / All Time */}
          <div className={`flex items-center p-1 rounded-xl border text-xs font-bold ${
            isKuromi ? 'bg-slate-900 border-purple-900' : 'bg-slate-100 border-slate-200'
          }`}>
            <button
              type="button"
              onClick={() => { playPop(); setBudgetPeriod('month'); }}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                budgetPeriod === 'month'
                  ? isKuromi ? 'bg-pink-600 text-white shadow' : 'bg-sky-500 text-white shadow'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              {isCurrentMonthSelected ? 'This Month' : selectedMonthLabel.split(' ')[0]}
            </button>
            <button
              type="button"
              onClick={() => { playPop(); setBudgetPeriod('week'); }}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                budgetPeriod === 'week'
                  ? isKuromi ? 'bg-pink-600 text-white shadow' : 'bg-sky-500 text-white shadow'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              This Week
            </button>
            <button
              type="button"
              onClick={() => { playPop(); setBudgetPeriod('day'); }}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                budgetPeriod === 'day'
                  ? isKuromi ? 'bg-pink-600 text-white shadow' : 'bg-sky-500 text-white shadow'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => { playPop(); setBudgetPeriod('all'); }}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                budgetPeriod === 'all'
                  ? isKuromi ? 'bg-pink-600 text-white shadow' : 'bg-sky-500 text-white shadow'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              All Time
            </button>
          </div>
        </div>

        {/* Month Navigator Banner (when viewing 'month') */}
        {budgetPeriod === 'month' && (
          <div className="flex items-center justify-between gap-2 p-2 px-3 sm:px-4 rounded-2xl border mb-4 text-xs font-bold transition-all bg-white/5 border-slate-200/20 animate-fade-in">
            <button
              type="button"
              onClick={handlePrevMonth}
              className={`p-1.5 px-2.5 rounded-xl border transition-all flex items-center gap-1 active:scale-95 ${
                isKuromi ? 'border-purple-800/60 bg-purple-950/40 hover:bg-purple-900/60 text-purple-200' : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
              }`}
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden xs:inline sm:inline">Prev</span>
            </button>

            <div className="flex items-center gap-2 flex-wrap justify-center">
              <Calendar className="w-3.5 h-3.5 text-pink-500" />
              <span className="font-extrabold text-xs sm:text-sm font-heading">{selectedMonthLabel}</span>
              {!isCurrentMonthSelected && (
                <button
                  type="button"
                  onClick={handleCurrentMonth}
                  className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-pink-500/20 text-pink-400 border border-pink-500/30 hover:bg-pink-500 hover:text-white transition-all active:scale-95"
                  title="Jump back to current month"
                >
                  Jump to Current
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className={`p-1.5 px-2.5 rounded-xl border transition-all flex items-center gap-1 active:scale-95 ${
                isKuromi ? 'border-purple-800/60 bg-purple-950/40 hover:bg-purple-900/60 text-purple-200' : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
              }`}
              title="Next Month"
            >
              <span className="hidden xs:inline sm:inline">Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Tally Metrics Numbers */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div className={`p-4 rounded-2xl border ${
            isKuromi ? 'bg-slate-900/70 border-purple-900/50' : 'bg-slate-50 border-slate-200'
          }`}>
            <span className="text-xs opacity-75 font-bold uppercase tracking-wider block">Target Budget</span>
            <p className="text-xl sm:text-2xl font-black font-heading mt-1">
              ₱ {currentTarget.toLocaleString()}
            </p>
            <span className="text-[11px] opacity-60">
              {budgetPeriod === 'month' ? 'Allocated for this month' : budgetPeriod === 'week' ? 'Allocated for this week' : budgetPeriod === 'day' ? 'Daily budget goal' : 'Total monthly target'}
            </span>
          </div>

          <div className={`p-4 rounded-2xl border ${
            isKuromi ? 'bg-slate-900/70 border-purple-900/50' : 'bg-slate-50 border-slate-200'
          }`}>
            <span className="text-xs opacity-75 font-bold uppercase tracking-wider block">Actual Gastos</span>
            <p className="text-xl sm:text-2xl font-black font-heading mt-1 text-pink-500">
              ₱ {periodActualAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <span className="text-[11px] opacity-60">
              {periodExpenses.length} {periodExpenses.length === 1 ? 'entry' : 'entries'} in this period
            </span>
          </div>

          <div className={`p-4 rounded-2xl border ${
            remainingBalance >= 0
              ? isKuromi ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : isKuromi ? 'bg-rose-950/50 border-rose-800/70 text-rose-300' : 'bg-rose-50 border-rose-300 text-rose-900'
          }`}>
            <span className="text-xs font-bold uppercase tracking-wider block">
              {remainingBalance >= 0 ? 'Remaining Balance' : 'Over Budget!'}
            </span>
            <p className="text-xl sm:text-2xl font-black font-heading mt-1">
              ₱ {Math.abs(remainingBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <span className="text-[11px] font-semibold">
              {remainingBalance >= 0 ? 'Safe & on budget ✨' : 'Hinay-hinay muna tayo sa gastos bebe! 💸'}
            </span>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-xs font-bold">
            <span>Budget Usage: {percentageUsed.toFixed(1)}%</span>
            <span>{remainingBalance >= 0 ? `${(100 - percentageUsed).toFixed(1)}% left` : 'Exceeded target!'}</span>
          </div>
          <div className={`w-full h-3 rounded-full overflow-hidden ${
            isKuromi ? 'bg-slate-800' : 'bg-slate-200'
          }`}>
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                percentageUsed > 100 
                  ? 'bg-rose-500' 
                  : percentageUsed > 80 
                    ? 'bg-amber-500' 
                    : isKuromi 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
                      : 'bg-gradient-to-r from-sky-400 to-blue-500'
              }`}
              style={{ width: `${Math.min(percentageUsed, 100)}%` }}
            />
          </div>
        </div>

        {/* Cute couple advice note with real mascot thumbnail */}
        <div className="mt-4 pt-3 border-t border-slate-200/20 flex items-center gap-3">
          <img 
            src={mascotImg} 
            alt="Mascot Tip" 
            className="w-8 h-8 rounded-full object-cover border border-pink-400"
          />
          <p className="text-xs font-semibold opacity-90">
            {remainingBalance >= 0
              ? 'Yay super tipid! Safe pa ang wallet natin bebe! Good job team Migz X Nekol! 🏆'
              : 'Lagpas na sa target! Next date let’s do a cozy movie marathon at home muna! 🍿💕'
            }
          </p>
        </div>
      </div>

      {/* Mini Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`p-4 rounded-2xl border ${
          isKuromi ? 'bg-[#181426] border-[#382d54] text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold opacity-75">All-Time Total Gastos</span>
            <Wallet className="w-4 h-4 text-pink-500" />
          </div>
          <p className="text-xl sm:text-2xl font-black font-heading text-pink-500">
            ₱ {totalAllTime.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] opacity-60">Across all couple dates & treats</span>
        </div>

        <div className={`p-4 rounded-2xl border ${
          isKuromi ? 'bg-[#181426] border-[#382d54] text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold opacity-75">Milktea & Drinks Fund 🧋</span>
            <span className="text-base">🧋</span>
          </div>
          <p className="text-xl sm:text-2xl font-black font-heading text-amber-500">
            ₱ {milkteaTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] opacity-60">Brown sugar, pearl & fruit teas</span>
        </div>

        <div className={`p-4 rounded-2xl border ${
          isKuromi ? 'bg-[#181426] border-[#382d54] text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold opacity-75">Food Trips & Dinners</span>
            <UtensilsCrossed className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-xl sm:text-2xl font-black font-heading text-emerald-500">
            ₱ {foodTripTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] opacity-60">Happy bellies together 🍜</span>
        </div>
      </div>

      {/* Partner & Category Filter Pills */}
      <div className="space-y-2">
        {/* Partner Attribution Filter */}
        <div className="flex items-center gap-2">
          {[
            { id: 'all', label: 'All Expenses 💕' },
            { id: 'Nekol', label: "Nekol's 🖤" },
            { id: 'Migz', label: "Migz's 🐧" }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => { playPop(); setPartnerFilter(tab.id); }}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                partnerFilter === tab.id
                  ? isKuromi ? 'bg-pink-600 text-white shadow-sm' : 'bg-sky-500 text-white shadow-sm'
                  : isKuromi ? 'bg-purple-950/40 text-purple-200 border border-purple-900/60' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => { playPop(); setFilterCategory('all'); }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all ${
              filterCategory === 'all'
                ? isKuromi ? 'bg-pink-600 text-white shadow-sm' : 'bg-sky-500 text-white shadow-sm'
                : isKuromi ? 'bg-slate-900 text-slate-300 hover:text-white border border-purple-900/40' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            All Categories
          </button>

          {EXPENSE_CATEGORIES.map(cat => (
            <button
              type="button"
              key={cat.id}
              onClick={() => { playPop(); setFilterCategory(cat.id); }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all ${
                filterCategory === cat.id
                  ? isKuromi ? 'bg-pink-600 text-white shadow-sm' : 'bg-sky-500 text-white shadow-sm'
                  : isKuromi ? 'bg-slate-900 text-slate-300 hover:text-white border border-purple-900/40' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Expense List Header with Active Filters Indicator */}
      <div className="flex items-center justify-between px-1 text-xs font-bold opacity-75">
        <span>
          Showing {displayedExpenses.length} {displayedExpenses.length === 1 ? 'expense' : 'expenses'} for {budgetPeriod === 'month' ? selectedMonthLabel : budgetPeriod === 'week' ? 'This Week' : budgetPeriod === 'day' ? 'Today' : 'All Time'}
          {filterCategory !== 'all' ? ` (${filterCategory})` : ''}
          {partnerFilter !== 'all' ? ` • ${partnerFilter}'s` : ''}
        </span>
        {displayedExpenses.length > 0 && (
          <span>Total: ₱ {displayedExpenses.reduce((s, i) => s + (Number(i.amount) || 0), 0).toLocaleString()}</span>
        )}
      </div>

      {/* Expense Entries List */}
      <div className="space-y-3">
        {displayedExpenses.map((item) => (
          <div
            key={item.id}
            className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
              isKuromi 
                ? 'bg-[#181426] border-[#382d54] text-white hover:border-purple-600/50' 
                : 'bg-white border-slate-200 text-slate-900 hover:border-sky-300 shadow-sm'
            }`}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                  isKuromi ? 'bg-pink-950/60 text-pink-300 border border-pink-800/40' : 'bg-pink-50 text-pink-700 border border-pink-200'
                }`}>
                  {item.category}
                </span>

                {item.paid_by && (
                  <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                    isKuromi ? 'bg-purple-950/60 text-purple-300 border border-purple-800/40' : 'bg-sky-50 text-sky-700 border border-sky-200'
                  }`}>
                    {item.paid_by}
                  </span>
                )}

                {item.logged_by && (
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    item.logged_by === 'Nekol'
                      ? 'bg-pink-500/15 text-pink-400 border border-pink-500/30'
                      : 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                  }`}>
                    Logged by {item.logged_by} {item.logged_by === 'Nekol' ? '🖤' : '🐧'}
                  </span>
                )}

                <span className="text-[11px] opacity-60 font-semibold">
                  {item.date}
                </span>
              </div>

              <h4 className="font-bold text-sm sm:text-base truncate">
                {item.title}
              </h4>

              {item.notes && (
                <p className="text-xs opacity-75 italic mt-0.5 line-clamp-1">
                  "{item.notes}"
                </p>
              )}
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className="text-base sm:text-lg font-black font-heading text-emerald-500">
                ₱ {Number(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>

              <button
                type="button"
                onClick={() => handleDelete(item.id)}
                className="p-2 rounded-xl text-rose-400 hover:text-white hover:bg-rose-600 transition-colors shadow-sm"
                title="Delete this expense"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {displayedExpenses.length === 0 && (
          <div className="py-12 text-center opacity-70 p-6 rounded-3xl border border-dashed border-slate-300/40">
            <Wallet className="w-12 h-12 mx-auto mb-2 opacity-50 text-pink-400" />
            <p className="font-bold text-sm">No expenses logged for this period yet!</p>
            <p className="text-xs opacity-75 mt-1">Tap the "+ Log Gastos" button above to add a new date expense.</p>
          </div>
        )}
      </div>

      {/* Set Budget Limits Modal */}
      {showBudgetModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className={`w-full max-w-md p-6 rounded-3xl border shadow-2xl ${
            isKuromi 
              ? 'bg-[#181426] border-[#382d54] text-white' 
              : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <h3 className="text-xl font-bold font-heading mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-pink-500" />
              <span>Set Couple Budget Limits</span>
            </h3>

            <form onSubmit={handleSaveBudget} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold mb-1 opacity-90">Monthly Budget (₱ PHP)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={editMonthly}
                  onChange={(e) => setEditMonthly(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border font-bold outline-none ${
                    isKuromi 
                      ? 'bg-slate-900 border-purple-800 text-white focus:border-pink-500' 
                      : 'bg-white border-slate-300 text-slate-900 focus:border-sky-500'
                  }`}
                />
              </div>

              <div>
                <label className="block font-bold mb-1 opacity-90">Weekly Budget (₱ PHP)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={editWeekly}
                  onChange={(e) => setEditWeekly(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border font-bold outline-none ${
                    isKuromi 
                      ? 'bg-slate-900 border-purple-800 text-white focus:border-pink-500' 
                      : 'bg-white border-slate-300 text-slate-900 focus:border-sky-500'
                  }`}
                />
              </div>

              <div>
                <label className="block font-bold mb-1 opacity-90">Daily Budget (₱ PHP)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={editDaily}
                  onChange={(e) => setEditDaily(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border font-bold outline-none ${
                    isKuromi 
                      ? 'bg-slate-900 border-purple-800 text-white focus:border-pink-500' 
                      : 'bg-white border-slate-300 text-slate-900 focus:border-sky-500'
                  }`}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBudgetModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold opacity-75 hover:opacity-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-md ${
                    isKuromi ? 'bg-pink-600 hover:bg-pink-500' : 'bg-sky-500 hover:bg-sky-400'
                  }`}
                >
                  Save Budget Targets
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      <AddExpenseModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddExpense={handleAdd}
      />
    </div>
  );
}
