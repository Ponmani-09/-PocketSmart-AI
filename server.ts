import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '25mb' }));

// Initialize Google Gemini SDK
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper for building authentic shopping search URLs
function buildShoppingUrl(platform: string, query: string): string {
  const q = encodeURIComponent(query.trim());
  switch (platform.toLowerCase()) {
    case 'ikea':
      return `https://www.ikea.com/in/en/search/?q=${q}`;
    case 'amazon':
      return `https://www.amazon.in/s?k=${q}`;
    case 'flipkart':
      return `https://www.flipkart.com/search?q=${q}`;
    case 'pepperfry':
      return `https://www.pepperfry.com/site_product/search?q=${q}`;
    case 'swiggy':
      return `https://www.swiggy.com/search?query=${q}`;
    case 'zomato':
      return `https://www.zomato.com/search?q=${q}`;
    case 'oyo':
      return `https://www.oyorooms.com/search?location=${q}`;
    case 'myntra':
      return `https://www.myntra.com/${encodeURIComponent(query.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'))}`;
    case 'giva':
      return `https://www.giva.co/search?q=${q}`;
    case 'caratlane':
    case 'caratlane / tanishq':
      return `https://www.caratlane.com/search?q=${q}`;
    default:
      return `https://www.google.com/search?q=${encodeURIComponent(platform + ' ' + query)}`;
  }
}

// Color palette generator for categories
const CATEGORY_COLORS: Record<string, string> = {
  'Lighting': '#f59e0b',
  'Cooling & Appliances': '#06b6d4',
  'Furniture': '#6366f1',
  'Decor & Textiles': '#ec4899',
  'Storage & Utility': '#10b981',
  'Catering & Food': '#f97316',
  'Decoration & Ambience': '#8b5cf6',
  'Venue & Stay': '#3b82f6',
  'Entertainment & Sound': '#14b8a6',
  'Favors & Essentials': '#ec4899',
  'Necklaces & Chokers': '#eab308',
  'Earrings': '#06b6d4',
  'Bangles & Bracelets': '#a855f7',
  'Rings & Accents': '#f43f5e',
  'Headpiece & Maang Tikka': '#10b981',
};

