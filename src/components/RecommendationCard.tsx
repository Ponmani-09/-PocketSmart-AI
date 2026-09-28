import React, { useState } from 'react';
import { ExternalLink, CheckCircle2, ArrowRightLeft, Sparkles, Tag, ShieldCheck } from 'lucide-react';
import { ProductRecommendation, CurrencyCode, ShoppingPlatform } from '../types';
import { formatCurrency } from '../utils/formatters';

interface RecommendationCardProps {
  item: ProductRecommendation;
  currency: CurrencyCode;
  onSwapAlternative?: (itemId: string, alternative: NonNullable<ProductRecommendation['alternativeProduct']>) => void;
  isPurchased?: boolean;
  onTogglePurchased?: (itemId: string) => void;
}

const PLATFORM_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  'Amazon': { bg: 'bg-amber-500/15', text: 'text-amber-300', border: 'border-amber-500/30' },
  'Flipkart': { bg: 'bg-blue-500/15', text: 'text-blue-300', border: 'border-blue-500/30' },
  'IKEA': { bg: 'bg-yellow-500/15', text: 'text-yellow-300', border: 'border-yellow-500/30' },
  'Pepperfry': { bg: 'bg-orange-500/15', text: 'text-orange-300', border: 'border-orange-500/30' },
  'Urban Ladder': { bg: 'bg-indigo-500/15', text: 'text-indigo-300', border: 'border-indigo-500/30' },
  'Swiggy': { bg: 'bg-orange-500/15', text: 'text-orange-300', border: 'border-orange-500/30' },
  'Zomato': { bg: 'bg-red-500/15', text: 'text-red-300', border: 'border-red-500/30' },
  'OYO': { bg: 'bg-rose-500/15', text: 'text-rose-300', border: 'border-rose-500/30' },
  'Blinkit': { bg: 'bg-yellow-400/15', text: 'text-yellow-300', border: 'border-yellow-400/30' },
  'Myntra': { bg: 'bg-pink-500/15', text: 'text-pink-300', border: 'border-pink-500/30' },
  'GIVA': { bg: 'bg-teal-500/15', text: 'text-teal-300', border: 'border-teal-500/30' },
  'CaratLane / Tanishq': { bg: 'bg-purple-500/15', text: 'text-purple-300', border: 'border-purple-500/30' },
};

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  item,
  currency,
  onSwapAlternative,
  isPurchased = false,
  onTogglePurchased,
}) => {
  const [showAltDetails, setShowAltDetails] = useState(false);
  const platStyle = PLATFORM_STYLES[item.platform] || {
    bg: 'bg-slate-800',
    text: 'text-slate-300',
    border: 'border-slate-700',
  };

  return (
    <div
      className={`group relative rounded-xl border p-4 sm:p-5 transition-all duration-200 ${
        isPurchased
          ? 'bg-slate-900/40 border-emerald-500/30 opacity-75'
          : 'bg-slate-900/80 border-slate-800/90 hover:border-slate-700 hover:shadow-xl hover:shadow-black/20'
      }`}
    >
      {/* Top row: Platform & Category */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          {/* Platform Badge */}
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold border ${platStyle.bg} ${platStyle.text} ${platStyle.border}`}
          >
            {item.platform}
          </span>

          {item.roomOrSection && (
            <span className="text-xs text-slate-400 font-medium">
              {item.roomOrSection}
            </span>
          )}

          <span className="text-xs text-slate-500 hidden sm:inline">·</span>
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">
            {item.category}
          </span>
        </div>

        {/* Purchased toggle */}
        {onTogglePurchased && (
          <button
            onClick={() => onTogglePurchased(item.id)}
            className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded transition-colors ${
              isPurchased
                ? 'text-emerald-400 bg-emerald-500/10'
                : 'text-slate-500 hover:text-slate-300'
            }`}
            title="Mark as purchased"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isPurchased ? 'Secured' : 'Mark Secured'}</span>
          </button>
        )}
      </div>

      {/* Product Title */}
      <h4 className="text-sm sm:text-base font-bold text-slate-100 group-hover:text-emerald-300 transition-colors leading-snug mb-1">
        {item.productTitle}
      </h4>

      {/* Price & Quantity Breakdown */}
      <div className="flex flex-wrap items-baseline gap-2 mb-3">
        <span className="text-lg font-extrabold text-white">
          {formatCurrency(item.totalPrice, currency)}
        </span>
        {item.quantity > 1 && (
          <span className="text-xs text-slate-400">
            ({formatCurrency(item.unitPrice, currency)} × {item.quantity})
          </span>
        )}
      </div>

      {/* Specifications */}
      {item.specifications && item.specifications.length > 0 && (
        <ul className="mb-3 space-y-1">
          {item.specifications.slice(0, 3).map((spec, sIdx) => (
            <li key={sIdx} className="text-xs text-slate-300 flex items-start gap-1.5">
              <span className="text-emerald-500 font-bold mt-0.5">•</span>
              <span>{spec}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Why AI Recommended this */}
      {item.matchReason && (
        <div className="mb-3.5 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <span className="font-semibold text-emerald-300">Why PocketSmart matched: </span>
            {item.matchReason}
          </p>
        </div>
      )}

      {/* Alternative Swap Callout */}
      {item.alternativeProduct && onSwapAlternative && (
        <div className="mb-3.5 p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/20">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-emerald-300 font-semibold">
              <Tag className="w-3.5 h-3.5 text-emerald-400" />
              <span>Budget Alternative Available</span>
            </div>
            <button
              onClick={() => onSwapAlternative(item.id, item.alternativeProduct!)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors"
            >
              <ArrowRightLeft className="w-3 h-3" />
              <span>Swap & Save {formatCurrency(item.alternativeProduct.savingsAmount, currency)}</span>
            </button>
          </div>
          <div className="mt-1.5 text-xs text-slate-300">
            <span className="text-slate-400 font-medium">Alternative: </span>
            {item.alternativeProduct.title} on{' '}
            <span className="text-emerald-300 font-semibold">{item.alternativeProduct.platform}</span>{' '}
            for {formatCurrency(item.alternativeProduct.unitPrice, currency)}
          </div>
        </div>
      )}

      {/* Action Footer: Real Shopping Link */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
        {item.savingsTip && (
          <span className="text-[11px] text-slate-400 italic truncate max-w-[200px] sm:max-w-xs">
            💡 {item.savingsTip}
          </span>
        )}
        <div className="ml-auto">
          <a
            href={item.searchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white border border-slate-700/80 hover:border-emerald-500 transition-all"
          >
            <span>View on {item.platform}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
