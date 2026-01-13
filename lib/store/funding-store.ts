import { create } from 'zustand';
import { FundingRate } from '@/types/funding';
import { getMetaAndAssetCtxs } from '@/lib/api/hyperliquid';
import { getLighterFundingRates } from '@/lib/api/lighter';
import { getAsterFundingRates } from '@/lib/api/aster';
import { getExtendedFundingRates, getExtendedMarkets, updateExtendedMarketRate } from '@/lib/api/extended';

interface MetaData {
  universe: Array<{ name: string }>;
  assetCtxs: Array<{ funding: string }>;
}

interface FundingStore {
  metaData: MetaData | null;
  lighterRates: Map<string, number>;
  asterRates: Map<string, number>;
  extendedRates: Map<string, number>;
  extendedMarkets: Array<{ name: string; symbol: string }> | null;
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
  
  fetchMetaData: () => Promise<void>;
  startExtendedProgressiveFetch: () => void;
  getFundingRates: (timeframe: string) => FundingRate[];
}

export const useFundingStore = create<FundingStore>((set, get) => ({
  metaData: null,
  lighterRates: new Map(),
  asterRates: new Map(),
  extendedRates: new Map(),
  extendedMarkets: null,
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
      const [metaData, lighterRates, asterRates, extendedRates] = await Promise.all([
        getMetaAndAssetCtxs(),
        getLighterFundingRates(),
        getAsterFundingRates(),
        getExtendedFundingRates(),
      ]);

      set({
        metaData,
        lighterRates,
        asterRates,
        extendedRates,
        isLoading: false,
        lastFetched: Date.now(),
      });

      console.log('Meta data cached successfully');
      
      // Start progressive fetching of Extended market stats in background
      get().startExtendedProgressiveFetch();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch funding rates';
      set({ error: errorMessage, isLoading: false });
      console.error('Error fetching meta data:', error);
      throw error;
    }
  },

  startExtendedProgressiveFetch: async () => {
    try {
      const markets = await getExtendedMarkets();
      const marketList = markets.map(m => ({ name: m.name, symbol: m.name.split('-')[0] }));
      
      set({ extendedMarkets: marketList });
      
      // Progressively fetch market stats with rate limiting (1 per second to be safe)
      let index = 0;
      const fetchNext = async () => {
        if (index >= marketList.length) {
          console.log('Extended progressive fetch completed');
          return;
        }
        
        const market = marketList[index];
        const result = await updateExtendedMarketRate(market.name);
        
        if (result) {
          const state = get();
          const newExtendedRates = new Map(state.extendedRates);
          newExtendedRates.set(result.symbol, result.rate);
          set({ extendedRates: newExtendedRates });
        }
        
        index++;
        
        // Wait 1 second before next request (60 requests per minute = 1 per second)
        setTimeout(fetchNext, 1000);
      };
      
      // Start the progressive fetch
      fetchNext();
    } catch (error) {
      console.error('Error in progressive Extended fetch:', error);
    }
  },

  getFundingRates: (timeframe: string) => {
    const state = get();
    
    if (!state.metaData) {
      return [];
    }

    const { metaData, lighterRates, asterRates, extendedRates } = state;
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
      ...asterRates.keys(),
      ...extendedRates.keys()
    ]);

    console.log(`Calculated ${timeframe} rates - Hyperliquid: ${hyperliquidRates.size}, Lighter: ${lighterRates.size}, Aster: ${asterRates.size}, Extended: ${extendedRates.size}, Total symbols: ${allSymbols.size}`);

    // Build funding rates array with all exchanges
    const fundingRates: FundingRate[] = [];
    allSymbols.forEach((symbol) => {
      const hlRate = hyperliquidRates.get(symbol);
      const lighterRate = lighterRates.get(symbol);
      const asterRate = asterRates.get(symbol);
      const extendedRate = extendedRates.get(symbol);
      
      // Apply multiplier to all rates
      const adjustedLighterRate = lighterRate !== undefined ? lighterRate * multiplier : null;
      const adjustedAsterRate = asterRate !== undefined ? asterRate * multiplier : null;
      const adjustedExtendedRate = extendedRate !== undefined ? extendedRate * multiplier : null;
      
      fundingRates.push({
        symbol,
        exchanges: {
          hyperliquid: hlRate ?? null,
          lighter: adjustedLighterRate,
          aster: adjustedAsterRate,
          extended: adjustedExtendedRate,
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