// -------------------------------------------------------------
// 1. HOME BUDGET PLANNER ENDPOINT
// -------------------------------------------------------------
app.post('/api/recommendations/home', async (req: Request, res: Response) => {
  try {
    const { budget, currency, roomTypes, items, style, qualityTier, preferredPlatforms, notes } = req.body;

    const requestedItemsStr = Array.isArray(items) && items.length > 0
      ? items.map((it: any) => `- ${it.name} (Room: ${it.room}, Qty: ${it.quantity}, Priority: ${it.priority}, Category: ${it.category})`).join('\n')
      : 'Generate recommendations for typical living room, bedroom, and kitchen essentials.';

    const systemPrompt = `You are PocketSmart AI, an elite interior budget planner and e-commerce shopping advisor.
Your job is to take the user's total budget of ${currency} ${budget} and their room requirements, and generate:
1. A smart, realistic budget allocation across interior categories: Lighting, Cooling & Appliances, Furniture, Decor & Textiles, Storage & Utility.
2. Curated product recommendations from popular platforms: ${preferredPlatforms?.join(', ') || 'IKEA, Amazon, Flipkart, Pepperfry'}.
3. The total estimated cost MUST stay strictly within or very close to the user's budget of ${currency} ${budget}.
4. Provide realistic, current market prices for each item.
5. Offer 1 budget-saving alternative for key items (e.g., "Swap engineered wood table with IKEA Linmon to save ₹1,500").
6. Provide 3-4 pragmatic cost-saving tips.
Style desired: ${style || 'Modern Minimalist'}.
Quality tier: ${qualityTier || 'balanced'}.
Notes/Custom: ${notes || 'None'}.`;

    const userPrompt = `Allocate my budget and recommend items for:
Rooms: ${roomTypes?.join(', ')}
Items requested:
${requestedItemsStr}
Total Budget: ${currency} ${budget}

Return a valid JSON object matching the requested schema.`;

    const schema = {
      type: Type.OBJECT,
      properties: {
        planTitle: { type: Type.STRING },
        summary: { type: Type.STRING },
        allocations: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING },
              allocatedAmount: { type: Type.NUMBER },
              actualSpent: { type: Type.NUMBER },
              percentage: { type: Type.NUMBER },
            },
            required: ['category', 'allocatedAmount', 'actualSpent', 'percentage'],
          },
        },
        recommendations: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              category: { type: Type.STRING },
              roomOrSection: { type: Type.STRING },
              productTitle: { type: Type.STRING },
              platform: { type: Type.STRING },
              quantity: { type: Type.NUMBER },
              unitPrice: { type: Type.NUMBER },
              totalPrice: { type: Type.NUMBER },
              searchQuery: { type: Type.STRING },
              specifications: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              matchReason: { type: Type.STRING },
              savingsTip: { type: Type.STRING },
              alternativeProduct: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  platform: { type: Type.STRING },
                  unitPrice: { type: Type.NUMBER },
                  savingsAmount: { type: Type.NUMBER },
                  searchQuery: { type: Type.STRING },
                },
                required: ['title', 'platform', 'unitPrice', 'savingsAmount'],
              },
            },
            required: ['name', 'category', 'productTitle', 'platform', 'quantity', 'unitPrice', 'totalPrice', 'searchQuery', 'specifications', 'matchReason'],
          },
        },
        savingsTips: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
      },
      required: ['planTitle', 'summary', 'allocations', 'recommendations', 'savingsTips'],
    };

    let resultJson: any;

    if (process.env.GEMINI_API_KEY) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: userPrompt,
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: 'application/json',
            responseSchema: schema,
            temperature: 0.4,
          },
        });

        const rawText = response.text || '{}';
        resultJson = JSON.parse(rawText);
      } catch (geminiError: any) {
        console.warn('Gemini Home generation warning, using calculated backup:', geminiError?.message || geminiError);
        resultJson = generateMockHomePlan(budget, currency, roomTypes, items, style);
      }
    } else {
      // Fallback generator when running without API key
      resultJson = generateMockHomePlan(budget, currency, roomTypes, items, style);
    }

    // Enrich recommendations with authentic URLs, IDs, and calculation checks
    const recs = (resultJson.recommendations || []).map((rec: any, idx: number) => {
      const platform = rec.platform || 'Amazon';
      const searchQuery = rec.searchQuery || rec.productTitle || rec.name;
      const searchUrl = buildShoppingUrl(platform, searchQuery);

      let alt = undefined;
      if (rec.alternativeProduct) {
        const altPlatform = rec.alternativeProduct.platform || 'Flipkart';
        const altQuery = rec.alternativeProduct.searchQuery || rec.alternativeProduct.title;
        alt = {
          ...rec.alternativeProduct,
          platform: altPlatform,
          searchUrl: buildShoppingUrl(altPlatform, altQuery),
        };
      }

      return {
        id: `home-rec-${idx + 1}`,
        category: rec.category,
        roomOrSection: rec.roomOrSection || 'General',
        name: rec.name,
        productTitle: rec.productTitle,
        platform: platform as any,
        quantity: Number(rec.quantity) || 1,
        unitPrice: Math.round(Number(rec.unitPrice) || 0),
        totalPrice: Math.round(Number(rec.totalPrice) || (Number(rec.unitPrice) * (Number(rec.quantity) || 1))),
        searchUrl,
        specifications: rec.specifications || [],
        matchReason: rec.matchReason || 'Selected for durability and budget balance.',
        savingsTip: rec.savingsTip || '',
        alternativeProduct: alt,
      };
    });

    const totalEstimatedCost = recs.reduce((sum: number, r: any) => sum + r.totalPrice, 0);
    const remainingBudget = budget - totalEstimatedCost;

    const allocations = (resultJson.allocations || []).map((alloc: any) => ({
      category: alloc.category,
      allocatedAmount: Math.round(Number(alloc.allocatedAmount) || (budget * (alloc.percentage / 100))),
      actualSpent: Math.round(Number(alloc.actualSpent) || 0),
      percentage: Math.round(Number(alloc.percentage) || 20),
      variance: Math.round((Number(alloc.allocatedAmount) || 0) - (Number(alloc.actualSpent) || 0)),
      color: CATEGORY_COLORS[alloc.category] || '#6366f1',
    }));

    // Calculate room breakdown
    const roomMap = new Map<string, { cost: number; count: number }>();
    recs.forEach((r: any) => {
      const room = r.roomOrSection || 'General';
      const curr = roomMap.get(room) || { cost: 0, count: 0 };
      roomMap.set(room, { cost: curr.cost + r.totalPrice, count: curr.count + 1 });
    });
    const roomBreakdown = Array.from(roomMap.entries()).map(([room, val]) => ({
      room,
      cost: val.cost,
      itemCount: val.count,
    }));

    // Platform breakdown
    const platMap = new Map<string, { cost: number; count: number }>();
    recs.forEach((r: any) => {
      const plat = r.platform;
      const curr = platMap.get(plat) || { cost: 0, count: 0 };
      platMap.set(plat, { cost: curr.cost + r.totalPrice, count: curr.count + 1 });
    });
    const platformBreakdown = Array.from(platMap.entries()).map(([platform, val]) => ({
      platform: platform as any,
      cost: val.cost,
      itemCount: val.count,
    }));

    res.json({
      planTitle: resultJson.planTitle || `${style || 'Modern'} Interior Budget Plan`,
      summary: resultJson.summary || `Personalized interior plan curated for ${currency} ${budget.toLocaleString()}`,
      totalBudget: budget,
      totalEstimatedCost,
      remainingBudget,
      currency,
      allocations,
      recommendations: recs,
      savingsTips: resultJson.savingsTips || [
        'Bundle LED panel lights in 4-packs on Amazon to save up to 25%.',
        'Compare modular shelving at IKEA before committing to carpenter-made cabinets.',
        'Use accent cushion covers from Flipkart to switch room color themes cheaply.'
      ],
      roomBreakdown,
      platformBreakdown,
    });
  } catch (error: any) {
    console.error('Home Planner Error:', error);
    res.status(500).json({
      error: 'Failed to generate home budget recommendations. Please try again.',
      details: error.message,
    });
  }
});

