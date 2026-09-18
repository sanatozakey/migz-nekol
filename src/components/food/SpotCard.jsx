import React from 'react';
import { Star, MapPin, ExternalLink, Utensils, Award, Navigation as NavigationIcon, Heart } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useProfile } from '../../context/ProfileContext';
import { toggleFoodReaction } from '../../utils/storage';
import { playPop } from '../../lib/soundEffects';

export default function SpotCard({ spot, isWinner, onOpenMap }) {
  const { isKuromi } = useTheme();
  const { activeProfile } = useProfile();

  return (
    <div className={`relative p-5 rounded-3xl border transition-all duration-300 ${
      isWinner
        ? isKuromi
          ? 'border-pink-500 bg-pink-950/30 shadow-pink-500/25 shadow-xl scale-[1.02]'
          : 'border-sky-400 bg-sky-50/80 shadow-sky-400/25 shadow-xl scale-[1.02]'
        : isKuromi
          ? 'bg-[#181426] border-[#382d54] hover:border-purple-500/50 text-white'
          : 'bg-white border-slate-200 hover:border-sky-300 shadow-sm text-slate-900'
    }`}>
      {isWinner && (
        <div className="absolute -top-3 left-4 px-3 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md flex items-center gap-1">
          <Award className="w-3.5 h-3.5" />
          <span>Fate Selected This!</span>
        </div>
      )}

      {/* Header info */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap text-[11px]">
            {/* Attribution Badge */}
            {spot.added_by?.includes('Nekol') && !spot.added_by?.includes('Migz') ? (
              <span className="px-2 py-0.5 rounded-full font-black bg-pink-500/15 text-pink-400 border border-pink-500/30">
                🖤 Craved by Nekol
              </span>
            ) : spot.added_by?.includes('Migz') && !spot.added_by?.includes('Nekol') ? (
              <span className="px-2 py-0.5 rounded-full font-black bg-sky-500/15 text-sky-400 border border-sky-500/30">
                🐧 Suggested by Migz
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full font-black bg-purple-500/15 text-purple-400 border border-purple-500/30">
                💕 Couple Spot
              </span>
            )}

            <span className="px-2.5 py-0.5 rounded-md font-bold bg-pink-500/20 text-pink-500 border border-pink-500/30">
              {spot.cuisine}
            </span>
            <span className="px-2 py-0.5 rounded-md font-black bg-emerald-500/20 text-emerald-500 border border-emerald-500/30">
              {spot.budget}
            </span>
            <span className={`flex items-center gap-1 font-bold ${isKuromi ? 'text-slate-300' : 'text-slate-700'}`}>
              <MapPin className="w-3 h-3 text-pink-500 shrink-0" />
              <span className="truncate">{spot.address || spot.area}</span>
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-black font-heading mt-1">
            {spot.name}
          </h3>

          {/* Distance Indicator if closest branch computed */}
          {spot.distanceKm && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-black bg-sky-500/10 text-sky-400 border border-sky-500/30">
              <NavigationIcon className="w-3.5 h-3.5 text-pink-500 animate-pulse" />
              <span>
                Nearest: <strong>{spot.nearestBranch ? `${spot.nearestBranch.area}` : spot.area}</strong> (~{spot.distanceKm} km away)
              </span>
            </div>
          )}
        </div>

        {/* Rating Badge */}
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-500 font-black text-xs">
            <Star className="w-3.5 h-3.5 fill-amber-500" />
            <span>{spot.rating || 4.8}</span>
          </div>
          <span className={`text-[10px] font-bold mt-0.5 ${isKuromi ? 'text-slate-400' : 'text-slate-500'}`}>
            {spot.review_count ? `${spot.review_count.toLocaleString()}+ reviews` : 'Top Rated'}
          </span>
        </div>
      </div>

      {/* Top Dish Highlight */}
      {spot.top_dish && (
        <div className={`mt-3 p-2.5 rounded-xl text-xs flex items-center gap-2 border ${
          isKuromi 
            ? 'bg-purple-950/30 border-purple-900/50 text-slate-200' 
            : 'bg-slate-50 border-slate-200 text-slate-800'
        }`}>
          <Utensils className="w-3.5 h-3.5 text-pink-500 shrink-0" />
          <span className="font-semibold">
            <strong>Must-try:</strong> {spot.top_dish}
          </span>
        </div>
      )}

      {/* Description / couple note */}
      {spot.notes && (
        <p className={`mt-2 text-xs sm:text-sm font-medium leading-relaxed italic ${
          isKuromi ? 'text-slate-300' : 'text-slate-700'
        }`}>
          "{spot.notes}"
        </p>
      )}

      {/* Live Couple Reactions */}
      <div className="mt-3 pt-2.5 border-t border-slate-500/15 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1 text-xs">
          <span className="text-[10px] font-bold opacity-60 mr-1">React:</span>
          {[
            { emoji: '🤤', text: 'Craving this!' },
            { emoji: '💳', text: 'Libre ko!' },
            { emoji: '💕', text: 'Date here soon!' }
          ].map((reaction) => {
            const isSelected = spot.reactions?.[activeProfile] === reaction.emoji;
            return (
              <button
                key={reaction.emoji}
                type="button"
                onClick={async () => {
                  playPop();
                  await toggleFoodReaction(spot.id, activeProfile, reaction.emoji);
                }}
                className={`px-2 py-1 rounded-lg text-xs font-bold border transition-all flex items-center gap-1 ${
                  isSelected
                    ? 'bg-pink-500 text-white border-pink-500 shadow-sm scale-105'
                    : isKuromi
                      ? 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-pink-500/40'
                      : 'bg-slate-100 border-slate-200 text-slate-700 hover:border-pink-300'
                }`}
                title={`${reaction.text} (React as ${activeProfile})`}
              >
                <span>{reaction.emoji}</span>
              </button>
            );
          })}
        </div>

        {/* Display Partner & User Active Reactions */}
        <div className="flex items-center gap-1.5 text-[11px] font-bold">
          {spot.reactions?.Migz && (
            <span className="px-2 py-0.5 rounded-md bg-sky-500/15 text-sky-400 border border-sky-500/30">
              🐧 Migz: {spot.reactions.Migz}
            </span>
          )}
          {spot.reactions?.Nekol && (
            <span className="px-2 py-0.5 rounded-md bg-pink-500/15 text-pink-400 border border-pink-500/30">
              🖤 Nekol: {spot.reactions.Nekol}
            </span>
          )}
        </div>
      </div>

      {/* Footer & In-App Directions */}
      <div className="mt-3 pt-2.5 border-t border-slate-200/20 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[11px] font-bold opacity-75">
          <span>Gutom: <strong className="capitalize">{spot.gutom_level}</strong></span>
          <span>•</span>
          <span>Pagod: <strong className="capitalize">{spot.pagod_level}</strong></span>
        </div>

        <div className="flex items-center gap-2">
          {/* In-App Map Pin */}
          <button
            type="button"
            onClick={() => {
              playPop();
              if (onOpenMap) onOpenMap(spot);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border ${
              isKuromi
                ? 'bg-purple-950/50 hover:bg-purple-900/70 text-purple-200 border-purple-800'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-pink-500" />
            <span>View Map</span>
          </button>

          {/* In-App Turn-by-Turn Directions */}
          <button
            type="button"
            onClick={() => {
              playPop();
              if (onOpenMap) onOpenMap(spot);
            }}
            className="px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-sm transition-transform active:scale-95"
          >
            <NavigationIcon className="w-3.5 h-3.5" />
            <span>Directions</span>
          </button>
        </div>
      </div>
    </div>
  );
}
