import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Utensils, Dices, Search, Plus, Sparkles, MapPin, RefreshCw, Link as LinkIcon, Navigation as NavIcon, CheckCircle2, ShieldCheck, X, Check, Compass, Loader2, Layers, ListPlus, ExternalLink } from 'lucide-react';
import { BUDGET_OPTIONS, GUTOM_OPTIONS, PAGOD_OPTIONS } from '../../data/defaultFoodSpots';
import { getFoodSpots, saveFoodSpot, saveFoodSpotsBatch, subscribeStorage } from '../../utils/storage';
import { analyzeFoodInput } from '../../utils/smartParsers';
import { calculateDistanceKm, getStoredLocation, getStoredPermission, setStoredPermission, requestUserLocation } from '../../utils/locationService';
import { playTick, playSuccessFanfare, playPop } from '../../lib/soundEffects';
import { useTheme } from '../../context/ThemeContext';
import { THEME_ASSETS } from '../../data/themeAssets';
import SpotCard from './SpotCard';
import EmbeddedMapModal from './EmbeddedMapModal';

export default function FoodPicker() {
  const { isKuromi } = useTheme();
  const [spots, setSpots] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // User geolocation state
  const [userLocation, setUserLocation] = useState(getStoredLocation());
  const [permissionStatus, setPermissionStatus] = useState(getStoredPermission()); // 'prompt', 'granted', 'denied'
  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState('');

  // Filters
  const [budgetFilter, setBudgetFilter] = useState('all');
  const [gutomFilter, setGutomFilter] = useState('all');
  const [pagodFilter, setPagodFilter] = useState('all');

  // Randomizer state
  const [isPicking, setIsPicking] = useState(false);
  const [winningSpotId, setWinningSpotId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeMapSpot, setActiveMapSpot] = useState(null);

  // Smart URL / Name Analyzer state
  const [smartInput, setSmartInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Multi-restaurant list import state (e.g. Spot.ph / Booky listicles)
  const [detectedList, setDetectedList] = useState(null); // { listTitle, restaurants, totalCount, sourceUrl }
  const [batchCuisine, setBatchCuisine] = useState('Keep Auto-Detected');

  // Add Spot Form State
  const [newName, setNewName] = useState('');
  const [newCuisine, setNewCuisine] = useState('');
  const [newArea, setNewArea] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [branchCoords, setBranchCoords] = useState(null);
  const [detectedBranches, setDetectedBranches] = useState([]);
  const [newBudget, setNewBudget] = useState('$$');
  const [newGutom, setNewGutom] = useState('medium');
  const [newPagod, setNewPagod] = useState('medium');
  const [newTopDish, setNewTopDish] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [detectedBranchInfo, setDetectedBranchInfo] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const loadData = async () => {
    const list = await getFoodSpots();
    setSpots(list);
  };

  useEffect(() => {
    loadData();
    const unsub = subscribeStorage(loadData);
    return () => unsub();
  }, []);

  // Handle Location Permission Request
  const handleEnableLocation = async () => {
    playPop();
    setIsLocating(true);
    setLocationStatus('Requesting GPS permission...');

    try {
      const coords = await requestUserLocation();
      setUserLocation(coords);
      setPermissionStatus('granted');
      setLocationStatus(`Location verified! Near ${coords.district} 📍`);
      try { playSuccessFanfare(); } catch {}
      setTimeout(() => setLocationStatus(''), 4000);
    } catch (err) {
      setPermissionStatus('denied');
      setLocationStatus('Location access was denied or timed out. You can enable it anytime in browser settings.');
      setTimeout(() => setLocationStatus(''), 5000);
    } finally {
      setIsLocating(false);
    }
  };

  const handleDismissLocationPrompt = () => {
    playPop();
    setStoredPermission('denied');
    setPermissionStatus('denied');
  };

  // Smart Input Analyzer (Link or Name) with Multi-Restaurant Web Scraper
  const handleSmartAnalyze = async (overrideInput = null) => {
    const query = (typeof overrideInput === 'string' ? overrideInput : smartInput).trim();
    if (!query) return;
    playPop();
    setIsAnalyzing(true);
    setDetectedList(null);

    try {
      const result = await analyzeFoodInput(query, userLocation);
      if (result.isList && result.restaurants && result.restaurants.length > 0) {
        if (result.restaurants.length === 1) {
          const r = result.restaurants[0];
          setNewName(r.name);
          setNewCuisine(r.cuisine);
          setNewArea(r.area);
          setNewAddress(r.address || r.area);
          setNewBudget(r.budget);
          setNewGutom(r.gutom_level);
          setNewPagod(r.pagod_level);
          setNewTopDish(r.top_dish);
          setNewNotes(r.notes);
          setBranchCoords({ lat: r.lat, lng: r.lng });
          setDetectedBranches(r.allBranches || []);

          if (r.distanceKm) {
            setDetectedBranchInfo(`🌟 Nearest branch: ${r.area} (~${r.distanceKm} km away)`);
          } else {
            setDetectedBranchInfo(`📍 Located in ${r.area}`);
          }
          showToast(`✨ Analyzed "${r.name}"!`);
          try { playSuccessFanfare(); } catch {}
        } else {
          setDetectedList({
            listTitle: result.listTitle || 'Recommended Food Spots',
            restaurants: result.restaurants,
            totalCount: result.totalCount,
            sourceUrl: query
          });
          showToast(`🍽️ Extracted ${result.restaurants.length} food spots from "${result.listTitle}"!`);
          try { playSuccessFanfare(); } catch {}
        }
      } else {
        setNewName(result.name);
        setNewCuisine(result.cuisine);
        setNewArea(result.area);
        setNewAddress(result.address || result.area);
        setNewBudget(result.budget);
        setNewGutom(result.gutom_level);
        setNewPagod(result.pagod_level);
        setNewTopDish(result.top_dish);
        setNewNotes(result.notes);
        setBranchCoords({ lat: result.lat, lng: result.lng });
        setDetectedBranches(result.allBranches || []);

        if (result.distanceKm) {
          setDetectedBranchInfo(`🌟 Nearest branch: ${result.area} (~${result.distanceKm} km away)`);
        } else {
          setDetectedBranchInfo(`📍 Located in ${result.area}`);
        }
        showToast(`✨ Analyzed "${result.name}"!`);
        try { playSuccessFanfare(); } catch {}
      }
    } catch (err) {
      console.warn('Food analysis error:', err);
      setNewName(query);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Batch Add All Extracted Restaurants from Listicle Link
  const handleAddAllListSpots = async () => {
    if (!detectedList || !detectedList.restaurants || detectedList.restaurants.length === 0) return;
    playPop();
    setIsAnalyzing(true);

    try {
      const spotsToAdd = detectedList.restaurants.map(r => ({
        id: `spot-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: r.name,
        cuisine: batchCuisine === 'Keep Auto-Detected' ? r.cuisine : batchCuisine,
        area: r.area || 'Tomas Morato, Quezon City',
        address: r.address || r.area || 'Tomas Morato, Quezon City',
        lat: r.lat || (userLocation ? userLocation.lat : 14.6342),
        lng: r.lng || (userLocation ? userLocation.lng : 121.0375),
        branches: r.allBranches && r.allBranches.length > 0 ? r.allBranches : [
          { area: r.area, address: r.address || r.area, lat: r.lat, lng: r.lng }
        ],
        budget: r.budget || '$$',
        gutom_level: r.gutom_level || 'medium',
        pagod_level: r.pagod_level || 'medium',
        rating: 4.8,
        review_count: 1400,
        top_dish: r.top_dish || 'House Specialty',
        notes: `Extracted from "${detectedList.listTitle}" 💕`,
        google_maps_query: `${r.name} ${r.address || r.area}`
      }));

      await saveFoodSpotsBatch(spotsToAdd);
      try { playSuccessFanfare(); } catch {}
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.6 }
      });
      showToast(`🎉 Added ${spotsToAdd.length} food spots from "${detectedList.listTitle}" to catalog!`);
      setDetectedList(null);
      setSmartInput('');
      setShowAddModal(false);
    } catch (err) {
      console.error('Batch save food spots error:', err);
      showToast('Error saving food spots batch');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Add individual spot from detected listicle
  const handleAddSingleFromList = async (r) => {
    playPop();
    const spot = {
      id: `spot-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: r.name,
      cuisine: batchCuisine === 'Keep Auto-Detected' ? r.cuisine : batchCuisine,
      area: r.area || 'Tomas Morato, Quezon City',
      address: r.address || r.area || 'Tomas Morato, Quezon City',
      lat: r.lat || (userLocation ? userLocation.lat : 14.6342),
      lng: r.lng || (userLocation ? userLocation.lng : 121.0375),
      branches: r.allBranches && r.allBranches.length > 0 ? r.allBranches : [
        { area: r.area, address: r.address || r.area, lat: r.lat, lng: r.lng }
      ],
      budget: r.budget || '$$',
      gutom_level: r.gutom_level || 'medium',
      pagod_level: r.pagod_level || 'medium',
      rating: 4.8,
      review_count: 1200,
      top_dish: r.top_dish || 'House Specialty',
      notes: `Discovered in ${detectedList?.listTitle || 'Food Guide'} 💕`,
      google_maps_query: `${r.name} ${r.address || r.area}`
    };

    await saveFoodSpot(spot);
    showToast(`Added "${spot.name}" to catalog! 🍽️`);
  };

  // Compute spots with accurate nearest branch information
  const spotsWithDistance = useMemo(() => {
    return spots.map(spot => {
      if (!userLocation) return spot;

      let nearestBranch = null;
      let minDistance = Infinity;

      if (spot.branches && spot.branches.length > 0) {
        spot.branches.forEach(b => {
          const dist = calculateDistanceKm(userLocation.lat, userLocation.lng, b.lat, b.lng);
          if (dist < minDistance) {
            minDistance = dist;
            nearestBranch = { ...b, distanceKm: dist.toFixed(1) };
          }
        });
      }

      return {
        ...spot,
        nearestBranch,
        distanceKm: minDistance !== Infinity ? minDistance.toFixed(1) : null
      };
    });
  }, [spots, userLocation]);

  // Filter & Sort spots
  const filteredSpots = useMemo(() => {
    let result = spotsWithDistance.filter(spot => {
      const matchesSearch = 
        spot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        spot.cuisine.toLowerCase().includes(searchQuery.toLowerCase()) ||
        spot.area.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesBudget = budgetFilter === 'all' || spot.budget === budgetFilter;
      const matchesGutom = gutomFilter === 'all' || spot.gutom_level === gutomFilter;
      const matchesPagod = pagodFilter === 'all' || spot.pagod_level === pagodFilter;

      return matchesSearch && matchesBudget && matchesGutom && matchesPagod;
    });

    // If user location is enabled, sort spots by proximity (closest branches first)
    if (userLocation) {
      result.sort((a, b) => {
        const distA = a.distanceKm ? parseFloat(a.distanceKm) : 9999;
        const distB = b.distanceKm ? parseFloat(b.distanceKm) : 9999;
        return distA - distB;
      });
    }

    return result;
  }, [spotsWithDistance, searchQuery, budgetFilter, gutomFilter, pagodFilter, userLocation]);

  // Random Decision Maker
  const handlePickSpot = () => {
    if (filteredSpots.length === 0) return;
    playPop();
    setIsPicking(true);
    setWinningSpotId(null);

    let step = 0;
    const totalSteps = 22 + Math.floor(Math.random() * 6);
    let speed = 50;

    const runStep = () => {
      step++;
      const randomCandidate = filteredSpots[Math.floor(Math.random() * filteredSpots.length)];
      setWinningSpotId(randomCandidate.id);
      playTick();

      if (step < totalSteps) {
        if (step > totalSteps - 8) speed += 35;
        setTimeout(runStep, speed);
      } else {
        setIsPicking(false);
        const finalWinner = filteredSpots[Math.floor(Math.random() * filteredSpots.length)];
        setWinningSpotId(finalWinner.id);
        try { playSuccessFanfare(); } catch {}
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.6 }
        });
      }
    };

    runStep();
  };

  const handleAddSpotSubmit = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;

    // Safety guard: If user accidentally pasted a URL in the name input, analyze it!
    if (/^https?:\/\//i.test(newName.trim())) {
      setSmartInput(newName.trim());
      await handleSmartAnalyze(newName.trim());
      setNewName('');
      return;
    }

    playPop();

    const finalAddress = newAddress.trim() || newArea.trim();
    const spot = {
      id: `spot-${Date.now()}`,
      name: newName.trim(),
      cuisine: newCuisine.trim() || 'Milktea & Dining',
      area: newArea.trim() || 'Tomas Morato, Quezon City',
      address: finalAddress,
      lat: branchCoords?.lat || (userLocation ? userLocation.lat : 14.6342),
      lng: branchCoords?.lng || (userLocation ? userLocation.lng : 121.0375),
      branches: detectedBranches.length > 0 ? detectedBranches : [
        { area: newArea.trim(), address: finalAddress, lat: branchCoords?.lat, lng: branchCoords?.lng }
      ],
      budget: newBudget,
      gutom_level: newGutom,
      pagod_level: newPagod,
      rating: 4.9,
      review_count: 1200,
      top_dish: newTopDish.trim() || 'Signature House Special',
      notes: newNotes.trim() || 'Added to Migz & Nekol date spots 💕',
      google_maps_query: `${newName.trim()} ${finalAddress}`
    };

    await saveFoodSpot(spot);
    showToast(`Added "${spot.name}" to catalog! 🍽️`);
    setNewName('');
    setNewCuisine('');
    setNewArea('');
    setNewAddress('');
    setBranchCoords(null);
    setDetectedBranches([]);
    setNewTopDish('');
    setNewNotes('');
    setSmartInput('');
    setDetectedBranchInfo(null);
    setShowAddModal(false);
  };

  const mascotImg = isKuromi ? THEME_ASSETS.kuromi.eating : THEME_ASSETS.penguin.eating;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Toast message */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-[130] px-4 py-2.5 rounded-2xl bg-pink-600 text-white font-bold text-xs shadow-2xl flex items-center gap-2 animate-bounce-slow">
          <Sparkles className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header with Mascot */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img 
            src={mascotImg} 
            alt="Dining Mascot" 
            className="w-12 h-12 rounded-2xl object-cover border-2 shadow-md border-pink-400/50"
          />
          <div>
            <h2 className="text-2xl sm:text-3xl font-black font-heading flex items-center gap-2">
              <span>Where to Eat (Metro Manila)</span>
              <span>🍽️</span>
            </h2>
            <p className="text-xs sm:text-sm font-semibold opacity-75">
              Nearest ramen, samgyup, milktea, and date spots near Migz & Nekol!
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => { playPop(); setShowAddModal(true); }}
          className={`w-full sm:w-auto px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 text-white shadow-md transition-transform active:scale-95 ${
            isKuromi ? 'bg-pink-600 hover:bg-pink-500 shadow-pink-500/25' : 'bg-sky-500 hover:bg-sky-400 shadow-sky-500/25'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Food / Milktea Spot</span>
        </button>
      </div>

      {/* Location Permission Prompt Banner (if not granted/dismissed) */}
      {permissionStatus === 'prompt' && (
        <div className={`p-4 rounded-3xl border shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all animate-fade-in ${
          isKuromi 
            ? 'bg-gradient-to-r from-purple-950/80 to-[#181426] border-purple-700/60 text-white' 
            : 'bg-gradient-to-r from-sky-50 to-white border-sky-200 text-slate-900'
        }`}>
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-2xl bg-pink-500/20 text-pink-500 shrink-0">
              <MapPin className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <h4 className="font-black text-sm sm:text-base flex items-center gap-1.5">
                <span>Find Nearest Branches Near You?</span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-pink-500 text-white font-bold">Recommended</span>
              </h4>
              <p className="text-xs opacity-80 mt-0.5 leading-relaxed">
                With your permission, we calculate exact driving distances to branches across BGC, Makati, Megamall, QC, and MOA so you never have to travel far when pagod!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleEnableLocation}
              disabled={isLocating}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-black bg-pink-600 hover:bg-pink-500 text-white shadow-md transition-transform active:scale-95 flex items-center justify-center gap-1.5"
            >
              <NavIcon className="w-3.5 h-3.5" />
              <span>{isLocating ? 'Locating...' : 'Allow Location'}</span>
            </button>
            <button
              type="button"
              onClick={handleDismissLocationPrompt}
              className="p-2 rounded-xl text-xs opacity-60 hover:opacity-100 transition-opacity"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Active Location Status Bar */}
      {userLocation && (
        <div className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-between gap-3 ${
          isKuromi ? 'bg-purple-950/30 border-purple-800 text-purple-200' : 'bg-sky-50 border-sky-200 text-sky-800'
        }`}>
          <div className="flex items-center gap-2 truncate">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="truncate">
              GPS Active: <strong>{userLocation.district}</strong> — Spots sorted nearest to farthest!
            </span>
          </div>
          <button
            type="button"
            onClick={handleEnableLocation}
            className="shrink-0 text-[11px] underline opacity-75 hover:opacity-100 flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Refresh</span>
          </button>
        </div>
      )}

      {locationStatus && (
        <div className="p-3 rounded-xl bg-pink-500/10 border border-pink-500/30 text-pink-400 text-xs font-semibold animate-fade-in">
          {locationStatus}
        </div>
      )}

      {/* Decision Maker Hero Banner */}
      <div className={`p-6 rounded-3xl border text-center transition-all ${
        isKuromi 
          ? 'bg-gradient-to-b from-[#181426] to-[#0c0a14] border-[#382d54] text-white shadow-lg shadow-purple-950/20' 
          : 'bg-gradient-to-b from-white to-sky-50/60 border-slate-200 shadow-md text-slate-900'
      }`}>
        <div className="max-w-md mx-auto space-y-3">
          <div className="inline-flex p-3 rounded-2xl bg-pink-500/10 text-pink-500 mb-1">
            <Utensils className="w-8 h-8 animate-bounce-slow" />
          </div>
          <h3 className="text-xl font-black font-heading">
            Gutom Na Bebe? Where are we eating?
          </h3>
          <p className="text-xs font-medium opacity-75">
            Filter by budget, gutom level, or distance — or let the randomizer pick for you!
          </p>

          <button
            type="button"
            onClick={handlePickSpot}
            disabled={isPicking || filteredSpots.length === 0}
            className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-lg transition-transform active:scale-95 disabled:opacity-50 text-white ${
              isKuromi
                ? 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 shadow-pink-500/25'
                : 'bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-500 hover:to-blue-600 shadow-sky-400/25'
            }`}
          >
            <Dices className={`w-5 h-5 ${isPicking ? 'animate-spin' : ''}`} />
            <span>{isPicking ? 'Selecting our date spot...' : 'Decide for Us! 🎲'}</span>
          </button>
        </div>
      </div>

      {/* Search & Multi-Level Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 opacity-50" />
          <input
            type="text"
            placeholder="Search by restaurant name, milktea, ramen, area (BGC, Makati, QC)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 rounded-2xl border text-xs sm:text-sm font-semibold outline-none transition-colors ${
              isKuromi 
                ? 'bg-[#181426] border-[#382d54] text-white focus:border-pink-500' 
                : 'bg-white border-slate-200 text-slate-900 focus:border-sky-500'
            }`}
          />
        </div>

        {/* Filter Pills: Budget, Gutom Level, Pagod Level */}
        <div className="space-y-2 text-xs">
          {/* Budget */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="font-bold opacity-60 shrink-0 mr-1">Budget:</span>
            {BUDGET_OPTIONS.map(b => (
              <button
                type="button"
                key={b.id}
                onClick={() => { playPop(); setBudgetFilter(b.id); }}
                className={`px-3 py-1 rounded-xl font-bold shrink-0 transition-all ${
                  budgetFilter === b.id
                    ? isKuromi ? 'bg-pink-600 text-white' : 'bg-sky-500 text-white'
                    : isKuromi ? 'bg-slate-900 text-slate-400 hover:text-white border border-purple-900/40' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>

          {/* Gutom Level (Now with Milktea & Drinks) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="font-bold opacity-60 shrink-0 mr-1">Gutom:</span>
            {GUTOM_OPTIONS.map(g => (
              <button
                type="button"
                key={g.id}
                onClick={() => { playPop(); setGutomFilter(g.id); }}
                className={`px-3 py-1 rounded-xl font-bold shrink-0 transition-all ${
                  gutomFilter === g.id
                    ? isKuromi ? 'bg-pink-600 text-white' : 'bg-sky-500 text-white'
                    : isKuromi ? 'bg-slate-900 text-slate-400 hover:text-white border border-purple-900/40' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>

          {/* Pagod Level */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="font-bold opacity-60 shrink-0 mr-1">Pagod:</span>
            {PAGOD_OPTIONS.map(p => (
              <button
                type="button"
                key={p.id}
                onClick={() => { playPop(); setPagodFilter(p.id); }}
                className={`px-3 py-1 rounded-xl font-bold shrink-0 transition-all ${
                  pagodFilter === p.id
                    ? isKuromi ? 'bg-pink-600 text-white' : 'bg-sky-500 text-white'
                    : isKuromi ? 'bg-slate-900 text-slate-400 hover:text-white border border-purple-900/40' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Restaurant & Milktea Spots List */}
      <div className="space-y-4">
        {filteredSpots.map(spot => (
          <SpotCard 
            key={spot.id} 
            spot={spot} 
            isWinner={winningSpotId === spot.id} 
            onOpenMap={(s) => setActiveMapSpot(s)}
          />
        ))}

        {filteredSpots.length === 0 && (
          <div className="py-12 text-center opacity-60 p-6 rounded-3xl border border-dashed border-slate-300">
            <Utensils className="w-12 h-12 mx-auto mb-2 opacity-50 text-pink-400" />
            <p className="font-bold text-sm">No food or milktea spots match your filters!</p>
            <p className="text-xs opacity-75 mt-1">Try relaxing some filters or tap "+ Add Food / Milktea Spot" above.</p>
          </div>
        )}
      </div>

      {/* Add Spot Modal with Link / Name Analyzer */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className={`w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 rounded-3xl border shadow-2xl ${
            isKuromi 
              ? 'bg-[#181426] border-[#382d54] text-white' 
              : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <h3 className="text-xl font-black font-heading mb-1 flex items-center gap-2">
              <span>Add Restaurant or Milktea Spot</span>
              <span>🍽️</span>
            </h3>
            <p className="text-xs font-semibold opacity-75 mb-4">
              Enter a link or name to analyze and locate closest branches in Metro Manila!
            </p>

            {/* Smart Analyzer Box */}
            <div className={`p-4 rounded-2xl border mb-5 ${
              isKuromi ? 'bg-purple-950/40 border-purple-800' : 'bg-sky-50 border-sky-200'
            }`}>
              <label className="block text-xs font-extrabold mb-1.5 flex items-center gap-1 text-pink-500">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Smart Food Guide Link / Restaurant Name Analyzer</span>
              </label>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Paste food guide/listicle link (Spot.ph, Booky, blogs) or type restaurant name..."
                  value={smartInput}
                  onChange={(e) => setSmartInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSmartAnalyze();
                    }
                  }}
                  className={`flex-1 px-3.5 py-2.5 rounded-xl border text-xs font-semibold outline-none ${
                    isKuromi 
                      ? 'bg-slate-900 border-purple-900 text-white focus:border-pink-500' 
                      : 'bg-white border-slate-300 text-slate-900 focus:border-sky-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => handleSmartAnalyze()}
                  disabled={isAnalyzing || !smartInput.trim()}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs text-white shrink-0 shadow-sm transition-transform active:scale-95 disabled:opacity-50 flex items-center gap-1.5 ${
                    isKuromi ? 'bg-pink-600 hover:bg-pink-500' : 'bg-sky-500 hover:bg-sky-400'
                  }`}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Extracting...</span>
                    </>
                  ) : (
                    <span>Auto-Fill ✨</span>
                  )}
                </button>
              </div>

              {detectedBranchInfo && (
                <p className="text-[11px] font-bold text-emerald-400 mt-2 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>{detectedBranchInfo}</span>
                </p>
              )}
            </div>

            {/* Interactive Multi-Restaurant List Extractor Card (Spot.ph, Booky, blogs, etc.) */}
            {detectedList && (
              <div className={`p-4 rounded-2xl border mb-4 animate-fade-in ${
                isKuromi ? 'bg-purple-950/50 border-pink-500/70 shadow-lg shadow-purple-950/30' : 'bg-rose-50/80 border-pink-300 shadow-md'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Utensils className="w-4 h-4 text-pink-500 animate-pulse shrink-0" />
                    <span className="text-xs font-black text-pink-500 uppercase tracking-wide truncate">
                      🍽️ {detectedList.listTitle}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDetectedList(null)}
                    className="text-[11px] font-bold text-slate-400 hover:text-rose-500 transition-colors shrink-0 ml-2"
                  >
                    Dismiss
                  </button>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-pink-500/20 text-pink-400 border border-pink-500/30">
                    {detectedList.restaurants.length} Spots Detected!
                  </span>
                  <span className="text-[11px] font-medium opacity-80">
                    Categorized & ready to add to catalog
                  </span>
                </div>

                {/* Batch Cuisine Override Option */}
                <div className="mb-3 text-xs">
                  <label className="block text-[10px] font-bold uppercase tracking-wider opacity-75 mb-1">
                    Cuisine / Category Handling
                  </label>
                  <select
                    value={batchCuisine}
                    onChange={(e) => setBatchCuisine(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border font-bold text-xs outline-none ${
                      isKuromi ? 'bg-slate-900 border-purple-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="Keep Auto-Detected">Keep Auto-Detected Cuisines (Recommended ✨)</option>
                    <option value="Milktea, Drinks & Desserts 🧋">Milktea, Drinks & Desserts 🧋</option>
                    <option value="Casual Dining & Cafe">Casual Dining & Cafe ☕</option>
                    <option value="Japanese & Ramen">Japanese & Ramen 🍜</option>
                    <option value="Korean BBQ & Samgyup">Korean BBQ & Samgyup 🥩</option>
                    <option value="Mexican & Cantina">Mexican & Cantina 🌮</option>
                    <option value="Italian & Pizza">Italian & Pizza 🍕</option>
                    <option value="Steak & American Grill">Steak & American Grill 🥩</option>
                    <option value="Filipino Comfort Food">Filipino Comfort Food 🍲</option>
                    <option value="Cafe & Brunch">Cafe & Brunch 🥐</option>
                    <option value="Desserts & Sweets">Desserts & Sweets 🍨</option>
                  </select>
                </div>

                {/* Batch Add All Button */}
                <button
                  type="button"
                  onClick={handleAddAllListSpots}
                  disabled={isAnalyzing}
                  className={`w-full py-2.5 px-4 rounded-xl font-black text-xs text-white shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 mb-3 ${
                    isKuromi ? 'bg-gradient-to-r from-pink-600 to-purple-600 hover:opacity-95' : 'bg-gradient-to-r from-pink-500 to-rose-600 hover:opacity-95'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>+ Add All {detectedList.restaurants.length} Restaurants to Food Catalog 🍽️</span>
                </button>

                {/* Scrollable Preview of Extracted Restaurants */}
                <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider opacity-60 sticky top-0 bg-inherit py-0.5">
                    Preview of Extracted Date Spots:
                  </p>
                  {detectedList.restaurants.map((spot, idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs transition-colors ${
                        isKuromi ? 'bg-slate-900/80 border-purple-900/50 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-extrabold text-xs">{idx + 1}. {spot.name}</span>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-pink-500/20 text-pink-400 border border-pink-500/30">
                            {batchCuisine === 'Keep Auto-Detected' ? spot.cuisine : batchCuisine}
                          </span>
                          <span className="font-mono text-[10px] font-bold opacity-60">
                            {spot.budget}
                          </span>
                        </div>
                        <p className="text-[10px] opacity-70 truncate mt-0.5 flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5 text-pink-400 shrink-0" />
                          <span>{spot.address || spot.area}</span>
                          {spot.distanceKm && (
                            <span className="font-bold text-pink-500 shrink-0">(~{spot.distanceKm} km)</span>
                          )}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddSingleFromList(spot)}
                        className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold shrink-0 transition-transform active:scale-95 ${
                          isKuromi ? 'bg-pink-600 hover:bg-pink-500 text-white' : 'bg-sky-500 hover:bg-sky-400 text-white'
                        }`}
                      >
                        + Add
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Nearest Branch Picker (if chain with multiple branches detected) */}
            {detectedBranches.length > 0 && (
              <div className={`p-3.5 rounded-2xl border mb-4 text-xs animate-fade-in ${
                isKuromi ? 'bg-pink-950/30 border-pink-700/60' : 'bg-rose-50 border-rose-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-extrabold text-pink-500 uppercase tracking-wide flex items-center gap-1.5">
                    <NavIcon className="w-3.5 h-3.5 text-pink-500 animate-pulse" />
                    <span>Select Nearest Branch:</span>
                  </span>
                  <span className="text-[10px] font-bold opacity-75">
                    {detectedBranches.length} branches found
                  </span>
                </div>

                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {detectedBranches.map((b, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        playPop();
                        setNewArea(b.area);
                        setNewAddress(b.address || b.area);
                        setBranchCoords({ lat: b.lat, lng: b.lng });
                      }}
                      className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between gap-2 text-xs transition-colors ${
                        newArea === b.area
                          ? isKuromi ? 'bg-pink-900/60 border-pink-500 text-white font-bold' : 'bg-rose-100 border-pink-400 text-slate-900 font-bold'
                          : isKuromi ? 'bg-slate-900/60 border-purple-900/40 hover:bg-slate-800 text-slate-300' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          {idx === 0 && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-500/20 text-emerald-400">
                              NEAREST 🌟
                            </span>
                          )}
                          <span className="truncate">{b.area}</span>
                        </div>
                        {b.address && <p className="text-[10px] opacity-70 truncate mt-0.5">{b.address}</p>}
                      </div>

                      {b.distanceKm && (
                        <span className="shrink-0 text-[10px] font-black font-mono text-pink-500">
                          ~{b.distanceKm} km
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleAddSpotSubmit} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold mb-1 opacity-90">Place / Restaurant / Milktea Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tiger Sugar, Chili's, Mendokoro"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border font-semibold outline-none ${
                    isKuromi 
                      ? 'bg-slate-900 border-purple-900 text-white focus:border-pink-500' 
                      : 'bg-white border-slate-300 text-slate-900 focus:border-sky-500'
                  }`}
                />
              </div>

              <div>
                <label className="block font-bold mb-1 opacity-90">Cuisine / Drink Type</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. American Grill, Brown Sugar Boba, Japanese Ramen"
                  value={newCuisine}
                  onChange={(e) => setNewCuisine(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-xl border font-semibold outline-none ${
                    isKuromi 
                      ? 'bg-slate-900 border-purple-900 text-white' 
                      : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1 opacity-90">Area / Branch</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tomas Morato, Quezon City"
                    value={newArea}
                    onChange={(e) => setNewArea(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl border font-semibold outline-none ${
                      isKuromi 
                        ? 'bg-slate-900 border-purple-900 text-white' 
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1 opacity-90">Exact Street Address & Landmark</label>
                  <input
                    type="text"
                    placeholder="e.g. Scout Fernandez cor. Tomas Morato Ave, Diliman, QC"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl border font-semibold outline-none ${
                      isKuromi 
                        ? 'bg-slate-900 border-purple-900 text-white' 
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              {/* Quick Area Shortcuts */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[10px] font-bold opacity-60">Popular Date Hubs:</span>
                {[
                  { area: 'Tomas Morato, Quezon City', addr: 'Tomas Morato Ave, Diliman, Quezon City', lat: 14.6342, lng: 121.0375 },
                  { area: 'SM North / Trinoma', addr: 'North Ave cor. EDSA, Quezon City', lat: 14.6562, lng: 121.0305 },
                  { area: 'Katipunan, Quezon City', addr: 'Katipunan Ave, Diliman, Quezon City', lat: 14.6402, lng: 121.0755 },
                  { area: 'Greenhills, San Juan', addr: 'Ortigas Ave, Greenhills, San Juan', lat: 14.6019, lng: 121.0507 },
                  { area: 'SM Megamall, Ortigas', addr: 'EDSA cor. Doña Julia Vargas, Mandaluyong', lat: 14.5842, lng: 121.0568 },
                  { area: 'BGC High Street', addr: 'Bonifacio High Street, 5th Ave, BGC, Taguig', lat: 14.5508, lng: 121.0494 },
                  { area: 'Greenbelt, Makati', addr: 'Ayala Center, Legazpi Village, Makati', lat: 14.5528, lng: 121.0205 }
                ].map((hub, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      playPop();
                      setNewArea(hub.area);
                      setNewAddress(hub.addr);
                      setBranchCoords({ lat: hub.lat, lng: hub.lng });
                    }}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-colors ${
                      newArea === hub.area
                        ? 'bg-pink-600 text-white border-pink-500'
                        : isKuromi ? 'border-purple-800/60 bg-purple-950/40 text-purple-200 hover:bg-purple-900/60' : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {hub.area.split(',')[0]}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold mb-1 opacity-90">Budget</label>
                  <select
                    value={newBudget}
                    onChange={(e) => setNewBudget(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl border font-bold outline-none ${
                      isKuromi 
                        ? 'bg-slate-900 border-purple-900 text-white' 
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="$">₱ (Budget)</option>
                    <option value="$$">₱₱ (Casual Date)</option>
                    <option value="$$$">₱₱₱ (Fancy Date)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1 opacity-90">Gutom</label>
                  <select
                    value={newGutom}
                    onChange={(e) => setNewGutom(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl border font-bold outline-none ${
                      isKuromi 
                        ? 'bg-slate-900 border-purple-900 text-white' 
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="light">Drinks/Dessert 🧋</option>
                    <option value="medium">Regular 🍲</option>
                    <option value="heavy">Beast Mode 🥩</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1 opacity-90">Pagod</label>
                  <select
                    value={newPagod}
                    onChange={(e) => setNewPagod(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl border font-bold outline-none ${
                      isKuromi 
                        ? 'bg-slate-900 border-purple-900 text-white' 
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="lazy">Katabi Lang 🛵</option>
                    <option value="medium">15-30m 🚗</option>
                    <option value="adventure">Adventure 🗺️</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1 opacity-90">Must-Try Food / Drink</label>
                <input
                  type="text"
                  placeholder="e.g. Tiger Sugar Brown Sugar Boba Milk with Cream Mousse"
                  value={newTopDish}
                  onChange={(e) => setNewTopDish(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border font-semibold outline-none ${
                    isKuromi 
                      ? 'bg-slate-900 border-purple-900 text-white' 
                      : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="block font-bold mb-1 opacity-90">Sweet Couple Notes</label>
                <textarea
                  rows="2"
                  placeholder="Why Nekol & Migz should visit, romantic vibes, cozy corners..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className={`w-full px-4 py-2 rounded-xl border font-medium outline-none ${
                    isKuromi 
                      ? 'bg-slate-900 border-purple-900 text-white focus:border-pink-500' 
                      : 'bg-white border-slate-300 text-slate-900 focus:border-sky-500'
                  }`}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold opacity-75 hover:opacity-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-md ${
                    isKuromi ? 'bg-pink-600 hover:bg-pink-500' : 'bg-sky-500 hover:bg-sky-400'
                  }`}
                >
                  Add to Food Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Embedded In-App Google Maps Directions Modal */}
      <EmbeddedMapModal
        isOpen={!!activeMapSpot}
        onClose={() => setActiveMapSpot(null)}
        spot={activeMapSpot}
        userLocation={userLocation}
        isKuromi={isKuromi}
      />
    </div>
  );
}