// -------------------------------------------------------------
// 2. PARTY & EVENT BUDGET PLANNER ENDPOINT
// -------------------------------------------------------------
app.post('/api/recommendations/party', async (req: Request, res: Response) => {
  try {
    const { totalBudget, currency, guestCount, eventType, venueType, vibe, dietary, entertainment, preferredPlatforms, notes } = req.body;

    const systemPrompt = `You are PocketSmart AI's Event & Party Strategist.
Plan a successful ${eventType || 'Party'} for ${guestCount} guests within a total budget of ${currency} ${totalBudget}.
Venue: ${venueType}. Vibe: ${vibe || 'Festive & Elegant'}.
Dietary preference: ${dietary}.
Entertainment: ${entertainment?.join(', ') || 'Music & Lighting'}.
Platforms to source from: ${preferredPlatforms?.join(', ') || 'Swiggy, Zomato, OYO, Amazon, Blinkit, Local Partners'}.

Instructions:
1. Divide budget proportionally into 5 essential categories:
   - Catering & Food (~40-50%)
   - Decoration & Ambience (~15-25%)
   - Venue & Stay (~15-25%)
   - Entertainment & Sound (~10-15%)
   - Favors & Essentials (~5-10%)
2. The total estimated cost must not exceed ${currency} ${totalBudget}.
3. Calculate cost per guest: ${totalBudget} / ${guestCount}.
4. Provide recommendations with realistic vendor/platform packages (e.g. Swiggy bulk gourmet catering, OYO party villa, Amazon fairy light bundles, Zomato custom cake).
5. Provide a step-by-step timeline checklist (T-14 days, T-7 days, T-2 days, Event Day).
6. Provide 3 vendor price negotiation tips.`;

    const schema = {
      type: Type.OBJECT,
      properties: {
        planTitle: { type: Type.STRING },
        summary: { type: Type.STRING },
        costPerGuest: { type: Type.NUMBER },
        allocations: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING },
              allocatedAmount: { type: Type.NUMBER },
              actualSpent: { type: Type.NUMBER },
              percentage: { type: Type.NUMBER },
            },
            required: ['category', 'allocatedAmount', 'actualSpent', 'percentage'],
          },
        },
        recommendations: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              category: { type: Type.STRING },
              productTitle: { type: Type.STRING },
              platform: { type: Type.STRING },
              quantity: { type: Type.NUMBER },
              unitPrice: { type: Type.NUMBER },
              totalPrice: { type: Type.NUMBER },
              searchQuery: { type: Type.STRING },
              specifications: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              matchReason: { type: Type.STRING },
              savingsTip: { type: Type.STRING },
              alternativeProduct: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  platform: { type: Type.STRING },
                  unitPrice: { type: Type.NUMBER },
                  savingsAmount: { type: Type.NUMBER },
                  searchQuery: { type: Type.STRING },
                },
                required: ['title', 'platform', 'unitPrice', 'savingsAmount'],
              },
            },
            required: ['name', 'category', 'productTitle', 'platform', 'quantity', 'unitPrice', 'totalPrice', 'searchQuery', 'specifications', 'matchReason'],
          },
        },
        timelineChecklist: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              timeframe: { type: Type.STRING },
              task: { type: Type.STRING },
              platformHint: { type: Type.STRING },
            },
            required: ['timeframe', 'task'],
          },
        },
        vendorNegotiationTips: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
      },
      required: ['planTitle', 'summary', 'costPerGuest', 'allocations', 'recommendations', 'timelineChecklist', 'vendorNegotiationTips'],
    };

    let resultJson: any;

    if (process.env.GEMINI_API_KEY) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: `Create the party plan for:
Event: ${eventType}
Guests: ${guestCount}
Budget: ${currency} ${totalBudget}
Venue: ${venueType}
Dietary: ${dietary}
Entertainment: ${entertainment?.join(', ')}
Notes: ${notes || 'None'}`,
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: 'application/json',
            responseSchema: schema,
            temperature: 0.4,
          },
        });

        resultJson = JSON.parse(response.text || '{}');
      } catch (geminiError: any) {
        console.warn('Gemini Party generation warning, using calculated backup:', geminiError?.message || geminiError);
        resultJson = generateMockPartyPlan(totalBudget, currency, guestCount, eventType, venueType);
      }
    } else {
      resultJson = generateMockPartyPlan(totalBudget, currency, guestCount, eventType, venueType);
    }

    const recs = (resultJson.recommendations || []).map((rec: any, idx: number) => {
      const platform = rec.platform || 'Swiggy';
      const searchQuery = rec.searchQuery || rec.productTitle || rec.name;
      const searchUrl = buildShoppingUrl(platform, searchQuery);

      let alt = undefined;
      if (rec.alternativeProduct) {
        const altPlatform = rec.alternativeProduct.platform || 'Amazon';
        const altQuery = rec.alternativeProduct.searchQuery || rec.alternativeProduct.title;
        alt = {
          ...rec.alternativeProduct,
          platform: altPlatform,
          searchUrl: buildShoppingUrl(altPlatform, altQuery),
        };
      }

      return {
        id: `party-rec-${idx + 1}`,
        category: rec.category,
        name: rec.name,
        productTitle: rec.productTitle,
        platform: platform as any,
        quantity: Number(rec.quantity) || 1,
        unitPrice: Math.round(Number(rec.unitPrice) || 0),
        totalPrice: Math.round(Number(rec.totalPrice) || (Number(rec.unitPrice) * (Number(rec.quantity) || 1))),
        searchUrl,
        specifications: rec.specifications || [],
        matchReason: rec.matchReason || 'Optimized for guest count and venue type.',
        savingsTip: rec.savingsTip || '',
        alternativeProduct: alt,
      };
    });

    const totalEstimatedCost = recs.reduce((sum: number, r: any) => sum + r.totalPrice, 0);
    const remainingBudget = totalBudget - totalEstimatedCost;

    const allocations = (resultJson.allocations || []).map((alloc: any) => ({
      category: alloc.category,
      allocatedAmount: Math.round(Number(alloc.allocatedAmount) || (totalBudget * (alloc.percentage / 100))),
      actualSpent: Math.round(Number(alloc.actualSpent) || 0),
      percentage: Math.round(Number(alloc.percentage) || 20),
      variance: Math.round((Number(alloc.allocatedAmount) || 0) - (Number(alloc.actualSpent) || 0)),
      color: CATEGORY_COLORS[alloc.category] || '#f97316',
    }));

    res.json({
      planTitle: resultJson.planTitle || `${eventType} Budget Plan`,
      summary: resultJson.summary || `Budget-optimized plan for ${guestCount} guests at ${venueType}`,
      totalBudget,
      totalEstimatedCost,
      remainingBudget,
      currency,
      guestCount,
      costPerGuest: Math.round(totalEstimatedCost / (guestCount || 1)),
      allocations,
      recommendations: recs,
      timelineChecklist: resultJson.timelineChecklist || [
        { timeframe: 'T-14 Days', task: 'Lock venue or reserve OYO party stay; finalize head count', platformHint: 'OYO' },
        { timeframe: 'T-7 Days', task: 'Pre-order customized cake on Zomato & order Amazon decor sets', platformHint: 'Zomato & Amazon' },
        { timeframe: 'T-2 Days', task: 'Confirm catering headcount and beverage supplies on Blinkit/Swiggy', platformHint: 'Swiggy' },
        { timeframe: 'Event Day', task: 'Setup photo backdrop, test Bluetooth sound system, and accept food delivery', platformHint: 'Setup' },
      ],
      vendorNegotiationTips: resultJson.vendorNegotiationTips || [
        'Ask caterers for a complimentary live dessert counter when booking over 20 plates.',
        'Rent reusable tableware or balloon arches instead of disposable party packs to save 30%.',
        'Book OYO weekend villas on Tuesday/Wednesday for off-peak reservation discounts.'
      ],
    });
  } catch (error: any) {
    console.error('Party Planner Error:', error);
    res.status(500).json({
      error: 'Failed to generate party budget recommendations.',
      details: error.message,
    });
  }
});

