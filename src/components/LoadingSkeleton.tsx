import React, { useState, useEffect } from 'react';
import { Sparkles, Layers, Sliders, ShoppingBag, ShieldCheck } from 'lucide-react';
import { PlannerMode } from '../types';

interface LoadingSkeletonProps {
  mode: PlannerMode;
}

const STEPS_HOME = [
  'Calculating balanced category allocations (Furniture, Lighting, Cooling)...',
  'Querying catalog pricing across IKEA, Amazon, Flipkart, Pepperfry...',
  'Evaluating room constraints and energy-efficient BLDC appliances...',
  'Finding budget-saving swaps and direct shopping search links...',
  'Finalizing interior budget roadmap...',
];

const STEPS_PARTY = [
  'Estimating per-guest allocations across Catering, OYO/Venue & Decor...',
  'Curating bulk food platters from Swiggy & artisan cakes from Zomato...',
  'Sourcing party lights and balloon garland arches on Amazon...',
  'Drafting step-by-step event timeline and vendor negotiation tactics...',
  'Finalizing complete party budget plan...',
];

const STEPS_JEWELRY = [
  'Processing multimodal outfit image colors, neckline & embellishments...',
  'Determining matching metal tones (22K Gold, Rose Gold, Kundan, Silver)...',
  'Searching authentic jewelry pieces on Amazon, Myntra, GIVA, CaratLane...',
  'Curating coordinate choker, earrings, kadas and cocktail rings...',
  'Generating haute couture styling advice and budget alternatives...',
];

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ mode }) => {
  const steps = mode === 'home' ? STEPS_HOME : mode === 'party' ? STEPS_PARTY : STEPS_JEWELRY;
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStepIdx((prev) => (prev + 1) % steps.length);
    }, 1800);
    return () => clearInterval(timer);
  }, [steps.length]);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-2xl animate-pulse">
      <div className="relative w-16 h-16 mx-auto mb-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-xl shadow-emerald-500/25">
          <Sparkles className="w-8 h-8 animate-spin" style={{ animationDuration: '4s' }} />
        </div>
      </div>

      <h3 className="text-lg sm:text-xl font-extrabold text-white mb-2">
        PocketSmart AI is Optimizing Your Plan
      </h3>
      <p className="text-xs sm:text-sm text-emerald-400 font-semibold mb-8 min-h-6 transition-all duration-300">
        {steps[currentStepIdx]}
      </p>

      {/* Progress placeholder bars */}
      <div className="space-y-4 max-w-md mx-auto text-left">
        <div className="h-4 bg-slate-800 rounded-full w-3/4 animate-pulse" />
        <div className="h-3.5 bg-slate-800/80 rounded-full w-full animate-pulse" />
        <div className="h-3.5 bg-slate-800/60 rounded-full w-5/6 animate-pulse" />
      </div>

      <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center justify-center gap-6 text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Strict Budget Constraint
        </span>
        <span className="flex items-center gap-1.5">
          <ShoppingBag className="w-4 h-4 text-teal-400" />
          Cross-Platform Pricing
        </span>
      </div>
    </div>
  );
};
