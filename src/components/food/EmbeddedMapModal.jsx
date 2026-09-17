import React, { useState } from 'react';
import { 
  X, Navigation, MapPin, Copy, Check, ExternalLink, 
  Car, Footprints, ZoomIn, ZoomOut, RotateCcw, 
  Maximize2, Minimize2, Layers
} from 'lucide-react';
import { playPop } from '../../lib/soundEffects';

export default function EmbeddedMapModal({ isOpen, onClose, spot, userLocation, isKuromi }) {
  const [copied, setCopied] = useState(false);
  const [mapMode, setMapMode] = useState('driving'); // 'driving', 'walking', 'pin'
  const [mapType, setMapType] = useState('normal'); // 'normal' or 'satellite'
  const [zoomLevel, setZoomLevel] = useState(15);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);

  if (!isOpen || !spot) return null;

  // Active branch selection (fallback to nearestBranch or first branch or spot coords)
  const currentBranch = selectedBranch || spot.nearestBranch || (spot.branches && spot.branches[0]) || spot;
  const targetLat = currentBranch.lat || spot.lat;
  const targetLng = currentBranch.lng || spot.lng;
  const targetAddress = currentBranch.address || currentBranch.area || spot.address || spot.area;
  const targetArea = currentBranch.area || spot.area;
  const targetDistance = currentBranch.distanceKm || spot.distanceKm;

  const hasGps = userLocation && userLocation.lat && userLocation.lng;
  const hasTargetCoords = !!(targetLat && targetLng);

  const handleCopyAddress = () => {
    playPop();
    const addr = targetAddress || spot.name;
    navigator.clipboard.writeText(addr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Build Google Maps embedded URL
  const typeParam = mapType === 'satellite' ? '&t=k' : '&t=m';
  const zoomParam = zoomLevel ? `&z=${zoomLevel}` : '';

  let embedUrl = '';
  if (mapMode === 'driving') {
    if (hasGps && hasTargetCoords) {
      embedUrl = `https://maps.google.com/maps?saddr=${userLocation.lat},${userLocation.lng}&daddr=${targetLat},${targetLng}&hl=en${zoomParam}${typeParam}&dirflg=d&output=embed`;
    } else if (hasTargetCoords) {
      embedUrl = `https://maps.google.com/maps?daddr=${targetLat},${targetLng}&hl=en${zoomParam}${typeParam}&dirflg=d&output=embed`;
    } else {
      const query = `${spot.name} ${targetAddress || 'Metro Manila'}`;
      embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&hl=en${zoomParam}${typeParam}&output=embed`;
    }
  } else if (mapMode === 'walking') {
    if (hasGps && hasTargetCoords) {
      embedUrl = `https://maps.google.com/maps?saddr=${userLocation.lat},${userLocation.lng}&daddr=${targetLat},${targetLng}&hl=en${zoomParam}${typeParam}&dirflg=w&output=embed`;
    } else if (hasTargetCoords) {
      embedUrl = `https://maps.google.com/maps?daddr=${targetLat},${targetLng}&hl=en${zoomParam}${typeParam}&dirflg=w&output=embed`;
    } else {
      const query = `${spot.name} ${targetAddress || 'Metro Manila'}`;
      embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&hl=en${zoomParam}${typeParam}&output=embed`;
    }
  } else {
    // Location Pin mode
    if (hasTargetCoords) {
      embedUrl = `https://maps.google.com/maps?q=${targetLat},${targetLng}+(${encodeURIComponent(spot.name)})&hl=en${zoomParam}${typeParam}&output=embed`;
    } else {
      const query = `${spot.name} ${targetAddress || 'Metro Manila'}`;
      embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&hl=en${zoomParam}${typeParam}&output=embed`;
    }
  }

  // External app shortcuts
  const travelModeParam = mapMode === 'walking' ? 'walking' : 'driving';
  const googleMapsAppUrl = hasGps && hasTargetCoords
    ? `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${targetLat},${targetLng}&travelmode=${travelModeParam}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spot.name + ' ' + targetAddress)}`;

  const wazeAppUrl = hasTargetCoords
    ? `https://www.waze.com/ul?ll=${targetLat},${targetLng}&navigate=yes`
    : `https://www.waze.com/ul?q=${encodeURIComponent(spot.name + ' ' + targetAddress)}`;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
      <div 
        className={`relative flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-all duration-300 ${
          isFullscreen
            ? 'w-[98vw] h-[95vh] max-w-none'
            : 'w-full max-w-4xl h-[88vh] max-h-[760px]'
        } ${
          isKuromi 
            ? 'bg-[#181426] border-purple-800/80 text-white shadow-purple-950/60' 
            : 'bg-white border-sky-200 text-slate-900 shadow-2xl'
        }`}
      >
        {/* Header */}
        <div className={`px-4 py-3 sm:px-6 sm:py-4 border-b flex items-center justify-between gap-3 shrink-0 ${
          isKuromi ? 'border-purple-900/60 bg-purple-950/50' : 'border-slate-100 bg-sky-50/60'
        }`}>
          <div className="space-y-0.5 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-black text-lg sm:text-xl font-heading truncate">
                {spot.name}
              </h3>
              {targetDistance && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-pink-500/20 text-pink-400 border border-pink-500/30 flex items-center gap-1 shrink-0">
                  <Navigation className="w-3 h-3 text-pink-500" />
                  <span>~{targetDistance} km away</span>
                </span>
              )}
            </div>

            <p className="text-xs font-semibold opacity-80 flex items-center gap-1 truncate">
              <MapPin className="w-3.5 h-3.5 text-pink-500 shrink-0" />
              <span className="truncate">{targetAddress}</span>
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Fullscreen / Maximize Toggle */}
            <button
              onClick={() => { playPop(); setIsFullscreen(prev => !prev); }}
              className={`p-2 rounded-xl border transition-colors ${
                isKuromi ? 'border-purple-800 hover:bg-purple-900 text-purple-200' : 'border-slate-200 hover:bg-slate-100 text-slate-700'
              }`}
              title={isFullscreen ? 'Exit Fullscreen' : 'Expand Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close Button */}
            <button
              onClick={() => { playPop(); onClose(); }}
              className={`p-2 rounded-xl border transition-colors ${
                isKuromi ? 'border-purple-800 hover:bg-purple-900 text-purple-200' : 'border-slate-200 hover:bg-slate-100 text-slate-700'
              }`}
              title="Close Map"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Toolbar: Navigation Modes, Satellite Toggle, Branch Switcher & Zoom */}
        <div className={`px-4 py-2 sm:px-6 border-b flex flex-wrap items-center justify-between gap-2 text-xs font-bold shrink-0 ${
          isKuromi ? 'border-purple-900/40 bg-slate-900/60' : 'border-slate-100 bg-slate-50/80'
        }`}>
          {/* Navigation Modes */}
          <div className="flex items-center gap-1 flex-wrap">
            <button
              onClick={() => { playPop(); setMapMode('driving'); }}
              className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all text-xs ${
                mapMode === 'driving'
                  ? isKuromi ? 'bg-pink-600 text-white shadow-sm' : 'bg-sky-500 text-white shadow-sm'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              <Car className="w-3.5 h-3.5" />
              <span>Drive</span>
            </button>

            <button
              onClick={() => { playPop(); setMapMode('walking'); }}
              className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all text-xs ${
                mapMode === 'walking'
                  ? isKuromi ? 'bg-pink-600 text-white shadow-sm' : 'bg-sky-500 text-white shadow-sm'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              <Footprints className="w-3.5 h-3.5" />
              <span>Walk</span>
            </button>

            <button
              onClick={() => { playPop(); setMapMode('pin'); }}
              className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all text-xs ${
                mapMode === 'pin'
                  ? isKuromi ? 'bg-pink-600 text-white shadow-sm' : 'bg-sky-500 text-white shadow-sm'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Location Pin</span>
            </button>
          </div>

          {/* Center Tools: Map Type & Zoom Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Map Style (Road vs Satellite) */}
            <button
              onClick={() => {
                playPop();
                setMapType(prev => prev === 'normal' ? 'satellite' : 'normal');
              }}
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold flex items-center gap-1 transition-colors ${
                mapType === 'satellite'
                  ? isKuromi ? 'bg-purple-600 text-white border-purple-500' : 'bg-sky-600 text-white border-sky-500'
                  : isKuromi ? 'border-purple-800 hover:bg-purple-900 text-purple-200' : 'border-slate-300 hover:bg-slate-100 text-slate-700'
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>{mapType === 'satellite' ? 'Satellite 🛰️' : 'Road Map 🗺️'}</span>
            </button>

            {/* Quick Zoom Bar */}
            <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-xl border text-[11px] ${
              isKuromi ? 'bg-slate-900 border-purple-800' : 'bg-white border-slate-300'
            }`}>
              <button
                onClick={() => { playPop(); setZoomLevel(prev => Math.max(12, prev - 1)); }}
                className="p-1 hover:text-pink-500 transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-[10px] font-black px-1 opacity-80 select-none">
                {zoomLevel}z
              </span>
              <button
                onClick={() => { playPop(); setZoomLevel(prev => Math.min(19, prev + 1)); }}
                className="p-1 hover:text-pink-500 transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => { playPop(); setZoomLevel(15); }}
                className="p-1 opacity-60 hover:opacity-100 transition-opacity"
                title="Reset Default Zoom"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>

            {/* Branch Switcher Dropdown if multiple branches exist */}
            {spot.branches && spot.branches.length > 1 && (
              <select
                value={currentBranch.area || ''}
                onChange={(e) => {
                  const b = spot.branches.find(item => item.area === e.target.value);
                  if (b) {
                    playPop();
                    setSelectedBranch(b);
                  }
                }}
                className={`px-2 py-1 rounded-lg border text-[11px] font-bold outline-none max-w-[160px] truncate ${
                  isKuromi ? 'bg-slate-900 border-purple-800 text-purple-200' : 'bg-white border-slate-300 text-slate-800'
                }`}
                title="Select Branch"
              >
                {spot.branches.map((b, idx) => (
                  <option key={idx} value={b.area}>
                    {b.area} {b.distanceKm ? `(~${b.distanceKm} km)` : ''}
                  </option>
                ))}
              </select>
            )}

            {/* Copy Address Button */}
            <button
              onClick={handleCopyAddress}
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold flex items-center gap-1 transition-all ${
                copied
                  ? 'bg-emerald-600 text-white border-emerald-500'
                  : isKuromi ? 'border-purple-800 hover:bg-purple-900 text-purple-200' : 'border-slate-300 hover:bg-slate-100 text-slate-700'
              }`}
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Embedded Interactive Map Container - Absolute Full Bleed (Fixes 150px Collapse) */}
        <div className="relative flex-1 w-full h-full min-h-[380px] sm:min-h-[460px] bg-slate-950 overflow-hidden">
          <iframe
            title={`Directions to ${spot.name}`}
            src={embedUrl}
            className="absolute inset-0 w-full h-full border-0"
            style={{ width: '100%', height: '100%', minHeight: '100%', display: 'block' }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />

          {/* Floating Gesture & Scroll Helper Tip */}
          <div className="absolute top-3 right-3 z-10 pointer-events-none hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md text-white border border-white/10 text-[10px] font-semibold shadow-md">
            <span>🖱️ Drag to pan</span>
            <span>•</span>
            <span>Hold Ctrl + Scroll to zoom</span>
          </div>
        </div>

        {/* Footer: Tips & Mobile GPS App Shortcuts */}
        <div className={`px-4 py-2.5 sm:px-6 sm:py-3 border-t flex flex-wrap items-center justify-between gap-2.5 text-xs shrink-0 ${
          isKuromi ? 'border-purple-900/60 bg-purple-950/40' : 'border-slate-100 bg-sky-50/50'
        }`}>
          <div className="text-[11px] opacity-75 font-medium flex items-center gap-1.5">
            <span className="text-pink-500 font-bold">💡 Tip:</span>
            <span>Fully interactive in-app Google Maps — pan, zoom & view live traffic without leaving the page!</span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={wazeAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 rounded-lg text-[11px] font-bold border border-sky-400/40 text-sky-400 hover:bg-sky-500/10 flex items-center gap-1"
              title="Open Turn-by-Turn Navigation in Waze"
            >
              <span>Waze</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
            <a
              href={googleMapsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 rounded-lg text-[11px] font-bold border border-pink-400/40 text-pink-400 hover:bg-pink-500/10 flex items-center gap-1"
              title="Open in Google Maps App"
            >
              <span>Maps App</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
            <button
              onClick={() => { playPop(); onClose(); }}
              className={`px-4 py-1.5 rounded-xl font-bold text-white shadow-sm transition-transform active:scale-95 ${
                isKuromi ? 'bg-purple-600 hover:bg-purple-500' : 'bg-slate-800 hover:bg-slate-700'
              }`}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

