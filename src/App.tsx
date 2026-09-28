/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Home,
  PartyPopper,
  Gem,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  TrendingDown,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Bookmark,
  Coins
} from 'lucide-react';
import {
  PlannerMode,
  CurrencyCode,
  HomePlanRequest,
  PartyPlanRequest,
  JewelryPlanRequest,
  HomePlanResult,
  PartyPlanResult,
  JewelryPlanResult,
  SavedPlan,
} from './types';
import { Header } from './components/Header';
import { HomePlannerForm } from './components/HomePlannerForm';
import { PartyPlannerForm } from './components/PartyPlannerForm';
import { JewelryPlannerForm } from './components/JewelryPlannerForm';
import { PlanDetailsView } from './components/PlanDetailsView';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import { SavedPlansDrawer } from './components/SavedPlansDrawer';

const STORAGE_KEY = 'pocketsmart_saved_plans_v1';

export default function App() {
  const [activeMode, setActiveMode] = useState<PlannerMode>('home');
  const [currency, setCurrency] = useState<CurrencyCode>('INR');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Active generated plan
  const [currentPlan, setCurrentPlan] = useState<
    HomePlanResult | PartyPlanResult | JewelryPlanResult | null
  >(null);

  // Saved plans history
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState<boolean>(false);

  // Save plans to localStorage on update
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedPlans));
    } catch (e) {
      console.error('Failed to save plans to localStorage', e);
    }
  }, [savedPlans]);

  // Handle Home Plan submission
  const handleHomeSubmit = async (request: HomePlanRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/recommendations/home', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Server error generating home recommendations.');
      }

      const data: HomePlanResult = await response.json();
      setCurrentPlan(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate recommendations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Party Plan submission
  const handlePartySubmit = async (request: PartyPlanRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/recommendations/party', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Server error generating party recommendations.');
      }

      const data: PartyPlanResult = await response.json();
      setCurrentPlan(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate recommendations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Jewelry Plan submission
  const handleJewelrySubmit = async (request: JewelryPlanRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/recommendations/jewelry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Server error generating jewelry recommendations.');
      }

      const data: JewelryPlanResult = await response.json();
      setCurrentPlan(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate recommendations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Save current plan
  const handleSaveCurrentPlan = () => {
    if (!currentPlan) return;

    const newSaved: SavedPlan = {
      id: Date.now().toString(),
      title: currentPlan.planTitle,
      type: activeMode,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      budget: currentPlan.totalBudget,
      cost: currentPlan.totalEstimatedCost,
      currency: currentPlan.currency,
      itemCount: currentPlan.recommendations.length,
      data: currentPlan,
    };

    setSavedPlans([newSaved, ...savedPlans]);
  };

  // Delete saved plan
  const handleDeleteSavedPlan = (id: string) => {
    setSavedPlans(savedPlans.filter((p) => p.id !== id));
  };

  // Load a saved plan into view
  const handleSelectSavedPlan = (plan: SavedPlan) => {
    setActiveMode(plan.type);
    setCurrency(plan.currency);
    setCurrentPlan(plan.data);
    setIsSavedDrawerOpen(false);
  };

  const isCurrentPlanSaved = currentPlan
    ? savedPlans.some((p) => p.title === currentPlan.planTitle && p.cost === currentPlan.totalEstimatedCost)
    : false;

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col font-sans">
      {/* Navigation Header */}
      <Header
        activeMode={activeMode}
        onSelectMode={(mode) => {
          setActiveMode(mode);
          setCurrentPlan(null);
          setError(null);
        }}
        currency={currency}
        onSelectCurrency={setCurrency}
        savedPlansCount={savedPlans.length}
        onOpenSavedPlans={() => setIsSavedDrawerOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Error Notification Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-start justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-slate-400 hover:text-white font-bold ml-2"
            >
              ✕
            </button>
          </div>
        )}

        {/* Hero Banner when viewing form */}
        {!currentPlan && !isLoading && (
          <div className="mb-10 text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Cross-Platform GenAI Budget Optimization</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
              Shop Smarter, <span className="text-emerald-400">Never Overspend.</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
              PocketSmart AI analyzes your budget and contextual needs to intelligently allocate funds and curate verified shopping options across <span className="text-slate-200 font-semibold">Amazon, IKEA, Flipkart, Swiggy, Zomato, OYO, and Myntra</span>.
            </p>

            {/* Quick 3-Mode Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-8 text-left">
              <div
                onClick={() => setActiveMode('home')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  activeMode === 'home'
                    ? 'bg-slate-900 border-emerald-500/40 shadow-lg shadow-emerald-500/5 ring-1 ring-emerald-500/30'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2.5">
                  <Home className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-white mb-1">1. Home Interior Planner</h2>
                <p className="text-xs text-slate-400 leading-normal">
                  Allocate budget across rooms, fans, lighting, and modular furniture with direct links to IKEA, Amazon, and Flipkart.
                </p>
              </div>

              <div
                onClick={() => setActiveMode('party')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  activeMode === 'party'
                    ? 'bg-slate-900 border-emerald-500/40 shadow-lg shadow-emerald-500/5 ring-1 ring-emerald-500/30'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center mb-2.5">
                  <PartyPopper className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-white mb-1">2. AI Party & Event Planner</h2>
                <p className="text-xs text-slate-400 leading-normal">
                  Divide budget by guest count across Swiggy catering, OYO villas, and Amazon lighting with custom timeline checklists.
                </p>
              </div>

              <div
                onClick={() => setActiveMode('jewelry')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  activeMode === 'jewelry'
                    ? 'bg-slate-900 border-emerald-500/40 shadow-lg shadow-emerald-500/5 ring-1 ring-emerald-500/30'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center mb-2.5">
                  <Gem className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-white mb-1">3. Jewelry & Outfit Matcher</h2>
                <p className="text-xs text-slate-400 leading-normal">
                  Upload dress photos for multimodal neckline and color harmony matching across Myntra, Amazon, and CaratLane.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic State View: Loading / Result / Form */}
        {isLoading ? (
          <LoadingSkeleton mode={activeMode} />
        ) : currentPlan ? (
          <PlanDetailsView
            mode={activeMode}
            plan={currentPlan}
            currency={currency}
            onBackToEdit={() => setCurrentPlan(null)}
            onSavePlan={handleSaveCurrentPlan}
            isPlanSaved={isCurrentPlanSaved}
          />
        ) : (
          <div className="max-w-4xl mx-auto">
            {activeMode === 'home' && (
              <HomePlannerForm
                currency={currency}
                onSubmit={handleHomeSubmit}
                isLoading={isLoading}
              />
            )}
            {activeMode === 'party' && (
              <PartyPlannerForm
                currency={currency}
                onSubmit={handlePartySubmit}
                isLoading={isLoading}
              />
            )}
            {activeMode === 'jewelry' && (
              <JewelryPlannerForm
                currency={currency}
                onSubmit={handleJewelrySubmit}
                isLoading={isLoading}
              />
            )}
          </div>
        )}
      </main>

      {/* Saved Plans Slide-Over Drawer */}
      <SavedPlansDrawer
        isOpen={isSavedDrawerOpen}
        onClose={() => setIsSavedDrawerOpen(false)}
        savedPlans={savedPlans}
        onSelectPlan={handleSelectSavedPlan}
        onDeletePlan={handleDeleteSavedPlan}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-8 bg-[#0b0f17]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-slate-300">PocketSmart AI</span>
            <span>· Intelligent budget allocation and e-commerce recommendations</span>
          </div>
          <div>
            <span>Sourcing from Amazon, IKEA, Flipkart, Swiggy, Zomato, OYO, Myntra & GIVA</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
