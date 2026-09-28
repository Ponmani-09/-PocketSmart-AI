import React, { useState } from 'react';
import { PartyPopper, Users, Sparkles, Wand2, MapPin, Utensils, Music, Tag, Clock } from 'lucide-react';
import { PartyPlanRequest, CurrencyCode, ShoppingPlatform } from '../types';
import { formatCurrency } from '../utils/formatters';
import { PARTY_PRESETS } from '../data/planPresets';

interface PartyPlannerFormProps {
  currency: CurrencyCode;
  onSubmit: (request: PartyPlanRequest) => void;
  isLoading: boolean;
}

const EVENT_TYPES = [
  'Birthday',
  'Wedding / Reception',
  'Corporate Event',
  'Anniversary',
  'Housewarming',
  'Bachelor / Bachelorette',
  'Festive Dinner',
  'Cocktail Party',
] as const;

const VENUE_TYPES = [
  'Home / Living Room',
  'Rented Villa / OYO',
  'Rooftop Lounge',
  'Banquet Hall',
  'Outdoor Lawn / Garden',
] as const;

const DIETARY_OPTIONS = [
  'Pure Veg Gourmet',
  'Veg & Non-Veg Mixed',
  'Finger Food & Tapas',
  'Bar Snacks & Drinks',
  'Buffet Feast',
] as const;

const ENTERTAINMENT_OPTIONS = [
  'DJ & Sound System',
  'Live Acoustic Singer',
  'Games & Host/MC',
  'Selfie Photobooth & Props',
  'Karaoke Setup',
  'Dance Floor & Party Lights',
];

const PLATFORMS: ShoppingPlatform[] = [
  'Swiggy',
  'Zomato',
  'OYO',
  'Amazon',
  'Blinkit',
];