// -------------------------------------------------------------
// 3. JEWELRY BUDGET PLANNER WITH MULTIMODAL OUTFIT MATCHING
// -------------------------------------------------------------
app.post('/api/recommendations/jewelry', async (req: Request, res: Response) => {
  try {
    const { budget, currency, occasion, stylePreference, jewelryTypes, outfitImageBase64, outfitMimeType, outfitDescription, preferredPlatforms, metalTonePreference } = req.body;

    const systemPrompt = `You are PocketSmart AI's Haute Couture Jewelry Stylist & Budget Optimizer.
The user wants jewelry recommendations for:
Occasion: ${occasion}
Style Preference: ${stylePreference}
Selected Jewelry Pieces: ${jewelryTypes?.join(', ') || 'Earrings, Necklace/Choker, Bangles'}
Total Budget: ${currency} ${budget}
Metal Tone Preference: ${metalTonePreference || 'AI Recommended'}
Preferred Platforms: ${preferredPlatforms?.join(', ') || 'Amazon, Flipkart, Myntra, GIVA, CaratLane / Tanishq'}.

If an outfit photo or description is provided, analyze:
1. Dominant and accent colors of the fabric.
2. Neckline type (e.g. Sweetheart, Deep V, Round, High collar, Off-shoulder, Boat neck) and what necklace/choker style flatters it.
3. Fabric texture & embroidery (e.g. Zari, Sequins, Velvet, Chiffon, Raw Silk) and recommended metal tones (Antique Gold, Silver, Rose Gold, Brass, Kundan).
4. Recommend matching jewelry pieces that stay strictly within the budget of ${currency} ${budget}.
5. Offer 1 budget-saving alternative for high-ticket pieces (e.g., "Choose Moissanite/CZ Kundan replica on Flipkart to save ₹2,000 vs semi-precious").
6. Provide styling tips and jewelry care advice.`;

    const schema = {
      type: Type.OBJECT,
      properties: {
        planTitle: { type: Type.STRING },
        summary: { type: Type.STRING },
        outfitAnalysis: {
          type: Type.OBJECT,
          properties: {
            dominantColors: { type: Type.ARRAY, items: { type: Type.STRING } },
            accentColors: { type: Type.ARRAY, items: { type: Type.STRING } },
            necklineType: { type: Type.STRING },
            fabricStyle: { type: Type.STRING },
            overallAesthetic: { type: Type.STRING },
            jewelryPairingAdvice: { type: Type.STRING },
            recommendedMetalTones: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ['dominantColors', 'accentColors', 'necklineType', 'fabricStyle', 'overallAesthetic', 'jewelryPairingAdvice', 'recommendedMetalTones'],
        },
        allocations: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING },
              allocatedAmount: { type: Type.NUMBER },
              actualSpent: { type: Type.NUMBER },
              percentage: { type: Type.NUMBER },
            },
            required: ['category', 'allocatedAmount', 'actualSpent', 'percentage'],
          },
        },
        recommendations: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              category: { type: Type.STRING },
              productTitle: { type: Type.STRING },
              platform: { type: Type.STRING },
              quantity: { type: Type.NUMBER },
              unitPrice: { type: Type.NUMBER },
              totalPrice: { type: Type.NUMBER },
              searchQuery: { type: Type.STRING },
              specifications: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              matchReason: { type: Type.STRING },
              savingsTip: { type: Type.STRING },
              alternativeProduct: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  platform: { type: Type.STRING },
                  unitPrice: { type: Type.NUMBER },
                  savingsAmount: { type: Type.NUMBER },
                  searchQuery: { type: Type.STRING },
                },
                required: ['title', 'platform', 'unitPrice', 'savingsAmount'],
              },
            },
            required: ['name', 'category', 'productTitle', 'platform', 'quantity', 'unitPrice', 'totalPrice', 'searchQuery', 'specifications', 'matchReason'],
          },
        },
        stylingTips: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        careAndPreservationTips: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
      },
      required: ['planTitle', 'summary', 'allocations', 'recommendations', 'stylingTips', 'careAndPreservationTips'],
    };

    let resultJson: any;

    if (process.env.GEMINI_API_KEY) {
      try {
        const contentsPayload: any[] = [];

        // If outfit image is provided as base64, construct multimodal inlineData part
        if (outfitImageBase64) {
          let cleanBase64 = outfitImageBase64;
          let mime = outfitMimeType || 'image/jpeg';

          if (outfitImageBase64.includes(';base64,')) {
            const parts = outfitImageBase64.split(';base64,');
            mime = parts[0].replace('data:', '');
            cleanBase64 = parts[1];
          }

          contentsPayload.push({
            inlineData: {
              mimeType: mime,
              data: cleanBase64,
            },
          });
        }

        contentsPayload.push({
          text: `Analyze my outfit and recommend matching jewelry:
Occasion: ${occasion}
Style: ${stylePreference}
Items Needed: ${jewelryTypes?.join(', ')}
Total Budget: ${currency} ${budget}
Metal Tone Preference: ${metalTonePreference || 'AI Recommended'}
Outfit Notes: ${outfitDescription || 'Inspect the provided image for neckline, color harmony, and embellishment style.'}`,
        });

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: { parts: contentsPayload },
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: 'application/json',
            responseSchema: schema,
            temperature: 0.35,
          },
        });

        resultJson = JSON.parse(response.text || '{}');
      } catch (geminiError: any) {
        console.warn('Gemini Jewelry generation warning, using calculated backup:', geminiError?.message || geminiError);
        resultJson = generateMockJewelryPlan(budget, currency, occasion, stylePreference, jewelryTypes, outfitDescription);
      }
    } else {
      resultJson = generateMockJewelryPlan(budget, currency, occasion, stylePreference, jewelryTypes, outfitDescription);
    }

    const recs = (resultJson.recommendations || []).map((rec: any, idx: number) => {
      const platform = rec.platform || 'Myntra';
      const searchQuery = rec.searchQuery || rec.productTitle || rec.name;
      const searchUrl = buildShoppingUrl(platform, searchQuery);

      let alt = undefined;
      if (rec.alternativeProduct) {
        const altPlatform = rec.alternativeProduct.platform || 'Amazon';
        const altQuery = rec.alternativeProduct.searchQuery || rec.alternativeProduct.title;
        alt = {
          ...rec.alternativeProduct,
          platform: altPlatform,
          searchUrl: buildShoppingUrl(altPlatform, altQuery),
        };
      }

      return {
        id: `jewelry-rec-${idx + 1}`,
        category: rec.category,
        name: rec.name,
        productTitle: rec.productTitle,
        platform: platform as any,
        quantity: Number(rec.quantity) || 1,
        unitPrice: Math.round(Number(rec.unitPrice) || 0),
        totalPrice: Math.round(Number(rec.totalPrice) || (Number(rec.unitPrice) * (Number(rec.quantity) || 1))),
        searchUrl,
        specifications: rec.specifications || [],
        matchReason: rec.matchReason || 'Matches outfit tone and neckline perfectly.',
        savingsTip: rec.savingsTip || '',
        alternativeProduct: alt,
      };
    });

    const totalEstimatedCost = recs.reduce((sum: number, r: any) => sum + r.totalPrice, 0);
    const remainingBudget = budget - totalEstimatedCost;

    const allocations = (resultJson.allocations || []).map((alloc: any) => ({
      category: alloc.category,
      allocatedAmount: Math.round(Number(alloc.allocatedAmount) || (budget * (alloc.percentage / 100))),
      actualSpent: Math.round(Number(alloc.actualSpent) || 0),
      percentage: Math.round(Number(alloc.percentage) || 20),
      variance: Math.round((Number(alloc.allocatedAmount) || 0) - (Number(alloc.actualSpent) || 0)),
      color: CATEGORY_COLORS[alloc.category] || '#eab308',
    }));

    res.json({
      planTitle: resultJson.planTitle || `${occasion} Jewelry Collection`,
      summary: resultJson.summary || `Coordinated jewelry ensemble curated within ${currency} ${budget.toLocaleString()}`,
      totalBudget: budget,
      totalEstimatedCost,
      remainingBudget,
      currency,
      occasion,
      stylePreference,
      outfitAnalysis: resultJson.outfitAnalysis || (outfitDescription ? {
        dominantColors: ['Navy Blue', 'Silver'],
        accentColors: ['Emerald', 'Crystal White'],
        necklineType: 'Deep V-Neck',
        fabricStyle: 'Georgette with Silver Zari',
        overallAesthetic: 'Contemporary Royal',
        jewelryPairingAdvice: 'A statement drop necklace paired with chandelier earrings balances the open neckline without overpowering.',
        recommendedMetalTones: ['Rhodium Silver', 'White Gold Plated', 'Cubic Zirconia']
      } : undefined),
      allocations,
      recommendations: recs,
      stylingTips: resultJson.stylingTips || [
        'Balance rule: If wearing heavy chandelier earrings, opt for a delicate choker or skip the neckpiece to prevent visual clutter.',
        'For deep necklines, a pendant with a 2-inch drop accentuates the collarbone gracefully.',
        'Choose 18K gold-plated brass with anti-tarnish coating for wedding wear without the pure gold price tag.'
      ],
      careAndPreservationTips: resultJson.careAndPreservationTips || [
        'Apply perfumes, hairsprays, and lotions before wearing jewelry; chemicals can oxidize plating.',
        'Store Kundan and pearl pieces in ziplock pouches wrapped in velvet or cotton to prevent tarnishing.'
      ],
    });
  } catch (error: any) {
    console.error('Jewelry Planner Error:', error);
    res.status(500).json({
      error: 'Failed to generate jewelry recommendations.',
      details: error.message,
    });
  }
});

