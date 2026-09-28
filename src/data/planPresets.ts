import { HomeRoomItem, ShoppingPlatform } from '../types';

export const HOME_PRESETS = [
  {
    id: 'studio-budget',
    title: '1BHK Studio Starter',
    budget: 35000,
    rooms: ['Living Room', 'Bedroom', 'Kitchen'],
    style: 'Modern Minimalist',
    tier: 'budget' as const,
    items: [
      { id: '1', name: 'Ceiling Fan (BLDC)', category: 'Cooling & Appliances' as const, room: 'Living Room', quantity: 1, priority: 'must-have' as const },
      { id: '2', name: 'Track / Ambient Ceiling Lights', category: 'Lighting' as const, room: 'Living Room', quantity: 2, priority: 'must-have' as const },
      { id: '3', name: 'Coffee Table with Shelf', category: 'Furniture' as const, room: 'Living Room', quantity: 1, priority: 'must-have' as const },
      { id: '4', name: 'Blackout Curtains', category: 'Decor & Textiles' as const, room: 'Bedroom', quantity: 2, priority: 'must-have' as const },
      { id: '5', name: 'Wall Mounted Storage Shelf', category: 'Storage & Utility' as const, room: 'Kitchen', quantity: 1, priority: 'nice-to-have' as const },
    ] as HomeRoomItem[],
    platforms: ['Amazon', 'IKEA', 'Flipkart'] as ShoppingPlatform[],
  },
  {
    id: '2bhk-scandi',
    title: 'Cozy 2BHK Scandinavian',
    budget: 75000,
    rooms: ['Living Room', 'Bedroom', 'Dining Room'],
    style: 'Scandinavian',
    tier: 'balanced' as const,
    items: [
      { id: '1', name: 'Solid Wood 4-Seater Dining Set', category: 'Furniture' as const, room: 'Dining Room', quantity: 1, priority: 'must-have' as const },
      { id: '2', name: 'Uplighter Floor Lamp', category: 'Lighting' as const, room: 'Living Room', quantity: 2, priority: 'must-have' as const },
      { id: '3', name: 'BLDC Silent Fans', category: 'Cooling & Appliances' as const, room: 'Bedroom', quantity: 2, priority: 'must-have' as const },
      { id: '4', name: 'Modular TV Console / Unit', category: 'Furniture' as const, room: 'Living Room', quantity: 1, priority: 'nice-to-have' as const },
      { id: '5', name: 'Boho Floor Rug (5x7 ft)', category: 'Decor & Textiles' as const, room: 'Living Room', quantity: 1, priority: 'must-have' as const },
    ] as HomeRoomItem[],
    platforms: ['IKEA', 'Pepperfry', 'Amazon'] as ShoppingPlatform[],
  },
];

export const PARTY_PRESETS = [
  {
    id: 'rooftop-birthday',
    title: '25-Guest Rooftop Birthday',
    budget: 20000,
    guestCount: 25,
    eventType: 'Birthday' as const,
    venueType: 'Rooftop Lounge' as const,
    vibe: 'Neon & Energetic',
    dietary: 'Veg & Non-Veg Mixed' as const,
    entertainment: ['DJ & Sound', 'Photobooth'],
    platforms: ['Swiggy', 'Zomato', 'Amazon', 'Blinkit'] as ShoppingPlatform[],
  },
  {
    id: 'housewarming-dinner',
    title: '30-Guest Housewarming Feast',
    budget: 30000,
    guestCount: 30,
    eventType: 'Housewarming' as const,
    venueType: 'Home / Living Room' as const,
    vibe: 'Warm & Traditional',
    dietary: 'Pure Veg Gourmet' as const,
    entertainment: ['Live Acoustic', 'Games & MC'],
    platforms: ['Swiggy', 'Zomato', 'Amazon'] as ShoppingPlatform[],
  },
  {
    id: 'villa-getaway',
    title: '15-Guest Weekend Villa Bash',
    budget: 45000,
    guestCount: 15,
    eventType: 'Bachelor / Bachelorette' as const,
    venueType: 'Rented Villa / OYO' as const,
    vibe: 'Poolside Chill & Cocktails',
    dietary: 'Bar Snacks & Drinks' as const,
    entertainment: ['DJ & Sound', 'Karaoke'],
    platforms: ['OYO', 'Swiggy', 'Blinkit', 'Amazon'] as ShoppingPlatform[],
  }
];

export const JEWELRY_PRESETS = [
  {
    id: 'reception-kundan',
    title: 'Bridal Reception Kundan Set',
    budget: 12000,
    occasion: 'Wedding / Reception' as const,
    stylePreference: 'Kundan & Polki' as const,
    pieces: ['Necklaces & Chokers', 'Earrings', 'Bangles & Bracelets', 'Rings & Accents'],
    platforms: ['Amazon', 'Flipkart', 'Myntra', 'CaratLane / Tanishq'] as ShoppingPlatform[],
  },
  {
    id: 'cocktail-cz',
    title: 'Cocktail Gala Diamond Replica',
    budget: 8500,
    occasion: 'Cocktail Party' as const,
    stylePreference: 'American Diamond & CZ' as const,
    pieces: ['Earrings', 'Necklaces & Chokers', 'Rings & Accents'],
    platforms: ['GIVA', 'Myntra', 'Amazon'] as ShoppingPlatform[],
  },
  {
    id: 'festive-temple',
    title: 'Diwali Heritage Temple Gold',
    budget: 15000,
    occasion: 'Festive (Diwali/Eid/Puja)' as const,
    stylePreference: 'Temple Jewelry' as const,
    pieces: ['Necklaces & Chokers', 'Earrings', 'Bangles & Bracelets', 'Headpiece & Maang Tikka'],
    platforms: ['Amazon', 'Flipkart', 'Myntra'] as ShoppingPlatform[],
  }
];
