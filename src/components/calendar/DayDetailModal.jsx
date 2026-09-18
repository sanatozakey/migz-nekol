import React, { useState } from 'react';
import { Camera, Heart, Plus, Trash2, X, Sparkles, Image as ImageIcon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useProfile } from '../../context/ProfileContext';
import { playPop, playSuccessFanfare } from '../../lib/soundEffects';

export const MOODS = [
  'Super in love 🥰',
  'Cozy & happy 🧸',
  'Food trip beast mode 🤤',
  'Romantic date night 🍷',
  'Silly & laughing 🤪',
  'Milestone celebration 🥂'
];

export default function DayDetailModal({ date, memories, onClose, onSaveMemory, onDeleteMemory }) {
  const { isKuromi } = useTheme();
  const { activeProfile } = useProfile();

  const [entryDate, setEntryDate] = useState(date || new Date().toISOString().split('T')[0]);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [mood, setMood] = useState('Super in love 🥰');
  const [capturedBy, setCapturedBy] = useState(activeProfile);
  const [photoUrl, setPhotoUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Filter memories for this specific date
  const dayMemories = memories.filter(m => m.date === entryDate);

  // Handle local image file selection & compression
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Compress image using canvas to ensure lightweight storage
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 900;
        const MAX_HEIGHT = 900;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.75);
        setPhotoUrl(compressedDataUrl);
        setIsUploading(false);
        playPop();
      };
      img.src = event.target?.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    playSuccessFanfare();

    onSaveMemory({
      id: `mem-${Date.now()}`,
      date: entryDate,
      title: title.trim(),
      notes: notes.trim(),
      mood,
      photo_url: photoUrl,
      captured_by: capturedBy || activeProfile
    });

    setTitle('');
    setNotes('');
    setPhotoUrl('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className={`w-full max-w-lg max-h-[90vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden ${
        isKuromi 
          ? 'bg-kuromi-surface border-kuromi-border text-white' 
          : 'bg-white border-penguin-200 text-slate-800'
      }`}>
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200/20 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">📅</span>
              <h3 className="text-lg sm:text-xl font-bold font-heading">
                Memories for {new Date(date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </h3>
            </div>
            <p className="text-xs opacity-70 mt-0.5">
              What happened on this day between Nekol & Bebe 💕
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* Milestone Banner if 19th or June 19th - High Contrast */}
          {entryDate.endsWith('-06-19') ? (
            <div className={`p-4 rounded-2xl border-2 flex items-center gap-3.5 shadow-sm ${
              isKuromi 
                ? 'bg-gradient-to-r from-amber-950/80 via-purple-950/80 to-slate-950 border-amber-400 text-amber-200' 
                : 'bg-amber-50 border-amber-400 text-amber-950'
            }`}>
              <span className="text-3xl animate-bounce-slow shrink-0">💍</span>
              <div>
                <h4 className={`font-black text-sm sm:text-base font-heading ${
                  isKuromi ? 'text-amber-300' : 'text-amber-950'
                }`}>
                  GRAND ANNIVERSARY DATE! (June 19th) 🥂✨
                </h4>
                <p className={`text-xs mt-0.5 font-bold ${
                  isKuromi ? 'text-amber-100/90' : 'text-amber-900'
                }`}>
                  The day we officially became us! Record how we celebrated our anniversary and cherish this moment forever! 💕
                </p>
              </div>
            </div>
          ) : entryDate.endsWith('-19') ? (
            <div className={`p-4 rounded-2xl border-2 flex items-center gap-3.5 shadow-sm ${
              isKuromi 
                ? 'bg-gradient-to-r from-pink-950/80 via-purple-950/80 to-slate-950 border-pink-500 text-pink-200' 
                : 'bg-rose-50 border-rose-400 text-rose-950'
            }`}>
              <span className="text-3xl animate-bounce-slow shrink-0">💖</span>
              <div>
                <h4 className={`font-black text-sm sm:text-base font-heading ${
                  isKuromi ? 'text-pink-300' : 'text-rose-950'
                }`}>
                  HAPPY MONTHSARY! (19th of the Month) 💕
                </h4>
                <p className={`text-xs mt-0.5 font-bold ${
                  isKuromi ? 'text-pink-100' : 'text-rose-900'
                }`}>
                  Another wonderful month with Nekol! Log our monthsary date, sweet notes, and cute photos together! 🥰
                </p>
              </div>
            </div>
          ) : null}

          {/* Existing Memories List for This Day */}
          {dayMemories.length > 0 ? (
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider opacity-75">
                Logged Memories ({dayMemories.length})
              </h4>

              {dayMemories.map(mem => (
                <div
                  key={mem.id}
                  className={`p-4 rounded-2xl border space-y-3 ${
                    isKuromi 
                      ? 'bg-slate-900/80 border-purple-900/40' 
                      : 'bg-sky-50/60 border-sky-200/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-pink-500/20 text-pink-400">
                          {mem.mood}
                        </span>
                        {mem.captured_by && (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            mem.captured_by === 'Nekol'
                              ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30'
                              : mem.captured_by === 'Migz'
                                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                                : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          }`}>
                            📸 Captured by {mem.captured_by}
                          </span>
                        )}
                      </div>
                      <h5 className="text-base font-bold font-heading mt-1">
                        {mem.title}
                      </h5>
                    </div>

                    <button
                      onClick={() => onDeleteMemory(mem.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                      title="Delete memory"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Photo Preview if exists */}
                  {mem.photo_url && (
                    <div className="relative rounded-xl overflow-hidden border border-slate-700/30 max-h-64 flex items-center justify-center bg-black/20">
                      <img
                        src={mem.photo_url}
                        alt="Couple memory"
                        className="w-full h-auto object-cover max-h-64 rounded-xl"
                      />
                    </div>
                  )}

                  {mem.notes && (
                    <p className="text-xs sm:text-sm opacity-90 leading-relaxed italic bg-white/5 p-3 rounded-xl">
                      "{mem.notes}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-4 text-center opacity-60">
              <Heart className="w-8 h-8 mx-auto mb-1 text-pink-400" />
              <p className="text-xs font-medium">No memories recorded yet for this date!</p>
            </div>
          )}

          {/* Add New Memory Form */}
          <div className={`p-4 rounded-2xl border ${
            isKuromi ? 'bg-purple-950/20 border-purple-800/40' : 'bg-slate-50 border-slate-200'
          }`}>
            <h4 className="font-bold text-sm font-heading mb-3 flex items-center gap-1.5 text-pink-500">
              <Plus className="w-4 h-4" />
              <span>Record a New Moment</span>
            </h4>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1 opacity-90">Memory Date 📅</label>
                  <input
                    type="date"
                    required
                    value={entryDate}
                    onChange={(e) => setEntryDate(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl border font-bold outline-none ${
                      isKuromi 
                        ? 'bg-slate-900 border-kuromi-border text-white focus:border-pink-500' 
                        : 'bg-white border-slate-300 text-slate-900 focus:border-sky-500'
                    }`}
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1 opacity-90">Couple Mood</label>
                  <select
                    value={mood}
                    onChange={(e) => setMood(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl border font-semibold outline-none ${
                      isKuromi 
                        ? 'bg-slate-900 border-kuromi-border text-white' 
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  >
                    {MOODS.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Captured By Selector */}
              <div>
                <label className="block font-bold mb-1 opacity-90">Captured By</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => { playPop(); setCapturedBy('Nekol'); }}
                    className={`flex-1 py-1.5 px-3 rounded-xl font-bold text-xs border flex items-center justify-center gap-1 transition-all ${
                      capturedBy === 'Nekol'
                        ? 'bg-pink-500/20 border-pink-500 text-pink-400 shadow-sm'
                        : isKuromi ? 'border-purple-900/60 bg-purple-950/40 text-purple-300 opacity-60' : 'border-slate-200 bg-slate-50 text-slate-600 opacity-60'
                    }`}
                  >
                    <span>🖤 Nekol</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { playPop(); setCapturedBy('Migz'); }}
                    className={`flex-1 py-1.5 px-3 rounded-xl font-bold text-xs border flex items-center justify-center gap-1 transition-all ${
                      capturedBy === 'Migz'
                        ? 'bg-sky-500/20 border-sky-500 text-sky-400 shadow-sm'
                        : isKuromi ? 'border-purple-900/60 bg-purple-950/40 text-purple-300 opacity-60' : 'border-slate-200 bg-slate-50 text-slate-600 opacity-60'
                    }`}
                  >
                    <span>🐧 Migz</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { playPop(); setCapturedBy('Migz & Nekol'); }}
                    className={`flex-1 py-1.5 px-3 rounded-xl font-bold text-xs border flex items-center justify-center gap-1 transition-all ${
                      capturedBy === 'Migz & Nekol'
                        ? 'bg-purple-500/20 border-purple-500 text-purple-300 shadow-sm'
                        : isKuromi ? 'border-purple-900/60 bg-purple-950/40 text-purple-300 opacity-60' : 'border-slate-200 bg-slate-50 text-slate-600 opacity-60'
                    }`}
                  >
                    <span>💕 Both</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1 opacity-90">Title / Occasion</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sunset walk in BGC, Anniversary date, First movie..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border font-semibold outline-none ${
                    isKuromi 
                      ? 'bg-slate-900 border-kuromi-border text-white focus:border-pink-500' 
                      : 'bg-white border-slate-300 text-slate-900 focus:border-sky-500'
                  }`}
                />
              </div>

              {/* Photo Upload Section */}
              <div>
                <label className="block font-semibold mb-1 opacity-80">Upload Couple Picture 📸</label>
                <div className="flex items-center gap-3">
                  <label className={`cursor-pointer px-4 py-2.5 rounded-xl border font-bold text-xs flex items-center gap-2 transition-colors ${
                    isKuromi
                      ? 'bg-purple-900/40 border-purple-700 text-purple-200 hover:bg-purple-800/50'
                      : 'bg-sky-100 border-sky-300 text-sky-800 hover:bg-sky-200'
                  }`}>
                    <Camera className="w-4 h-4" />
                    <span>{photoUrl ? 'Change Photo' : 'Select Photo'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>

                  {photoUrl && (
                    <button
                      type="button"
                      onClick={() => setPhotoUrl('')}
                      className="text-xs text-red-400 hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>

                {isUploading && (
                  <p className="text-xs text-sky-400 mt-1 animate-pulse">Processing image...</p>
                )}

                {photoUrl && (
                  <div className="mt-3 relative w-32 h-32 rounded-xl overflow-hidden border border-slate-700 shadow-md">
                    <img src={photoUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold mb-1 opacity-80">What happened on this day?</label>
                <textarea
                  rows="3"
                  placeholder="Notes, funny stories, sweet things Nekol said, or what this day meant to you..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border font-medium outline-none ${
                    isKuromi 
                      ? 'bg-slate-900 border-kuromi-border text-white focus:border-pink-500' 
                      : 'bg-white border-slate-200 text-slate-800 focus:border-sky-500'
                  }`}
                />
              </div>

              <button
                type="submit"
                className={`w-full py-3 rounded-xl font-bold text-xs sm:text-sm text-white shadow-md transition-transform active:scale-95 ${
                  isKuromi ? 'bg-pink-600 hover:bg-pink-500' : 'bg-sky-500 hover:bg-sky-400'
                }`}
              >
                Save This Memory 💕
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
