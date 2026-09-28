export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'AED' | 'CAD' | 'AUD';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rateToINR: number;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee (INR)', rateToINR: 1 },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar (USD)', rateToINR: 86.5 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro (EUR)', rateToINR: 92.0 },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound (GBP)', rateToINR: 110.0 },
  AED: { code: 'AED', symbol: 'AED ', name: 'UAE Dirham (AED)', rateToINR: 23.5 },
  CAD: { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar (CAD)', rateToINR: 61.0 },
  AUD: { code: 'AUD', symbol: 'AU$', name: 'Australian Dollar (AUD)', rateToINR: 55.5 },
};

export type PlannerMode = 'home' | 'party' | 'jewelry';

// Platforms
export type ShoppingPlatform =
  | 'Amazon'
  | 'Flipkart'
  | 'IKEA'
  | 'Pepperfry'
  | 'Urban Ladder'
  | 'Swiggy'
  | 'Zomato'
  | 'OYO'
  | 'Blinkit'
  | 'Myntra'
  | 'GIVA'
  | 'CaratLane / Tanishq';

// --- Home Planner Types ---
export interface HomeRoomItem {
  id: string;
  name: string;
  category: 'Lighting' | 'Cooling & Appliances' | 'Furniture' | 'Decor & Textiles' | 'Storage & Utility';
  room: string;
  quantity: number;
  priority: 'must-have' | 'nice-to-have' | 'flexible';
}

export interface HomePlanRequest {
  budget: number;
  currency: CurrencyCode;
  roomTypes: string[];
  items: HomeRoomItem[];
  style: string;
  qualityTier: 'budget' | 'balanced' | 'premium';
  preferredPlatforms: ShoppingPlatform[];
  notes?: string;
}

export interface ProductRecommendation {
  id: string;
  category: string;
  roomOrSection?: string;
  name: string;
  productTitle: string;
  platform: ShoppingPlatform;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  searchUrl: string;
  specifications: string[];
  matchReason: string;
  isCostSaver?: boolean;
  savingsTip?: string;
  alternativeProduct?: {
    title: string;
    platform: ShoppingPlatform;
    unitPrice: number;
    savingsAmount: number;
    searchUrl: string;
  };
}

export interface BudgetCategoryAllocation {
  category: string;
  allocatedAmount: number;
  actualSpent: number;
  percentage: number;
  variance: number; // positive = under budget, negative = over budget
  color: string;
}

export interface HomePlanResult {
  planTitle: string;
  summary: string;
  totalBudget: number;
  totalEstimatedCost: number;
  remainingBudget: number;
  currency: CurrencyCode;
  allocations: BudgetCategoryAllocation[];
  recommendations: ProductRecommendation[];
  savingsTips: string[];
  roomBreakdown: {
    room: string;
    cost: number;
    itemCount: number;
  }[];
  platformBreakdown: {
    platform: ShoppingPlatform;
    cost: number;
    itemCount: number;
  }[];
}

// --- Party Planner Types ---
export interface PartyPlanRequest {
  totalBudget: number;
  currency: CurrencyCode;
  guestCount: number;
  eventType: 'Birthday' | 'Wedding / Reception' | 'Corporate Event' | 'Anniversary' | 'Housewarming' | 'Bachelor / Bachelorette' | 'Festive Dinner' | 'Cocktail Party';
  venueType: 'Home / Living Room' | 'Rented Villa / OYO' | 'Rooftop Lounge' | 'Banquet Hall' | 'Outdoor Lawn / Garden';
  vibe: string;
  dietary: 'Pure Veg Gourmet' | 'Veg & Non-Veg Mixed' | 'Finger Food & Tapas' | 'Bar Snacks & Drinks' | 'Buffet Feast';
  entertainment: string[];
  preferredPlatforms: ShoppingPlatform[];
  notes?: string;
}

export interface PartyPlanResult {
  planTitle: string;
  summary: string;
  totalBudget: number;
  totalEstimatedCost: number;
  remainingBudget: number;
  currency: CurrencyCode;
  guestCount: number;
  costPerGuest: number;
  allocations: BudgetCategoryAllocation[];
  recommendations: ProductRecommendation[];
  timelineChecklist: {
    timeframe: string;
    task: string;
    platformHint?: string;
  }[];
  vendorNegotiationTips: string[];
}

// --- Jewelry Planner Types ---
export interface JewelryPlanRequest {
  budget: number;
  currency: CurrencyCode;
  occasion: 'Wedding / Reception' | 'Festive (Diwali/Eid/Puja)' | 'Cocktail Party' | 'Sangeet / Mehendi' | 'Formal / Office Gala' | 'Casual Chic / Date Night';
  stylePreference: 'Kundan & Polki' | 'Temple Jewelry' | 'Contemporary Minimalist' | 'American Diamond & CZ' | 'Antique / Oxidized Silver' | 'Rose Gold & Pearls';
  jewelryTypes: string[];
  outfitImageBase64?: string;
  outfitMimeType?: string;
  outfitDescription?: string;
  preferredPlatforms: ShoppingPlatform[];
  metalTonePreference?: 'Gold' | 'Silver' | 'Rose Gold' | 'Antique Brass' | 'AI Recommended';
}

export interface OutfitAnalysis {
  dominantColors: string[];
  accentColors: string[];
  necklineType: string;
  fabricStyle: string;
  overallAesthetic: string;
  jewelryPairingAdvice: string;
  recommendedMetalTones: string[];
}

export interface JewelryPlanResult {
  planTitle: string;
  summary: string;
  totalBudget: number;
  totalEstimatedCost: number;
  remainingBudget: number;
  currency: CurrencyCode;
  occasion: string;
  stylePreference: string;
  outfitAnalysis?: OutfitAnalysis;
  allocations: BudgetCategoryAllocation[];
  recommendations: ProductRecommendation[];
  stylingTips: string[];
  careAndPreservationTips: string[];
}

// Saved Plan item for History
export interface SavedPlan {
  id: string;
  title: string;
  type: PlannerMode;
  date: string;
  budget: number;
  cost: number;
  currency: CurrencyCode;
  itemCount: number;
  data: HomePlanResult | PartyPlanResult | JewelryPlanResult;
}
