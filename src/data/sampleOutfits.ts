export interface SampleOutfit {
  id: string;
  name: string;
  occasion: string;
  previewUrl: string;
  description: string;
  suggestedStyle: string;
}

export const SAMPLE_OUTFITS: SampleOutfit[] = [
  {
    id: 'emerald-saree',
    name: 'Royal Emerald Silk Saree with Gold Zari',
    occasion: 'Wedding / Reception',
    previewUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
    description: 'Emerald green Banarasi silk saree with antique gold zari embroidery border and deep sweetheart neckline blouse.',
    suggestedStyle: 'Kundan & Polki',
  },
  {
    id: 'black-evening-gown',
    name: 'Midnight Velvet Cocktail Gown',
    occasion: 'Cocktail Party',
    previewUrl: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=600&q=80',
    description: 'Plunging V-neck midnight black velvet gown with minimalist silhouette and sleek open back.',
    suggestedStyle: 'American Diamond & CZ',
  },
  {
    id: 'blush-lehenga',
    name: 'Blush Pink Floral Embroidered Lehenga',
    occasion: 'Sangeet / Mehendi',
    previewUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80',
    description: 'Pastel blush pink net lehenga with pearl sequin detailing, round scoop neck and mirror work choli.',
    suggestedStyle: 'Rose Gold & Pearls',
  }
];
