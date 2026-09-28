import React, { useState } from 'react';
import { TrendingUp, AlertCircle, CheckCircle2, SlidersHorizontal, ArrowDown, ArrowUp, RefreshCw } from 'lucide-react';
import { BudgetCategoryAllocation, CurrencyCode } from '../types';
import { formatCurrency } from '../utils/formatters';

interface BudgetVisualizerProps {
  totalBudget: number;
  totalSpent: number;
  remainingBudget: number;
  allocations: BudgetCategoryAllocation[];
  currency: CurrencyCode;
  onAdjustAllocation?: (updatedAllocations: BudgetCategoryAllocation[]) => void;
}

export const BudgetVisualizer: React.FC<BudgetVisualizerProps> = ({
  totalBudget,
  totalSpent,
  remainingBudget,
  allocations,
  currency,
  onAdjustAllocation,
}) => {
  const [showWhatIf, setShowWhatIf] = useState(false);
  const isUnderBudget = remainingBudget >= 0;
  const spentPercentage = totalBudget > 0 ? Math.min(100, Math.round((totalSpent / totalBudget) * 100)) : 100;

  // Handle nudging an allocation (+5% or -5%)
  const handleNudge = (categoryIndex: number, deltaPercent: number) => {
    if (!onAdjustAllocation) return;

    const currentAlloc = allocations[categoryIndex];
    const newPercent = Math.max(5, Math.min(70, currentAlloc.percentage + deltaPercent));
    const percentDiff = newPercent - currentAlloc.percentage;

    // Distribute the opposite of percentDiff among the other categories
    const otherCount = allocations.length - 1;
    if (otherCount <= 0) return;

    const updated = allocations.map((alloc, idx) => {
      if (idx === categoryIndex) {
        const newAllocated = Math.round(totalBudget * (newPercent / 100));
        return {
          ...alloc,
          percentage: newPercent,
          allocatedAmount: newAllocated,
          variance: newAllocated - alloc.actualSpent,
        };
      } else {
        const offset = -percentDiff / otherCount;
        const adjustedPercent = Math.max(5, Math.round(alloc.percentage + offset));
        const newAllocated = Math.round(totalBudget * (adjustedPercent / 100));
        return {
          ...alloc,
          percentage: adjustedPercent,
          allocatedAmount: newAllocated,
          variance: newAllocated - alloc.actualSpent,
        };
      }
    });

    onAdjustAllocation(updated);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 mb-8 shadow-xl">
      {/* Top Banner: Status & Key Numbers */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-white">Smart Budget Allocation</h3>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                isUnderBudget
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}
            >
              {isUnderBudget ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Within Budget ({formatCurrency(remainingBudget, currency)} Saved)</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Exceeded by {formatCurrency(Math.abs(remainingBudget), currency)}</span>
                </>
              )}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Total planned expense of {formatCurrency(totalSpent, currency)} against your target {formatCurrency(totalBudget, currency)}
          </p>
        </div>

        {/* Quick summary metric cards */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl px-3.5 py-2 text-right">
            <div className="text-[11px] text-slate-400 font-medium">Target Budget</div>
            <div className="text-sm sm:text-base font-bold text-slate-200">
              {formatCurrency(totalBudget, currency)}
            </div>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl px-3.5 py-2 text-right">
            <div className="text-[11px] text-slate-400 font-medium">AI Estimated Total</div>
            <div className="text-sm sm:text-base font-bold text-emerald-400">
              {formatCurrency(totalSpent, currency)}
            </div>
          </div>
          {onAdjustAllocation && (
            <button
              onClick={() => setShowWhatIf(!showWhatIf)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-all ${
                showWhatIf
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
              title="Toggle What-If Budget Rebalancer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">What-If Tweak</span>
            </button>
          )}
        </div>
      </div>

      {/* Proportional Segmented Progress Bar */}
      <div className="mt-5">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span>Category Share</span>
          <span>{spentPercentage}% of target budget committed</span>
        </div>
        <div className="h-3.5 w-full bg-slate-950 rounded-full overflow-hidden flex p-0.5 border border-slate-800">
          {allocations.map((alloc, idx) => {
            const widthPct = Math.max(3, (alloc.actualSpent / (totalSpent || 1)) * 100);
            return (
              <div
                key={idx}
                style={{ width: `${widthPct}%`, backgroundColor: alloc.color }}
                className="h-full first:rounded-l-full last:rounded-r-full transition-all duration-300 hover:opacity-80"
                title={`${alloc.category}: ${formatCurrency(alloc.actualSpent, currency)} (${alloc.percentage}%)`}
              />
            );
          })}
        </div>
      </div>

      {/* Category Breakdown Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-5">
        {allocations.map((alloc, idx) => {
          const isCategoryUnder = alloc.variance >= 0;
          return (
            <div
              key={idx}
              className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 flex flex-col justify-between hover:border-slate-700 transition-colors"
            >
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: alloc.color }}
                  />
                  <h4 className="text-xs font-semibold text-slate-200 truncate" title={alloc.category}>
                    {alloc.category}
                  </h4>
                </div>
                <div className="text-sm font-extrabold text-white">
                  {formatCurrency(alloc.actualSpent, currency)}
                </div>
                <div className="text-[11px] text-slate-400">
                  Allocated: {formatCurrency(alloc.allocatedAmount, currency)} ({alloc.percentage}%)
                </div>
              </div>

              {/* Variance tag */}
              <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                <span
                  className={isCategoryUnder ? 'text-emerald-400 font-medium' : 'text-rose-400 font-medium'}
                >
                  {isCategoryUnder ? `+${formatCurrency(alloc.variance, currency)} saved` : `-${formatCurrency(Math.abs(alloc.variance), currency)} extra`}
                </span>

                {/* What-if nudge buttons */}
                {showWhatIf && onAdjustAllocation && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleNudge(idx, -5)}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                      title="Reduce allocation by 5%"
                    >
                      <ArrowDown className="w-2.5 h-2.5" />
                    </button>
                    <button
                      onClick={() => handleNudge(idx, 5)}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                      title="Increase allocation by 5%"
                    >
                      <ArrowUp className="w-2.5 h-2.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showWhatIf && (
        <div className="mt-4 p-3 bg-emerald-950/20 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 flex items-center justify-between">
          <span>
            💡 <strong>What-If Mode Active:</strong> Use the arrows to rebalance category allocations. The recommendation engine adapts calculations in real time.
          </span>
          <button
            onClick={() => setShowWhatIf(false)}
            className="text-xs text-slate-400 hover:text-white underline ml-3 shrink-0"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
};
