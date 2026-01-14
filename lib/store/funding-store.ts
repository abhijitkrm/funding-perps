import { create } from 'zustand';
import { FundingRate } from '@/types/funding';
import { getMetaAndAssetCtxs, getSpotMetaAndAssetCtxs } from '@/lib/api/hyperliquid';
import { getLighterFundingRates, getLighterArbitrageData, LighterSpotMarket } from '@/lib/api/lighter';
import { getAsterFundingRates } from '@/lib/api/aster';
import { SpotMarketData } from '@/types/arbitrage';

interface MetaData {
  universe: Array<{ name: string }>;
  assetCtxs: Array<{ funding: string }>;
}

interface FundingStore {
  metaData: MetaData | null;
  lighterRates: Map<string, number>;
  asterRates: Map<string, number>;
  spotMarkets: Map<string, SpotMarketData>;
  lighterSpotMarkets: Map<string, LighterSpotMarket>;
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
  
  fetchMetaData: () => Promise<void>;
  fetchSpotMarkets: () => Promise<void>;
  fetchLighterSpotMarkets: () => Promise<void>;
  getFundingRates: (timeframe: string) => FundingRate[];
}

export const useFundingStore = create<FundingStore>((set, get) => ({
  metaData: null,
  lighterRates: new Map(),
  asterRates: new Map(),
  spotMarkets: new Map(),
  lighterSpotMarkets: new Map(),
  isLoading: false,
  error: null,
  lastFetched: null,

  fetchMetaData: async () => {
    const state = get();
    
    // If data was fetched less than 5 minutes ago, don't refetch
    if (state.metaData && state.lastFetched && Date.now() - state.lastFetched < 5 * 60 * 1000) {
      console.log('Using cached data');
      return;
    }

    set({ isLoading: true, error: null });

    try {
      console.log('Fetching meta data from APIs...');
      const [metaData, lighterRates, asterRates] = await Promise.all([
        getMetaAndAssetCtxs(),
        getLighterFundingRates(),
        getAsterFundingRates(),
      ]);

      set({
        metaData,
        lighterRates,
        asterRates,
        isLoading: false,
        lastFetched: Date.now(),
      });

      console.log('Meta data cached successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch funding rates';
      set({ error: errorMessage, isLoading: false });
      console.error('Error fetching meta data:', error);
      throw error;
    }
  },

  fetchSpotMarkets: async () => {
    try {
      console.log('Fetching spot market data...');
      const spotData = await getSpotMetaAndAssetCtxs();
      
      const spotMarketsMap = new Map<string, SpotMarketData>();
      
      // Map spot pairs to market data
      spotData.universe.forEach((pair, index) => {
        const assetCtx = spotData.assetCtxs[index];
        if (assetCtx && pair.isCanonical) {
          // Extract base token from pair name (e.g., "HYPE/USDC" -> "HYPE")
          const baseToken = pair.name.split('/')[0];
          
          spotMarketsMap.set(baseToken, {
            symbol: baseToken,
            price: parseFloat(assetCtx.markPx || assetCtx.midPx),
            volume24h: parseFloat(assetCtx.dayNtlVlm || '0'),
          });
        }
      });
      
      console.log('Spot markets fetched:', spotMarketsMap.size);
      set({ spotMarkets: spotMarketsMap });
    } catch (error) {
      console.error('Error fetching spot markets:', error);
    }
  },

  fetchLighterSpotMarkets: async () => {
    try {
      console.log('Fetching Lighter spot market data...');
      const { spotMarkets } = await getLighterArbitrageData();
      
      console.log('Lighter spot markets fetched:', spotMarkets.size);
      set({ lighterSpotMarkets: spotMarkets });
    } catch (error) {
      console.error('Error fetching Lighter spot markets:', error);
    }
  },

  getFundingRates: (timeframe: string) => {
    const state = get();
    
    if (!state.metaData) {
      return [];
    }

    const { metaData, lighterRates, asterRates } = state;
    const hyperliquidRates = new Map<string, number>();

    // Calculate multiplier based on timeframe
    let multiplier = 1;
    if (timeframe === 'current' || timeframe === '1day') {
      multiplier = 1; // Hourly rate
    } else if (timeframe === '7day') {
      multiplier = 168; // 24 * 7
    } else if (timeframe === '30day') {
      multiplier = 720; // 24 * 30
    } else if (timeframe === '1year') {
      multiplier = 8760; // 24 * 365
    }

    // Extract Hyperliquid rates from cached data
    metaData.assetCtxs.forEach((ctx, index) => {
      const coin = metaData.universe[index]?.name;
      if (coin && ctx.funding) {
        const rate = parseFloat(ctx.funding) * multiplier;
        hyperliquidRates.set(coin, rate);
      }
    });

    // Get all unique symbols from all exchanges
    const allSymbols = new Set([
      ...hyperliquidRates.keys(), 
      ...lighterRates.keys(),
      ...asterRates.keys()
    ]);

    console.log(`Calculated ${timeframe} rates - Hyperliquid: ${hyperliquidRates.size}, Lighter: ${lighterRates.size}, Aster: ${asterRates.size}, Total symbols: ${allSymbols.size}`);

    // Build funding rates array with all exchanges
    const fundingRates: FundingRate[] = [];
    allSymbols.forEach((symbol) => {
      const hlRate = hyperliquidRates.get(symbol);
      const lighterRate = lighterRates.get(symbol);
      const asterRate = asterRates.get(symbol);
      
      // Apply multiplier to all rates
      const adjustedLighterRate = lighterRate !== undefined ? lighterRate * multiplier : null;
      const adjustedAsterRate = asterRate !== undefined ? asterRate * multiplier : null;
      
      fundingRates.push({
        symbol,
        exchanges: {
          hyperliquid: hlRate ?? null,
          lighter: adjustedLighterRate,
          aster: adjustedAsterRate,
        },
      });
    });

    // Sort with priority coins first
    fundingRates.sort((a, b) => {
      const order = ['BTC', 'ETH', 'SOL', 'XRP', 'DOGE', 'BNB'];
      const aIndex = order.indexOf(a.symbol);
      const bIndex = order.indexOf(b.symbol);

      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      return a.symbol.localeCompare(b.symbol);
    });

    return fundingRates;
  },
}));
