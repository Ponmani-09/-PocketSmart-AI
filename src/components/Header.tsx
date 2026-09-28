import React from 'react';
import { Home, PartyPopper, Gem, Bookmark, ChevronDown, Sparkles, Coins } from 'lucide-react';
import { CurrencyCode, CURRENCIES, PlannerMode } from '../types';

interface HeaderProps {
  activeMode: PlannerMode;
  onSelectMode: (mode: PlannerMode) => void;
  currency: CurrencyCode;
  onSelectCurrency: (currency: CurrencyCode) => void;
  savedPlansCount: number;
  onOpenSavedPlans: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeMode,
  onSelectMode,
  currency,
  onSelectCurrency,
  savedPlansCount,
  onOpenSavedPlans,
}) => {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-[#0b0f17]/90 border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 font-bold">
              <Coins className="w-5 h-5 text-emerald-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white font-sans">
                  PocketSmart<span className="text-emerald-400"> AI</span>
                </span>
                <span className="hidden md:inline-flex text-[11px] font-medium tracking-wide uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  GenAI Allocation
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Smart Budgeting & Cross-Platform Recommendations
              </p>
            </div>
          </div>

          {/* Planner Mode Segmented Control (Desktop) */}
          <div className="hidden lg:flex items-center p-1 bg-slate-900/90 rounded-xl border border-slate-800">
            <button
              onClick={() => onSelectMode('home')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeMode === 'home'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Home Interior</span>
            </button>
            <button
              onClick={() => onSelectMode('party')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeMode === 'party'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <PartyPopper className="w-4 h-4" />
              <span>Party & Events</span>
            </button>
            <button
              onClick={() => onSelectMode('jewelry')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeMode === 'jewelry'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Gem className="w-4 h-4" />
              <span>Jewelry & Outfit</span>
            </button>
          </div>

          {/* Right Controls: Currency Selector & Saved Plans */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Currency Selector */}
            <div className="relative">
              <label htmlFor="currency-select" className="sr-only">Select Currency</label>
              <select
                id="currency-select"
                value={currency}
                onChange={(e) => onSelectCurrency(e.target.value as CurrencyCode)}
                className="appearance-none bg-slate-900 border border-slate-700/80 text-slate-200 text-xs font-semibold py-2 pl-3 pr-8 rounded-lg hover:border-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                {Object.values(CURRENCIES).map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.symbol} {c.code}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Saved Plans Button */}
            <button
              onClick={onOpenSavedPlans}
              className="relative flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
              title="Saved Plans"
            >
              <Bookmark className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Saved Plans</span>
              {savedPlansCount > 0 && (
                <span className="ml-1 inline-flex items-center justify-center min-w-4 h-4 px-1 text-[10px] font-bold rounded-full bg-emerald-500 text-slate-950">
                  {savedPlansCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Planner Mode Bar */}
        <div className="lg:hidden flex items-center justify-between pb-3 gap-1 overflow-x-auto">
          <button
            onClick={() => onSelectMode('home')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-semibold rounded-lg transition-all ${
              activeMode === 'home'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>
          <button
            onClick={() => onSelectMode('party')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-semibold rounded-lg transition-all ${
              activeMode === 'party'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
            }`}
          >
            <PartyPopper className="w-3.5 h-3.5" />
            <span>Party</span>
          </button>
          <button
            onClick={() => onSelectMode('jewelry')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-semibold rounded-lg transition-all ${
              activeMode === 'jewelry'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
            }`}
          >
            <Gem className="w-3.5 h-3.5" />
            <span>Jewelry</span>
          </button>
        </div>
      </div>
    </header>
  );
};
