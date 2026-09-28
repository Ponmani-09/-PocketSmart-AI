import React from 'react';
import { X, Trash2, ArrowRight, Bookmark, Calendar, Home, PartyPopper, Gem } from 'lucide-react';
import { SavedPlan, CurrencyCode } from '../types';
import { formatCurrency } from '../utils/formatters';

interface SavedPlansDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedPlans: SavedPlan[];
  onSelectPlan: (plan: SavedPlan) => void;
  onDeletePlan: (id: string) => void;
}

export const SavedPlansDrawer: React.FC<SavedPlansDrawerProps> = ({
  isOpen,
  onClose,
  savedPlans,
  onSelectPlan,
  onDeletePlan,
}) => {
  if (!isOpen) return null;

  const getModeIcon = (type: SavedPlan['type']) => {
    switch (type) {
      case 'home':
        return <Home className="w-4 h-4 text-emerald-400" />;
      case 'party':
        return <PartyPopper className="w-4 h-4 text-amber-400" />;
      case 'jewelry':
        return <Gem className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0b0f17] border-l border-slate-800 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white">Your Saved Budget Plans</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {savedPlans.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-500">
                  <Bookmark className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-slate-300">No saved plans yet</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  Generate a budget plan for your Home, Party, or Jewelry and click "Save Plan" to view it here anytime.
                </p>
              </div>
            ) : (
              savedPlans.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-all duration-200"
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      {getModeIcon(item.type)}
                      <span className="text-xs font-bold text-slate-200 capitalize">
                        {item.type} Plan
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500">{item.date}</span>
                  </div>

                  <h5 className="text-sm font-bold text-white mb-2 leading-tight">
                    {item.title}
                  </h5>

                  <div className="flex items-center justify-between text-xs py-2 border-y border-slate-800/80 mb-3">
                    <div>
                      <span className="text-slate-400">Total Spent: </span>
                      <span className="font-extrabold text-emerald-400">
                        {formatCurrency(item.cost, item.currency)}
                      </span>
                    </div>
                    <div className="text-slate-400">
                      Budget: {formatCurrency(item.budget, item.currency)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => onDeletePlan(item.id)}
                      className="text-slate-500 hover:text-rose-400 p-1.5 rounded transition-colors text-xs flex items-center gap-1"
                      title="Delete saved plan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>

                    <button
                      onClick={() => onSelectPlan(item)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors"
                    >
                      <span>Load Plan</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
