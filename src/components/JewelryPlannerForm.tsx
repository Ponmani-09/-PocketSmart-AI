import React, { useState, useRef } from 'react';
import { Gem, Upload, Camera, Sparkles, Wand2, X, Image as ImageIcon, ShieldCheck } from 'lucide-react';
import { JewelryPlanRequest, CurrencyCode, ShoppingPlatform } from '../types';
import { formatCurrency } from '../utils/formatters';
import { JEWELRY_PRESETS } from '../data/planPresets';
import { SAMPLE_OUTFITS, SampleOutfit } from '../data/sampleOutfits';

interface JewelryPlannerFormProps {
  currency: CurrencyCode;
  onSubmit: (request: JewelryPlanRequest) => void;
  isLoading: boolean;
}

const OCCASIONS = [
  'Wedding / Reception',
  'Festive (Diwali/Eid/Puja)',
  'Cocktail Party',
  'Sangeet / Mehendi',
  'Formal / Office Gala',
  'Casual Chic / Date Night',
] as const;

const STYLES = [
  'Kundan & Polki',
  'Temple Jewelry',
  'Contemporary Minimalist',
  'American Diamond & CZ',
  'Antique / Oxidized Silver',
  'Rose Gold & Pearls',
] as const;

const PIECES = [
  'Necklaces & Chokers',
  'Earrings',
  'Bangles & Bracelets',
  'Rings & Accents',
  'Headpiece & Maang Tikka',
  'Brooch',
];

const PLATFORMS: ShoppingPlatform[] = [
  'Amazon',
  'Flipkart',
  'Myntra',
  'GIVA',
  'CaratLane / Tanishq',
];