export const PartyPlannerForm: React.FC<PartyPlannerFormProps> = ({
  currency,
  onSubmit,
  isLoading,
}) => {
  const [totalBudget, setTotalBudget] = useState<number>(20000);
  const [guestCount, setGuestCount] = useState<number>(25);
  const [eventType, setEventType] = useState<typeof EVENT_TYPES[number]>('Birthday');
  const [venueType, setVenueType] = useState<typeof VENUE_TYPES[number]>('Rooftop Lounge');
  const [vibe, setVibe] = useState<string>('Neon Glow & High Energy');
  const [dietary, setDietary] = useState<typeof DIETARY_OPTIONS[number]>('Veg & Non-Veg Mixed');
  const [entertainment, setEntertainment] = useState<string[]>([
    'DJ & Sound System',
    'Selfie Photobooth & Props',
  ]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<ShoppingPlatform[]>([
    'Swiggy',
    'Zomato',
    'OYO',
    'Amazon',
    'Blinkit',
  ]);
  const [notes, setNotes] = useState<string>('');

  const perGuestEst = Math.round(totalBudget / Math.max(1, guestCount));

  const toggleEntertainment = (ent: string) => {
    if (entertainment.includes(ent)) {
      setEntertainment(entertainment.filter((e) => e !== ent));
    } else {
      setEntertainment([...entertainment, ent]);
    }
  };

  const togglePlatform = (plat: ShoppingPlatform) => {
    if (selectedPlatforms.includes(plat)) {
      if (selectedPlatforms.length > 1) {
        setSelectedPlatforms(selectedPlatforms.filter((p) => p !== plat));
      }
    } else {
      setSelectedPlatforms([...selectedPlatforms, plat]);
    }
  };

  const loadPreset = (preset: typeof PARTY_PRESETS[0]) => {
    setTotalBudget(preset.budget);
    setGuestCount(preset.guestCount);
    setEventType(preset.eventType);
    setVenueType(preset.venueType);
    setVibe(preset.vibe);
    setDietary(preset.dietary);
    setEntertainment(preset.entertainment);
    setSelectedPlatforms(preset.platforms);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      totalBudget,
      currency,
      guestCount,
      eventType,
      venueType,
      vibe,
      dietary,
      entertainment,
      preferredPlatforms: selectedPlatforms,
      notes,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Quick Starter Presets */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Wand2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs sm:text-sm font-semibold text-slate-200">
            Quick Event Presets:
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {PARTY_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => loadPreset(p)}
              className="px-3 py-1 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-emerald-600/30 text-slate-300 hover:text-emerald-200 border border-slate-700 transition-colors"
            >
              {p.title} ({formatCurrency(p.budget, currency)})
            </button>
          ))}
        </div>
      </div>

      {/* 1. Budget & Guest Count */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              1. Total Event Budget ({currency})
            </label>
            <span className="text-xs text-emerald-400 font-semibold">
              ≈ {formatCurrency(perGuestEst, currency)} / guest
            </span>
          </div>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg pointer-events-none">
              {currency === 'INR' ? '₹' : '$'}
            </span>
            <input
              type="number"
              min="2000"
              step="500"
              value={totalBudget}
              onChange={(e) => setTotalBudget(Number(e.target.value) || 0)}
              className="w-full pl-9 pr-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-lg font-extrabold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              required
            />
          </div>
          <div className="flex items-center justify-between mt-2.5 text-xs text-slate-400">
            <span>Quick:</span>
            <div className="flex gap-1.5">
              {[15000, 25000, 50000, 100000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setTotalBudget(val)}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-medium text-slate-300"
                >
                  {formatCurrency(val, currency)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Guest Count */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            2. Expected Guest Count
          </label>
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <Users className="w-5 h-5 text-slate-500" />
              </span>
              <input
                type="number"
                min="2"
                max="500"
                value={guestCount}
                onChange={(e) => setGuestCount(Number(e.target.value) || 1)}
                className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-lg font-extrabold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
            <div className="flex gap-1.5">
              {[10, 25, 50, 100].map((gc) => (
                <button
                  key={gc}
                  type="button"
                  onClick={() => setGuestCount(gc)}
                  className={`px-3 py-3 rounded-xl text-xs font-bold transition-colors ${
                    guestCount === gc
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-950 text-slate-300 border border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {gc}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Event Type & Venue */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            3. Occasion / Event Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            {EVENT_TYPES.map((ev) => (
              <button
                key={ev}
                type="button"
                onClick={() => setEventType(ev)}
                className={`py-2 px-3 text-xs font-semibold rounded-xl text-left truncate transition-all ${
                  eventType === ev
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-950 text-slate-300 border border-slate-800 hover:border-slate-700'
                }`}
              >
                {ev}
              </button>
            ))}
          </div>
        </div>

        {/* Venue Type & Vibe */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            4. Venue Type
          </label>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {VENUE_TYPES.map((ven) => (
              <button
                key={ven}
                type="button"
                onClick={() => setVenueType(ven)}
                className={`py-2 px-3 text-xs font-semibold rounded-xl text-left truncate transition-all ${
                  venueType === ven
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-950 text-slate-300 border border-slate-800 hover:border-slate-700'
                }`}
              >
                {ven}
              </button>
            ))}
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block mb-1">Theme / Atmosphere Vibe</span>
            <input
              type="text"
              value={vibe}
              onChange={(e) => setVibe(e.target.value)}
              placeholder="e.g. Vintage Bollywood, Tropical Boho, Elegant Evening"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* 3. Catering & Entertainment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            5. Catering & Food Preference
          </label>
          <div className="space-y-2">
            {DIETARY_OPTIONS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDietary(d)}
                className={`w-full py-2.5 px-3.5 text-xs font-semibold rounded-xl text-left flex items-center justify-between transition-all ${
                  dietary === d
                    ? 'bg-slate-800 text-emerald-300 border border-emerald-500/40'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                <span>{d}</span>
                {dietary === d && <span className="text-emerald-400 text-xs">● Active</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Entertainment */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            6. Entertainment & Sound Requirements
          </label>
          <div className="grid grid-cols-2 gap-2">
            {ENTERTAINMENT_OPTIONS.map((ent) => {
              const isChecked = entertainment.includes(ent);
              return (
                <button
                  key={ent}
                  type="button"
                  onClick={() => toggleEntertainment(ent)}
                  className={`p-2 text-xs font-semibold rounded-xl text-left transition-all border ${
                    isChecked
                      ? 'bg-slate-800 text-emerald-300 border-emerald-500/40 shadow-sm'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] ${isChecked ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-transparent'}`}>
                      ✓
                    </span>
                    <span className="truncate">{ent}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sourcing Platforms & Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            7. Cross-Platform Sourcing
          </label>
          <p className="text-xs text-slate-500 mb-3">
            PocketSmart AI allocates and quotes directly from these partner services:
          </p>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map((plat) => {
              const isSelected = selectedPlatforms.includes(plat);
              return (
                <button
                  key={plat}
                  type="button"
                  onClick={() => togglePlatform(plat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                    isSelected
                      ? 'bg-slate-800 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-950 text-slate-500 border-slate-800'
                  }`}
                >
                  {plat}
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Special Requests / Dietary Restrictions
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="e.g. Need gluten-free starters, custom 2kg chocolate cake topper, rooftop closing time is 11 PM..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold text-sm sm:text-base shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              <span>Allocating Catering, OYO Stay, Amazon Decor & Swiggy Feasts...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-slate-950" />
              <span>Generate AI Event Budget Allocation & Vendor Plan</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};