// -------------------------------------------------------------
// Fallback Mock Generators (for resilience if key is unset or offline)
// -------------------------------------------------------------
function generateMockHomePlan(budget: number, currency: string, roomTypes: string[] = ['Living Room', 'Bedroom'], items: any[] = [], style: string = 'Modern Minimalist') {
  const b = budget;
  return {
    planTitle: `${style} Complete Home Interior Plan`,
    summary: `Engineered smart budget allocation for ${roomTypes.join(' & ')} maximizing space, durability, and lighting ambiance within ${currency} ${budget.toLocaleString()}.`,
    allocations: [
      { category: 'Furniture', allocatedAmount: Math.round(b * 0.45), actualSpent: Math.round(b * 0.44), percentage: 45 },
      { category: 'Lighting', allocatedAmount: Math.round(b * 0.18), actualSpent: Math.round(b * 0.17), percentage: 18 },
      { category: 'Cooling & Appliances', allocatedAmount: Math.round(b * 0.18), actualSpent: Math.round(b * 0.17), percentage: 18 },
      { category: 'Decor & Textiles', allocatedAmount: Math.round(b * 0.12), actualSpent: Math.round(b * 0.13), percentage: 12 },
      { category: 'Storage & Utility', allocatedAmount: Math.round(b * 0.07), actualSpent: Math.round(b * 0.06), percentage: 7 },
    ],
    recommendations: [
      {
        name: 'Ceiling Fan with Remote',
        category: 'Cooling & Appliances',
        roomOrSection: 'Living Room',
        productTitle: 'Atomberg Renesa 1200mm BLDC Motor Ceiling Fan with Smart Remote',
        platform: 'Amazon',
        quantity: 1,
        unitPrice: Math.round(b * 0.08),
        totalPrice: Math.round(b * 0.08),
        searchQuery: 'Atomberg Renesa 1200mm BLDC Ceiling Fan',
        specifications: ['Energy saving 28W BLDC Motor', 'LED Speed Indicator', 'Sleep & Boost Timers'],
        matchReason: 'Saves up to 65% on electricity bills while offering whisper-quiet cooling.',
        savingsTip: 'Buy during Amazon Great Republic sale for additional bank card cashbacks.',
        alternativeProduct: {
          title: 'Crompton Energion Hyperjet 1200mm BLDC Fan',
          platform: 'Flipkart',
          unitPrice: Math.round(b * 0.065),
          savingsAmount: Math.round(b * 0.015),
          searchQuery: 'Crompton Energion BLDC Ceiling Fan',
        }
      },
      {
        name: 'Modular Coffee Table',
        category: 'Furniture',
        roomOrSection: 'Living Room',
        productTitle: 'IKEA LACK Coffee Table with Storage Shelf (Oak Effect)',
        platform: 'IKEA',
        quantity: 1,
        unitPrice: Math.round(b * 0.06),
        totalPrice: Math.round(b * 0.06),
        searchQuery: 'IKEA LACK Coffee Table Oak',
        specifications: ['90x55 cm compact footprint', 'Separate shelf for magazines & remotes', 'Lightweight engineered honeycomb core'],
        matchReason: 'World-renowned minimalist aesthetic that coordinates effortlessly with any sofa tone.',
        savingsTip: 'Pair with adhesive felt floor protectors to avoid scratching tile flooring.',
        alternativeProduct: {
          title: 'DeckUp Plank Engineered Wood Coffee Table',
          platform: 'Amazon',
          unitPrice: Math.round(b * 0.045),
          savingsAmount: Math.round(b * 0.015),
          searchQuery: 'DeckUp Plank Coffee Table',
        }
      },
      {
        name: 'Warm Ambient Track & Floor Lamp',
        category: 'Lighting',
        roomOrSection: 'Living Room',
        productTitle: 'IKEA TAGARP Uplighter / Floor Reading Lamp',
        platform: 'IKEA',
        quantity: 2,
        unitPrice: Math.round(b * 0.04),
        totalPrice: Math.round(b * 0.08),
        searchQuery: 'IKEA TAGARP Floor Lamp',
        specifications: ['Upward diffused warm illumination', 'Dual switch reading arm', 'Sturdy weighted base'],
        matchReason: 'Creates cozy hotel-style warm ambient lighting without ceiling false ceiling renovations.',
        savingsTip: 'Fit with 9W 3000K warm white LED bulbs for energy efficiency.',
      },
      {
        name: 'Solid Wood 4-Seater Dining Set',
        category: 'Furniture',
        roomOrSection: 'Dining',
        productTitle: 'IKEA JOKKMOKK Table and 4 Chairs (Antique Stain Solid Pine)',
        platform: 'IKEA',
        quantity: 1,
        unitPrice: Math.round(b * 0.28),
        totalPrice: Math.round(b * 0.28),
        searchQuery: 'IKEA JOKKMOKK Dining Table 4 chairs',
        specifications: ['Solid pine wood construction', 'Ages naturally with character', 'Seats 4 comfortably in compact spaces'],
        matchReason: 'Unmatched price-to-durability ratio for a 100% solid wood dining setup.',
        savingsTip: 'Add soft IKEA JUSTINA chair cushions (₹249 each) for long dinner comfort.',
        alternativeProduct: {
          title: 'Flipkart Perfect Homes 4 Seater Dining Set',
          platform: 'Flipkart',
          unitPrice: Math.round(b * 0.22),
          savingsAmount: Math.round(b * 0.06),
          searchQuery: 'Solid Wood 4 Seater Dining Set Flipkart',
        }
      },
      {
        name: 'Blackout Thermal Curtains (Pack of 2)',
        category: 'Decor & Textiles',
        roomOrSection: 'Bedroom',
        productTitle: 'Amazon Brand - Solimo 100% Blackout Eyelet Door Curtains (Set of 2)',
        platform: 'Amazon',
        quantity: 2,
        unitPrice: Math.round(b * 0.045),
        totalPrice: Math.round(b * 0.09),
        searchQuery: 'Solimo 100 Blackout Curtains Set of 2',
        specifications: ['Triple weave thermal insulation', 'Blocks 99% sunlight & outside noise', 'Pre-fitted rust-proof eyelets'],
        matchReason: 'Ensures pitch-dark sleep quality and traps AC cooling indoors.',
      },
      {
        name: 'Space-Saving Corner Storage Shelf',
        category: 'Storage & Utility',
        roomOrSection: 'Living Room',
        productTitle: 'Pepperfry Corner Wall Mount Display Shelf with 5 Tiers',
        platform: 'Pepperfry',
        quantity: 1,
        unitPrice: Math.round(b * 0.05),
        totalPrice: Math.round(b * 0.05),
        searchQuery: 'Corner Wall Mount Display Shelf Pepperfry',
        specifications: ['Zig-zag floating design', 'Holds indoor planters & books', 'Scratch-resistant laminate'],
        matchReason: 'Utilizes awkward corner dead space for aesthetic plant & artifact showcase.',
      }
    ],
    savingsTips: [
      'Prioritize BLDC energy-rated appliances first; they return ₹1,500/year in utility savings.',
      'Purchase home linen & curtains in matching color packs on Amazon/Flipkart for multi-buy discounts.',
      'Choose flat-pack modular furniture from IKEA with simple DIY assembly to skip costly technician charges.'
    ]
  };
}