export const JewelryPlannerForm: React.FC<JewelryPlannerFormProps> = ({
  currency,
  onSubmit,
  isLoading,
}) => {
  const [budget, setBudget] = useState<number>(12000);
  const [occasion, setOccasion] = useState<typeof OCCASIONS[number]>('Wedding / Reception');
  const [stylePreference, setStylePreference] = useState<typeof STYLES[number]>('Kundan & Polki');
  const [selectedPieces, setSelectedPieces] = useState<string[]>([
    'Necklaces & Chokers',
    'Earrings',
    'Bangles & Bracelets',
    'Rings & Accents',
  ]);
  const [metalTone, setMetalTone] = useState<'Gold' | 'Silver' | 'Rose Gold' | 'Antique Brass' | 'AI Recommended'>('AI Recommended');
  const [selectedPlatforms, setSelectedPlatforms] = useState<ShoppingPlatform[]>([
    'Amazon',
    'Flipkart',
    'Myntra',
    'CaratLane / Tanishq',
  ]);
  const [outfitDescription, setOutfitDescription] = useState<string>('');

  // Multimodal image state
  const [outfitImageBase64, setOutfitImageBase64] = useState<string | undefined>(undefined);
  const [outfitImagePreview, setOutfitImagePreview] = useState<string | null>(null);
  const [activeSampleId, setActiveSampleId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const togglePiece = (piece: string) => {
    if (selectedPieces.includes(piece)) {
      if (selectedPieces.length > 1) {
        setSelectedPieces(selectedPieces.filter((p) => p !== piece));
      }
    } else {
      setSelectedPieces([...selectedPieces, piece]);
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

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setOutfitImageBase64(dataUrl);
      setOutfitImagePreview(dataUrl);
      setActiveSampleId(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSample = (sample: SampleOutfit) => {
    setActiveSampleId(sample.id);
    setOutfitImagePreview(sample.previewUrl);
    setOutfitDescription(sample.description);
    setOccasion(sample.occasion as any);
    setStylePreference(sample.suggestedStyle as any);

    // Fetch the sample image and convert to base64 for multimodal analysis
    fetch(sample.previewUrl)
      .then((res) => res.blob())
      .then((blob) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setOutfitImageBase64(reader.result as string);
        };
        reader.readAsDataURL(blob);
      })
      .catch(() => {
        // Fallback: pass description without base64
        setOutfitImageBase64(undefined);
      });
  };

  const handleRemoveImage = () => {
    setOutfitImageBase64(undefined);
    setOutfitImagePreview(null);
    setActiveSampleId(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const loadPreset = (preset: typeof JEWELRY_PRESETS[0]) => {
    setBudget(preset.budget);
    setOccasion(preset.occasion);
    setStylePreference(preset.stylePreference);
    setSelectedPieces(preset.pieces);
    setSelectedPlatforms(preset.platforms);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      budget,
      currency,
      occasion,
      stylePreference,
      jewelryTypes: selectedPieces,
      outfitImageBase64,
      outfitDescription,
      preferredPlatforms: selectedPlatforms,
      metalTonePreference: metalTone,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Starter Presets */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Wand2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs sm:text-sm font-semibold text-slate-200">
            Quick Jewelry Presets:
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {JEWELRY_PRESETS.map((p) => (
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

      {/* 1. Multimodal Outfit Image Analysis */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Multimodal Outfit Color & Neckline Matcher (Optional)
            </label>
          </div>
          <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            Gemini Multimodal Vision
          </span>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Upload a photo of your dress, saree, or suit. PocketSmart AI detects color harmony, neckline depth, and fabric shimmer to recommend matching jewelry.
        </p>

        {/* Upload Zone / Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="md:col-span-2">
            {outfitImagePreview ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950 p-2 flex items-center gap-4">
                <img
                  src={outfitImagePreview}
                  alt="Outfit Preview"
                  className="w-24 h-24 object-cover rounded-lg border border-slate-800 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5 mb-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Outfit Locked for Multimodal Analysis</span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">
                    {outfitDescription || 'Photo ready. AI will evaluate neckline, gold/silver embroidery, and stone tones.'}
                  </p>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="mt-2 inline-flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300 font-semibold"
                  >
                    <X className="w-3 h-3" />
                    <span>Remove Photo</span>
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-950/60 flex flex-col items-center justify-center gap-2 group"
              >
                <div className="w-10 h-10 rounded-full bg-slate-800 group-hover:bg-emerald-500/20 flex items-center justify-center transition-colors">
                  <Upload className="w-5 h-5 text-slate-400 group-hover:text-emerald-400" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-200 group-hover:text-emerald-300">
                    Click or drag & drop outfit photo
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Supports PNG, JPG, WEBP (under 10MB)
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="hidden"
                />
              </div>
            )}
          </div>

          {/* Quick Sample Outfits */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-2">
              Or Try A Sample Outfit:
            </span>
            <div className="space-y-1.5">
              {SAMPLE_OUTFITS.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => handleSelectSample(sample)}
                  className={`w-full text-left p-1.5 rounded-lg flex items-center gap-2.5 transition-all text-xs border ${
                    activeSampleId === sample.id
                      ? 'bg-slate-800 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-900/60 text-slate-300 border-slate-800/80 hover:bg-slate-800'
                  }`}
                >
                  <img
                    src={sample.previewUrl}
                    alt={sample.name}
                    className="w-8 h-8 rounded object-cover shrink-0"
                  />
                  <div className="truncate">
                    <div className="font-semibold truncate">{sample.name}</div>
                    <div className="text-[10px] text-slate-400">{sample.occasion}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Outfit notes */}
        <div>
          <span className="text-[11px] font-semibold text-slate-400 block mb-1">
            Outfit Details & Neckline Notes (Optional):
          </span>
          <input
            type="text"
            value={outfitDescription}
            onChange={(e) => setOutfitDescription(e.target.value)}
            placeholder="e.g. Deep V-neck emerald green saree with silver zari embroidery, heavy silk texture"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* 2. Budget & Occasion */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            2. Total Jewelry Budget ({currency})
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg pointer-events-none">
              {currency === 'INR' ? '₹' : '$'}
            </span>
            <input
              type="number"
              min="1000"
              step="500"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value) || 0)}
              className="w-full pl-9 pr-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-lg font-extrabold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              required
            />
          </div>
          <div className="flex items-center justify-between mt-2.5 text-xs text-slate-400">
            <span>Quick:</span>
            <div className="flex gap-1.5">
              {[5000, 10000, 20000, 50000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setBudget(val)}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-medium text-slate-300"
                >
                  {formatCurrency(val, currency)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Occasion */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            3. Occasion / Event
          </label>
          <div className="grid grid-cols-2 gap-2">
            {OCCASIONS.map((occ) => (
              <button
                key={occ}
                type="button"
                onClick={() => setOccasion(occ)}
                className={`py-2 px-3 text-xs font-semibold rounded-xl text-left truncate transition-all ${
                  occasion === occ
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-950 text-slate-300 border border-slate-800 hover:border-slate-700'
                }`}
              >
                {occ}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Style Preference & Metal Tone */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            4. Jewelry Style & Aesthetics
          </label>
          <div className="grid grid-cols-2 gap-2">
            {STYLES.map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStylePreference(st)}
                className={`py-2 px-3 text-xs font-semibold rounded-xl text-left truncate transition-all ${
                  stylePreference === st
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-950 text-slate-300 border border-slate-800 hover:border-slate-700'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Metal Tone */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            5. Metal Tone Preference
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(['AI Recommended', 'Gold', 'Silver', 'Rose Gold', 'Antique Brass'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMetalTone(m)}
                className={`py-2 px-3 text-xs font-semibold rounded-xl text-left truncate transition-all ${
                  metalTone === m
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-950 text-slate-300 border border-slate-800 hover:border-slate-700'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Pieces Needed & Platforms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            6. Pieces Needed in Collection
          </label>
          <div className="grid grid-cols-2 gap-2">
            {PIECES.map((piece) => {
              const isSelected = selectedPieces.includes(piece);
              return (
                <button
                  key={piece}
                  type="button"
                  onClick={() => togglePiece(piece)}
                  className={`p-2 text-xs font-semibold rounded-xl text-left transition-all border ${
                    isSelected
                      ? 'bg-slate-800 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] ${isSelected ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-transparent'}`}>
                      ✓
                    </span>
                    <span className="truncate">{piece}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Platforms */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            7. Jewelry Sourcing Platforms
          </label>
          <p className="text-xs text-slate-500 mb-3">
            PocketSmart AI curates matching pieces across trusted e-commerce jewelry stores:
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
      </div>

      {/* Submit */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading || selectedPieces.length === 0}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold text-sm sm:text-base shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              <span>Matching Neckline, Metal Tones & Curating from Amazon, Myntra, CaratLane...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-slate-950" />
              <span>Generate Coordinated Jewelry Budget & Pieces</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};
