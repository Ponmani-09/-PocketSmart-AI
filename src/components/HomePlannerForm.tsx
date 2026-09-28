import React, { useState } from 'react';
import { Plus, Trash2, Home, Sparkles, Layers, Sliders, CheckSquare, Wand2, Info } from 'lucide-react';
import { HomePlanRequest, HomeRoomItem, CurrencyCode, ShoppingPlatform } from '../types';
import { formatCurrency } from '../utils/formatters';
import { HOME_PRESETS } from '../data/planPresets';

interface HomePlannerFormProps {
  currency: CurrencyCode;
  onSubmit: (request: HomePlanRequest) => void;
  isLoading: boolean;
}

const AVAILABLE_ROOMS = [
  'Living Room',
  'Bedroom',
  'Kitchen',
  'Dining Room',
  'Home Office',
  'Balcony / Outdoor',
  'Bathroom',
];

const STYLES = [
  'Modern Minimalist',
  'Scandinavian',
  'Bohemian Chic',
  'Industrial Loft',
  'Japandi',
  'Traditional Heritage',
];

const PLATFORMS: ShoppingPlatform[] = [
  'IKEA',
  'Amazon',
  'Flipkart',
  'Pepperfry',
  'Urban Ladder',
];

const COMMON_ITEMS = [
  { name: 'BLDC Ceiling Fan', category: 'Cooling & Appliances' as const, defaultRoom: 'Living Room' },
  { name: 'Warm Ambient Floor Lamp', category: 'Lighting' as const, defaultRoom: 'Living Room' },
  { name: 'Modular Coffee Table', category: 'Furniture' as const, defaultRoom: 'Living Room' },
  { name: '4-Seater Dining Table Set', category: 'Furniture' as const, defaultRoom: 'Dining Room' },
  { name: 'Blackout Thermal Curtains', category: 'Decor & Textiles' as const, defaultRoom: 'Bedroom' },
  { name: 'Space-Saving Corner Shelf', category: 'Storage & Utility' as const, defaultRoom: 'Living Room' },
  { name: 'Accent Area Rug (5x7 ft)', category: 'Decor & Textiles' as const, defaultRoom: 'Living Room' },
  { name: 'Smart LED Track Lights', category: 'Lighting' as const, defaultRoom: 'Living Room' },
];

