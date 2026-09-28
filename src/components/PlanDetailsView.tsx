import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Printer,
  Copy,
  Check,
  Bookmark,
  Share2,
  Calendar,
  Layers,
  ArrowLeft,
  Store,
  Lightbulb,
  ShieldCheck,
  Clock,
  Shirt,
  Palette
} from 'lucide-react';
import {
  HomePlanResult,
  PartyPlanResult,
  JewelryPlanResult,
  CurrencyCode,
  ProductRecommendation,
  ShoppingPlatform,
  PlannerMode,
  BudgetCategoryAllocation
} from '../types';
import { formatCurrency } from '../utils/formatters';
import { BudgetVisualizer } from './BudgetVisualizer';
import { RecommendationCard } from './RecommendationCard';

interface PlanDetailsViewProps {
  mode: PlannerMode;
  plan: HomePlanResult | PartyPlanResult | JewelryPlanResult;
  currency: CurrencyCode;
  onBackToEdit: () => void;
  onSavePlan: () => void;
  isPlanSaved?: boolean;
}

export const PlanDetailsView: React.FC<PlanDetailsViewProps> = ({
  mode,
  plan,
  currency,
  onBackToEdit,
  onSavePlan,
  isPlanSaved = false,
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [copied, setCopied] = useState(false);
  const [purchasedItems, setPurchasedItems] = useState<Record<string, boolean>>({});
  const [activePlan, setActivePlan] = useState(plan);

  // Trigger celebration confetti if under budget on initial mount
  useEffect(() => {
    if (activePlan.remainingBudget >= 0) {
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#14b8a6', '#06b6d4', '#eab308'],
        });
      } catch (e) {
        // ignore if not supported
      }
    }
  }, []);

  // Update active plan when parent changes
  useEffect(() => {
    setActivePlan(plan);
  }, [plan]);

  const togglePurchased = (itemId: string) => {
    setPurchasedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  // 1-Click Alternative Swap Handler
  const handleSwapAlternative = (
    itemId: string,
    alt: NonNullable<ProductRecommendation['alternativeProduct']>
  ) => {
    const updatedRecs = activePlan.recommendations.map((item) => {
      if (item.id === itemId) {
        const priceDiff = item.totalPrice - alt.unitPrice;
        return {
          ...item,
          productTitle: alt.title,
          platform: alt.platform,
          unitPrice: alt.unitPrice,
          totalPrice: alt.unitPrice,
          searchUrl: alt.searchUrl,
          alternativeProduct: undefined,
          matchReason: `Swapped for budget alternative (saved ${formatCurrency(priceDiff, currency)}).`,
        };
      }
      return item;
    });

    const newTotalEstimatedCost = updatedRecs.reduce((sum, r) => sum + r.totalPrice, 0);
    const newRemainingBudget = activePlan.totalBudget - newTotalEstimatedCost;

    // Recalculate allocations spent
    const updatedAllocations = activePlan.allocations.map((alloc) => {
      const catSpent = updatedRecs
        .filter((r) => r.category === alloc.category)
        .reduce((sum, r) => sum + r.totalPrice, 0);
      return {
        ...alloc,
        actualSpent: catSpent,
        variance: alloc.allocatedAmount - catSpent,
      };
    });

    setActivePlan({
      ...activePlan,
      totalEstimatedCost: newTotalEstimatedCost,
      remainingBudget: newRemainingBudget,
      recommendations: updatedRecs,
      allocations: updatedAllocations,
    });
  };

  const handleAdjustAllocation = (updatedAllocations: BudgetCategoryAllocation[]) => {
    setActivePlan({
      ...activePlan,
      allocations: updatedAllocations,
    });
  };

  // Extract all platforms present in the plan
  const platformsPresent = Array.from(
    new Set(activePlan.recommendations.map((r) => r.platform))
  );

  // Filter recommendations based on active platform filter
  const filteredRecommendations =
    selectedPlatform === 'all'
      ? activePlan.recommendations
      : activePlan.recommendations.filter((r) => r.platform === selectedPlatform);

  // Copy shopping checklist to clipboard
  const handleCopyChecklist = () => {
    const lines = [
      `🛍️ ${activePlan.planTitle} (PocketSmart AI Plan)`,
      `Total Budget: ${formatCurrency(activePlan.totalBudget, currency)}`,
      `Estimated Cost: ${formatCurrency(activePlan.totalEstimatedCost, currency)} (Saved: ${formatCurrency(activePlan.remainingBudget, currency)})`,
      '',
      'ITEMIZED SHOPPING LIST:',
      ...activePlan.recommendations.map(
        (r, i) => `${i + 1}. [${r.platform}] ${r.productTitle} - ${formatCurrency(r.totalPrice, currency)} (${r.searchUrl})`
      ),
    ];

    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  // Check if this is a jewelry plan with outfit analysis
  const jewelryPlan = mode === 'jewelry' ? (activePlan as JewelryPlanResult) : null;
  const partyPlan = mode === 'party' ? (activePlan as PartyPlanResult) : null;
  const homePlan = mode === 'home' ? (activePlan as HomePlanResult) : null;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Bar: Back, Title & Export Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <button
            onClick={onBackToEdit}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-emerald-400 mb-2 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Edit Plan Inputs</span>
          </button>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">
            {activePlan.planTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
            {activePlan.summary}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={handleCopyChecklist}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
            title="Copy checklist to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy List'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
            title="Print or export as PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Receipt</span>
          </button>

          <button
            onClick={onSavePlan}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              isPlanSaved
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>{isPlanSaved ? 'Plan Saved' : 'Save Plan'}</span>
          </button>
        </div>
      </div>

      {/* Multimodal Outfit Analysis Banner (Jewelry Planner) */}
      {jewelryPlan?.outfitAnalysis && (
        <div className="bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-900 border border-purple-500/30 rounded-2xl p-5 sm:p-6 shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <Palette className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-purple-200">
              Multimodal Vision AI: Outfit & Neckline Harmonization
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs mb-4">
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 block mb-1">Detected Color Tones</span>
              <div className="flex flex-wrap gap-1">
                {jewelryPlan.outfitAnalysis.dominantColors.map((col, idx) => (
                  <span key={idx} className="font-semibold text-slate-200">
                    {col}{idx < jewelryPlan.outfitAnalysis!.dominantColors.length - 1 ? ' · ' : ''}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 block mb-1">Neckline Architecture</span>
              <div className="font-bold text-emerald-300">
                {jewelryPlan.outfitAnalysis.necklineType}
              </div>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 block mb-1">Fabric & Texture</span>
              <div className="font-semibold text-slate-200">
                {jewelryPlan.outfitAnalysis.fabricStyle}
              </div>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 block mb-1">Recommended Metal Palette</span>
              <div className="font-semibold text-amber-300">
                {jewelryPlan.outfitAnalysis.recommendedMetalTones.join(', ')}
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-300 bg-purple-950/20 p-3 rounded-xl border border-purple-500/20">
            <span className="font-semibold text-purple-300">Styling Strategy: </span>
            {jewelryPlan.outfitAnalysis.jewelryPairingAdvice}
          </div>
        </div>
      )}

      {/* Party Per-Guest Indicator Banner */}
      {partyPlan && (
        <div className="bg-gradient-to-r from-teal-950/30 via-slate-900 to-slate-900 border border-teal-500/30 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-300">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400">Guest Count & Per-Person Cost</div>
              <div className="text-sm sm:text-base font-bold text-white">
                {partyPlan.guestCount} Guests · {formatCurrency(partyPlan.costPerGuest, currency)} / person
              </div>
            </div>
          </div>
          <div className="text-xs text-slate-400 max-w-sm">
            Budget proportionally divided across catering, decor, OYO/venue, sound, and favors with zero guesswork.
          </div>
        </div>
      )}

      {/* Smart Budget Allocation Visualizer */}
      <BudgetVisualizer
        totalBudget={activePlan.totalBudget}
        totalSpent={activePlan.totalEstimatedCost}
        remainingBudget={activePlan.remainingBudget}
        allocations={activePlan.allocations}
        currency={currency}
        onAdjustAllocation={handleAdjustAllocation}
      />

      {/* Platform Filter Controls & Item Counter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Store className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
            Sourced Recommendations ({filteredRecommendations.length})
          </h3>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedPlatform('all')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              selectedPlatform === 'all'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            All Platforms ({activePlan.recommendations.length})
          </button>
          {platformsPresent.map((plat) => {
            const count = activePlan.recommendations.filter((r) => r.platform === plat).length;
            return (
              <button
                key={plat}
                onClick={() => setSelectedPlatform(plat)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  selectedPlatform === plat
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {plat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Recommendations Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {filteredRecommendations.map((item) => (
          <RecommendationCard
            key={item.id}
            item={item}
            currency={currency}
            onSwapAlternative={handleSwapAlternative}
            isPurchased={purchasedItems[item.id]}
            onTogglePurchased={togglePurchased}
          />
        ))}
      </div>

      {/* Additional Scenario-Specific Insight Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        {/* Timeline Checklist (for Party) OR Room Breakdown (for Home) OR Styling Tips (for Jewelry) */}
        {partyPlan && partyPlan.timelineChecklist && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Party Execution Timeline & Checklist
              </h4>
            </div>
            <div className="space-y-3">
              {partyPlan.timelineChecklist.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs">
                  <span className="font-bold text-emerald-400 shrink-0 min-w-16 bg-emerald-500/10 px-2 py-0.5 rounded text-center">
                    {step.timeframe}
                  </span>
                  <div>
                    <span className="text-slate-200 font-medium">{step.task}</span>
                    {step.platformHint && (
                      <span className="text-slate-400 block text-[11px] mt-0.5">
                        Platform: {step.platformHint}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {homePlan && homePlan.roomBreakdown && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Layers className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Room-by-Room Spend Breakdown
              </h4>
            </div>
            <div className="space-y-3">
              {homePlan.roomBreakdown.map((rb, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs pb-2 border-b border-slate-800 last:border-0">
                  <span className="font-semibold text-slate-200">{rb.room}</span>
                  <div className="text-right">
                    <span className="font-bold text-white">{formatCurrency(rb.cost, currency)}</span>
                    <span className="text-[11px] text-slate-400 block">{rb.itemCount} items</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {jewelryPlan && jewelryPlan.stylingTips && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Haute Couture Styling Advice
              </h4>
            </div>
            <ul className="space-y-2.5">
              {jewelryPlan.stylingTips.map((tip, idx) => (
                <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                  <span className="text-amber-400 font-bold mt-0.5">✧</span>
                  <span className="leading-relaxed">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* AI Savings Strategy & Vendor Negotiation Tips */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              AI Smart Savings Strategy & Tips
            </h4>
          </div>
          <ul className="space-y-2.5">
            {((homePlan && homePlan.savingsTips) ||
              (partyPlan && partyPlan.vendorNegotiationTips) ||
              (jewelryPlan && jewelryPlan.careAndPreservationTips) || [
                'Look for package deals or platform bundle coupons to save an extra 10-15%.',
                'Verify return policies before booking event items or decor props.',
              ]).map((tip, idx) => (
              <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                <span className="leading-relaxed">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