function generateMockPartyPlan(totalBudget: number, currency: string, guestCount: number, eventType: string, venueType: string) {
  const b = totalBudget;
  return {
    planTitle: `${eventType} All-Inclusive Celebration Plan`,
    summary: `Curated vendor allocation for ${guestCount} guests at ${venueType} featuring gourmet catering, themed ambience, and immersive entertainment within ${currency} ${totalBudget.toLocaleString()}.`,
    costPerGuest: Math.round(b / (guestCount || 1)),
    allocations: [
      { category: 'Catering & Food', allocatedAmount: Math.round(b * 0.48), actualSpent: Math.round(b * 0.46), percentage: 48 },
      { category: 'Decoration & Ambience', allocatedAmount: Math.round(b * 0.20), actualSpent: Math.round(b * 0.19), percentage: 20 },
      { category: 'Venue & Stay', allocatedAmount: Math.round(b * 0.16), actualSpent: Math.round(b * 0.15), percentage: 16 },
      { category: 'Entertainment & Sound', allocatedAmount: Math.round(b * 0.10), actualSpent: Math.round(b * 0.11), percentage: 10 },
      { category: 'Favors & Essentials', allocatedAmount: Math.round(b * 0.06), actualSpent: Math.round(b * 0.05), percentage: 6 },
    ],
    recommendations: [
      {
        name: 'Gourmet Party Catering Platter',
        category: 'Catering & Food',
        productTitle: 'Swiggy Gourmet Bulk Party Platter: Starters, Mains & Artisan Mocktails',
        platform: 'Swiggy',
        quantity: Math.max(1, Math.round(guestCount / 10)),
        unitPrice: Math.round((b * 0.38) / Math.max(1, Math.round(guestCount / 10))),
        totalPrice: Math.round(b * 0.38),
        searchQuery: 'Party Catering Starters & Main Course',
        specifications: ['Selection of 3 hot appetizers', 'Biryani / Pasta main course', 'Individual dessert cups'],
        matchReason: 'Guaranteed hygiene and on-time heated delivery with zero kitchen prep stress.',
        savingsTip: 'Pre-order 48 hours in advance for corporate/bulk promo codes up to 20% off.',
        alternativeProduct: {
          title: 'Zomato Group Dining Pre-packed Bento Boxes',
          platform: 'Zomato',
          unitPrice: Math.round((b * 0.32) / Math.max(1, Math.round(guestCount / 10))),
          savingsAmount: Math.round(b * 0.06),
          searchQuery: 'Zomato Group Dining Bento Boxes',
        }
      },
      {
        name: 'Designer Celebration Cake',
        category: 'Catering & Food',
        productTitle: 'Zomato Handcrafted 2kg Belgian Chocolate Truffle Cake with Custom Topper',
        platform: 'Zomato',
        quantity: 1,
        unitPrice: Math.round(b * 0.08),
        totalPrice: Math.round(b * 0.08),
        searchQuery: 'Belgian Chocolate Truffle 2kg Cake Zomato',
        specifications: ['Fresh artisan bakery sourcing', 'Custom sparkler candle included', 'Temperature-controlled box delivery'],
        matchReason: 'Crowd-favorite rich chocolate centerpiece for photo moments and cake-cutting.',
      },
      {
        name: 'Themed Photo Backdrop & Balloon Arch Kit',
        category: 'Decoration & Ambience',
        productTitle: 'Amazon Premium 120-Piece Rose Gold & Navy Balloon Garland Arch with LED Curtain',
        platform: 'Amazon',
        quantity: 1,
        unitPrice: Math.round(b * 0.09),
        totalPrice: Math.round(b * 0.09),
        searchQuery: 'Balloon Garland Arch with LED Curtain Amazon',
        specifications: ['Electric balloon pump compatible', '10ft Fairy light string included', 'Glue dots & arch tape'],
        matchReason: 'Insta-worthy visual impact for guest selfies without paying decorator markup.',
        alternativeProduct: {
          title: 'Blinkit 10-Minute Birthday Decor Foil Balloon Kit',
          platform: 'Blinkit',
          unitPrice: Math.round(b * 0.05),
          savingsAmount: Math.round(b * 0.04),
          searchQuery: 'Birthday Foil Balloon Kit Blinkit',
        }
      },
      {
        name: 'Party Stay / Private Event Villa',
        category: 'Venue & Stay',
        productTitle: 'OYO Townhouse Private Party Lounge / Villa Staycation Suite',
        platform: 'OYO',
        quantity: 1,
        unitPrice: Math.round(b * 0.15),
        totalPrice: Math.round(b * 0.15),
        searchQuery: 'OYO Townhouse Party Villa',
        specifications: ['Air-conditioned gathering hall', 'No post-party clean-up hassle', 'Flexible check-in options'],
        matchReason: 'Keeps your home clutter-free and accommodates out-of-town guests comfortably.',
      },
      {
        name: 'High-Bass Bluetooth Party Speaker & Mic',
        category: 'Entertainment & Sound',
        productTitle: 'Amazon Tribit / BoAt PartyPal 80W Portable Bluetooth Speaker with Wireless Karaoke Mic',
        platform: 'Amazon',
        quantity: 1,
        unitPrice: Math.round(b * 0.11),
        totalPrice: Math.round(b * 0.11),
        searchQuery: 'Party Bluetooth Speaker with Wireless Mic BoAt',
        specifications: ['Punchy bass with party lights', 'Wireless microphone for speeches & singing', '8-hour rechargeable battery'],
        matchReason: 'Eliminates the cost of hiring an expensive DJ while keeping energy high.',
      },
      {
        name: 'Customized Guest Return Favors',
        category: 'Favors & Essentials',
        productTitle: 'Blinkit Artisan Chocolate Box & Scented Candle Gift Packs',
        platform: 'Blinkit',
        quantity: Math.max(1, Math.round(guestCount / 2)),
        unitPrice: Math.round((b * 0.05) / Math.max(1, Math.round(guestCount / 2))),
        totalPrice: Math.round(b * 0.05),
        searchQuery: 'Artisan Chocolate Gift Box Blinkit',
        specifications: ['Elegant gift wrap presentation', 'Delivered in 10-15 minutes', 'Gourmet roasted almond assortments'],
        matchReason: 'Leaves a warm, memorable impression on departing guests.',
      }
    ],
    timelineChecklist: [
      { timeframe: 'T-14 Days', task: 'Lock venue or reserve OYO party stay; finalize head count', platformHint: 'OYO' },
      { timeframe: 'T-7 Days', task: 'Pre-order customized cake on Zomato & order Amazon decor sets', platformHint: 'Zomato & Amazon' },
      { timeframe: 'T-2 Days', task: 'Confirm catering headcount and beverage supplies on Blinkit/Swiggy', platformHint: 'Swiggy' },
      { timeframe: 'Event Day', task: 'Setup photo backdrop, test Bluetooth sound system, and accept food delivery', platformHint: 'Setup' },
    ],
    vendorNegotiationTips: [
      'Request complimentary mocktail welcome drinks when ordering food for 15+ guests.',
      'Order party snack refill packs on Blinkit 30 mins before peak party time to avoid overstocking upfront.',
      'DIY the balloon arch with an electric inflator to save ₹3,000 to ₹5,000 on event decorator labor fees.'
    ]
  };
}

