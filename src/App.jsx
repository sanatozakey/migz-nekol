import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Navigation from './components/Navigation';
import GatekeeperModal from './components/GatekeeperModal';
import MovieRoulette from './components/movies/MovieRoulette';
import FoodPicker from './components/food/FoodPicker';
import ExpenseTracker from './components/expenses/ExpenseTracker';
import CalendarView from './components/calendar/CalendarView';
import CoupleMoodBar from './components/couple/CoupleMoodBar';
import LoveCouponsModal from './components/couple/LoveCouponsModal';
import LovePingOverlay from './components/common/LovePingOverlay';
import { useTheme } from './context/ThemeContext';
import { isUserVerified, setUserVerified } from './utils/storage';

export default function App() {
  const { isKuromi } = useTheme();
  const [verified, setVerified] = useState(false);
  const [activeTab, setActiveTab] = useState('movies');
  const [showCouponsModal, setShowCouponsModal] = useState(false);

  useEffect(() => {
    setVerified(isUserVerified());
  }, []);

  const handleResetGatekeeper = () => {
    setUserVerified(false);
    setVerified(false);
  };

  return (
    <div className={`min-h-screen-dvh flex flex-col transition-colors duration-300 ${
      isKuromi 
        ? 'bg-kuromi-dark text-slate-100' 
        : 'bg-gradient-to-b from-sky-50/80 via-white to-sky-50/40 text-slate-800'
    }`}>
      {/* Real-time Love Ping Toast & Confetti Overlay */}
      <LovePingOverlay />

      {/* Love Coupons Dialog */}
      <LoveCouponsModal 
        isOpen={showCouponsModal} 
        onClose={() => setShowCouponsModal(false)} 
      />

      {/* Identity Gatekeeper Prompt */}
      {!verified && (
        <GatekeeperModal onVerified={() => setVerified(true)} />
      )}

      {/* App Header */}
      <Header 
        onResetGatekeeper={handleResetGatekeeper} 
        onOpenCoupons={() => setShowCouponsModal(true)} 
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-3 sm:py-5 pb-24 sm:pb-12">
        {/* Live Couple Mood & Status Banner */}
        <CoupleMoodBar onOpenCoupons={() => setShowCouponsModal(true)} />

        {/* Navigation Tabs */}
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Tab Content */}
        <div className="mt-4 sm:mt-6 transition-opacity duration-200">
          {activeTab === 'movies' && <MovieRoulette />}
          {activeTab === 'food' && <FoodPicker />}
          {activeTab === 'expenses' && <ExpenseTracker />}
          {activeTab === 'calendar' && <CalendarView />}
        </div>
      </main>

      {/* Desktop Footer */}
      <footer className="hidden sm:block py-6 border-t text-center text-xs opacity-75 transition-colors border-slate-200/20">
        <p className="flex items-center justify-center gap-1.5 font-semibold">
          <span>Dedicated with endless love to</span>
          <span className="font-bold text-pink-500">Nekol</span>
          <span>from</span>
          <span className="font-bold text-pink-500">Migz</span>
          <span>💕 {isKuromi ? '😈🖤' : '🐧❄️'} | Migz X Nekol</span>
        </p>
      </footer>
    </div>
  );
}