export const HomePlannerForm: React.FC<HomePlannerFormProps> = ({
  currency,
  onSubmit,
  isLoading,
}) => {
  const [budget, setBudget] = useState<number>(50000);
  const [selectedRooms, setSelectedRooms] = useState<string[]>(['Living Room', 'Bedroom', 'Kitchen']);
  const [items, setItems] = useState<HomeRoomItem[]>([
    { id: '1', name: 'BLDC Silent Ceiling Fan', category: 'Cooling & Appliances', room: 'Living Room', quantity: 2, priority: 'must-have' },
    { id: '2', name: 'Warm Diffused Floor Lamp', category: 'Lighting', room: 'Living Room', quantity: 2, priority: 'must-have' },
    { id: '3', name: 'Modular Coffee Table', category: 'Furniture', room: 'Living Room', quantity: 1, priority: 'must-have' },
    { id: '4', name: 'Blackout Curtains', category: 'Decor & Textiles', room: 'Bedroom', quantity: 2, priority: 'nice-to-have' },
    { id: '5', name: 'Wall Mount Display Shelf', category: 'Storage & Utility', room: 'Kitchen', quantity: 1, priority: 'nice-to-have' },
  ]);
  const [style, setStyle] = useState<string>('Modern Minimalist');
  const [qualityTier, setQualityTier] = useState<'budget' | 'balanced' | 'premium'>('balanced');
  const [selectedPlatforms, setSelectedPlatforms] = useState<ShoppingPlatform[]>(['IKEA', 'Amazon', 'Flipkart', 'Pepperfry']);
  const [notes, setNotes] = useState<string>('');

  // Quick item addition
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<HomeRoomItem['category']>('Furniture');
  const [newItemRoom, setNewItemRoom] = useState('Living Room');
  const [newItemQty, setNewItemQty] = useState(1);

  const toggleRoom = (room: string) => {
    if (selectedRooms.includes(room)) {
      if (selectedRooms.length > 1) {
        setSelectedRooms(selectedRooms.filter((r) => r !== room));
      }
    } else {
      setSelectedRooms([...selectedRooms, room]);
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

  const handleAddItem = () => {
    if (!newItemName.trim()) return;
    const item: HomeRoomItem = {
      id: Date.now().toString(),
      name: newItemName.trim(),
      category: newItemCategory,
      room: newItemRoom,
      quantity: newItemQty,
      priority: 'must-have',
    };
    setItems([...items, item]);
    setNewItemName('');
  };

  const handleAddCommonItem = (common: typeof COMMON_ITEMS[0]) => {
    const existing = items.find((i) => i.name.toLowerCase() === common.name.toLowerCase());
    if (existing) {
      setItems(items.map((i) => (i.id === existing.id ? { ...i, quantity: i.quantity + 1 } : i)));
    } else {
      setItems([
        ...items,
        {
          id: Date.now().toString(),
          name: common.name,
          category: common.category,
          room: selectedRooms.includes(common.defaultRoom) ? common.defaultRoom : selectedRooms[0],
          quantity: 1,
          priority: 'must-have',
        },
      ]);
    }
  };

  const removeItem = (id: string) => {
    setItems(items.filter((i) => i.id !== id));
  };

  const updateItemQty = (id: string, delta: number) => {
    setItems(
      items.map((i) => {
        if (i.id === id) {
          const newQty = Math.max(1, i.quantity + delta);
          return { ...i, quantity: newQty };
        }
        return i;
      })
    );
  };

  const loadPreset = (preset: typeof HOME_PRESETS[0]) => {
    setBudget(preset.budget);
    setSelectedRooms(preset.rooms);
    setStyle(preset.style);
    setQualityTier(preset.tier);
    setItems(preset.items);
    setSelectedPlatforms(preset.platforms);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      budget,
      currency,
      roomTypes: selectedRooms,
      items,
      style,
      qualityTier,
      preferredPlatforms: selectedPlatforms,
      notes,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Starter Presets Banner */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Wand2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs sm:text-sm font-semibold text-slate-200">
            Quick Starter Presets:
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {HOME_PRESETS.map((p) => (
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

      {/* 1. Total Budget & Quality Tier */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            1. Total Interior Budget ({currency})
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg pointer-events-none">
              {currency === 'INR' ? '₹' : '$'}
            </span>
            <input
              type="number"
              min="5000"
              step="1000"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value) || 0)}
              className="w-full pl-9 pr-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-lg font-extrabold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              placeholder="e.g. 50000"
              required
            />
          </div>
          <div className="flex items-center justify-between mt-2.5 text-xs text-slate-400">
            <span>Quick:</span>
            <div className="flex gap-1.5">
              {[25000, 50000, 80000, 150000].map((val) => (
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

        {/* Quality Tier & Style */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            2. Decor Style & Tier
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-[11px] text-slate-400 block mb-1 font-medium">Style</span>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2.5 px-3 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {STYLES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block mb-1 font-medium">Value Priority</span>
              <select
                value={qualityTier}
                onChange={(e) => setQualityTier(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2.5 px-3 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="budget">Cost Saver (Max Savings)</option>
                <option value="balanced">Balanced (Value for Money)</option>
                <option value="premium">Premium Touch (Designer)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Room Types */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          3. Select Rooms to Furnish & Decorate
        </label>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_ROOMS.map((room) => {
            const isSelected = selectedRooms.includes(room);
            return (
              <button
                key={room}
                type="button"
                onClick={() => toggleRoom(room)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {room}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Room Items & Quantities */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
              4. Specific Items & Quantities
            </label>
            <p className="text-xs text-slate-500">
              Specify what you need or click common items to add them.
            </p>
          </div>
          <span className="text-xs text-slate-400 font-medium self-end">
            {items.length} items configured
          </span>
        </div>

        {/* Common Items Fast-Add Chips */}
        <div className="mb-5 pb-4 border-b border-slate-800/80">
          <span className="text-[11px] font-semibold text-slate-400 block mb-2">
            + Quick Add Popular Items:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {COMMON_ITEMS.map((c, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleAddCommonItem(c)}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
              >
                <Plus className="w-3 h-3 text-emerald-400" />
                <span>{c.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Current Items List */}
        <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs"
            >
              <div className="flex-1 min-w-[200px]">
                <div className="font-bold text-slate-200">{item.name}</div>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                  <span>{item.room}</span>
                  <span>·</span>
                  <span className="text-emerald-400/80">{item.category}</span>
                </div>
              </div>

              {/* Priority Selector */}
              <select
                value={item.priority}
                onChange={(e) =>
                  setItems(
                    items.map((i) => (i.id === item.id ? { ...i, priority: e.target.value as any } : i))
                  )
                }
                className="bg-slate-900 border border-slate-800 text-slate-300 rounded px-2 py-1 text-[11px]"
              >
                <option value="must-have">Must-Have</option>
                <option value="nice-to-have">Nice-to-Have</option>
                <option value="flexible">Flexible</option>
              </select>

              {/* Quantity Controls */}
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1">
                <button
                  type="button"
                  onClick={() => updateItemQty(item.id, -1)}
                  className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-white rounded"
                >
                  -
                </button>
                <span className="font-bold text-white min-w-4 text-center">{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => updateItemQty(item.id, 1)}
                  className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-white rounded"
                >
                  +
                </button>
              </div>

              {/* Delete item */}
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                title="Remove item"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Custom Item Adder Input */}
        <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-2">
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="Custom item name (e.g. 55-inch TV Console)"
            className="sm:col-span-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <select
            value={newItemCategory}
            onChange={(e) => setNewItemCategory(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300"
          >
            <option value="Furniture">Furniture</option>
            <option value="Lighting">Lighting</option>
            <option value="Cooling & Appliances">Cooling & Appliances</option>
            <option value="Decor & Textiles">Decor & Textiles</option>
            <option value="Storage & Utility">Storage & Utility</option>
          </select>
          <button
            type="button"
            onClick={handleAddItem}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 border border-slate-700"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>Add Custom</span>
          </button>
        </div>
      </div>

      {/* 4. Platforms & Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            5. Sourcing Platforms
          </label>
          <p className="text-xs text-slate-500 mb-3">
            PocketSmart AI will compare and curate from your selected stores:
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
                      ? 'bg-slate-800 text-emerald-300 border-emerald-500/40 shadow-sm'
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
            Special Notes / Dimensions
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="e.g. Small compact room, prefer oak wood finish, need low power consumption..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading || items.length === 0}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold text-sm sm:text-base shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              <span>Analyzing Budget & Sourcing From IKEA, Amazon, Flipkart...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-slate-950" />
              <span>Generate AI Interior Budget & Product Recommendations</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};