function generateMockJewelryPlan(budget: number, currency: string, occasion: string, stylePreference: string, jewelryTypes: string[] = ['Necklace', 'Earrings'], outfitDescription?: string) {
  const b = budget;
  return {
    planTitle: `${occasion} ${stylePreference} Coordinated Ensemble`,
    summary: `Curated fine jewelry collection harmonized for ${occasion} within ${currency} ${budget.toLocaleString()}, balancing brilliance, comfort, and timeless elegance.`,
    allocations: [
      { category: 'Necklaces & Chokers', allocatedAmount: Math.round(b * 0.45), actualSpent: Math.round(b * 0.43), percentage: 45 },
      { category: 'Earrings', allocatedAmount: Math.round(b * 0.25), actualSpent: Math.round(b * 0.24), percentage: 25 },
      { category: 'Bangles & Bracelets', allocatedAmount: Math.round(b * 0.18), actualSpent: Math.round(b * 0.19), percentage: 18 },
      { category: 'Rings & Accents', allocatedAmount: Math.round(b * 0.12), actualSpent: Math.round(b * 0.11), percentage: 12 },
    ],
    outfitAnalysis: {
      dominantColors: ['Royal Emerald Green', 'Champagne Gold'],
      accentColors: ['Pearl White', 'Deep Maroon'],
      necklineType: 'Sweetheart / Deep Plunge',
      fabricStyle: 'Banarasi Silk with Zari Border',
      overallAesthetic: 'Regal Heritage Elegance',
      jewelryPairingAdvice: 'The open neckline pairs impeccably with a collar choker or multi-strand Kundan necklace. Balance with matching statement jhumkas and emerald-studded cocktail rings.',
      recommendedMetalTones: ['22K Gold Plated Brass', 'Antique Matte Gold', 'Kundan with Meenakari back']
    },
    recommendations: [
      {
        name: 'Handcrafted Kundan Choker & Drop Set',
        category: 'Necklaces & Chokers',
        productTitle: 'Zaveri Pearls Heritage 22K Gold Plated Kundan Choker Necklace with Pearl Clusters',
        platform: 'Amazon',
        quantity: 1,
        unitPrice: Math.round(b * 0.43),
        totalPrice: Math.round(b * 0.43),
        searchQuery: 'Zaveri Pearls Kundan Choker Necklace Set',
        specifications: ['High-luster Kundan glass stones', 'Adjustable dori thread closure', 'Meenakari handwork reverse enamel'],
        matchReason: 'Frames the neckline dramatically while mirroring the gold embroidery of formal attire.',
        savingsTip: 'Look for Amazon combo sets that include matching earrings and maang tikka in one box.',
        alternativeProduct: {
          title: 'Sukkhi Glamorous Gold Plated Bridal Choker',
          platform: 'Flipkart',
          unitPrice: Math.round(b * 0.32),
          savingsAmount: Math.round(b * 0.11),
          searchQuery: 'Sukkhi Gold Plated Bridal Choker Flipkart',
        }
      },
      {
        name: 'Chandbali Statement Earrings',
        category: 'Earrings',
        productTitle: 'Myntra Anouk Traditional Crescent Chandbalis with Faux Pearls & Emerald Drops',
        platform: 'Myntra',
        quantity: 1,
        unitPrice: Math.round(b * 0.24),
        totalPrice: Math.round(b * 0.24),
        searchQuery: 'Traditional Crescent Chandbali Pearls Myntra',
        specifications: ['Lightweight hollow-back construction', 'Hypoallergenic posts with rubber stoppers', 'Graceful dangling pearl drops'],
        matchReason: 'Flattering movement that accentuates high-updo or soft-wave hairstyles.',
      },
      {
        name: 'Openable Kada Bangle Pair',
        category: 'Bangles & Bracelets',
        productTitle: 'GIVA 925 Sterling Silver Gold-Plated Peacock Motif Openable Kada',
        platform: 'GIVA',
        quantity: 1,
        unitPrice: Math.round(b * 0.19),
        totalPrice: Math.round(b * 0.19),
        searchQuery: 'GIVA Gold Plated Openable Kada Silver',
        specifications: ['925 Hallmarked sterling silver base', 'Anti-tarnish protective coating', 'Spring latch fits all wrist sizes'],
        matchReason: 'High intrinsic silver value combined with designer craftsmanship.',
        alternativeProduct: {
          title: 'YouBella Antique Gold Plated Bangle Set of 4',
          platform: 'Amazon',
          unitPrice: Math.round(b * 0.10),
          savingsAmount: Math.round(b * 0.09),
          searchQuery: 'YouBella Antique Gold Plated Bangle Set',
        }
      },
      {
        name: 'Adjustable Solitaire Cocktail Ring',
        category: 'Rings & Accents',
        productTitle: 'CaratLane / Tanishq Shaya Ornate Cushion-Cut Emerald & CZ Cocktail Ring',
        platform: 'CaratLane / Tanishq',
        quantity: 1,
        unitPrice: Math.round(b * 0.11),
        totalPrice: Math.round(b * 0.11),
        searchQuery: 'CaratLane Shaya Emerald Cocktail Ring',
        specifications: ['Prong set synthetic green emerald', 'Halo of micro-pave CZ crystals', 'Comfort-fit band'],
        matchReason: 'Draws eyes during hand gestures and clutch bag holding without ring-size fitting issues.',
      }
    ],
    stylingTips: [
      'The Golden Trio Rule: Pick two hero zones (e.g. Neck + Wrists OR Ears + Ring) to keep the look sophisticated rather than crowded.',
      'For heavy dupattas or sarees, pin the pallu before putting on long necklaces to prevent accidental snagging on delicate stone prongs.',
      'Warm skin undertones sparkle brightest with yellow gold and rose gold, while cool undertones highlight rhodium silver and platinum tones.'
    ],
    careAndPreservationTips: [
      'Never spray hairspray or perfume while wearing plated jewelry—always put jewelry on last.',
      'Wipe down pieces with a clean, dry microfiber cloth after wearing to remove skin oils before storing.'
    ]
  };
}

// -------------------------------------------------------------
// VITE DEV MIDDLEWARE & PRODUCTION STATIC SERVING
// -------------------------------------------------------------
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`PocketSmart AI server listening on http://localhost:${PORT}`);
  });
}

startServer();
