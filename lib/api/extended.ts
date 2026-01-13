const EXTENDED_MARKETS_API_URL = '/api/extended/markets';
const EXTENDED_MARKET_STATS_API_URL = '/api/extended/market-stats';

interface ExtendedMarket {
  name: string;
  uiName: string;
  category: string;
  assetName: string;
  active: boolean;
  status: string;
  marketStats: {
    fundingRate: string;
  };
}

interface ExtendedMarketsResponse {
  status: string;
  data: ExtendedMarket[];
}

interface ExtendedMarketStatsResponse {
  status: string;
  data: {
    fundingRate: string;
  };
}

export async function getExtendedMarkets(): Promise<ExtendedMarket[]> {
  try {
    const response = await fetch(EXTENDED_MARKETS_API_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Extended Markets API error: ${response.statusText}`);
    }

    const result: ExtendedMarketsResponse = await response.json();
    
    // Filter only active markets
    const activeMarkets = result.data.filter(market => market.active && market.status === 'ACTIVE');
    
    console.log('Extended markets fetched:', activeMarkets.length);
    return activeMarkets;
  } catch (error) {
    console.error('Error fetching Extended markets:', error);
    throw error;
  }
}

export async function getExtendedMarketStats(marketName: string): Promise<number | null> {
  try {
    const response = await fetch(`${EXTENDED_MARKET_STATS_API_URL}?market=${encodeURIComponent(marketName)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.warn(`Failed to fetch stats for ${marketName}: ${response.statusText}`);
      return null;
    }

    const result: ExtendedMarketStatsResponse = await response.json();
    
    return parseFloat(result.data.fundingRate);
  } catch (error) {
    console.error(`Error fetching Extended market stats for ${marketName}:`, error);
    return null;
  }
}

export async function getExtendedFundingRates(): Promise<Map<string, number>> {
  try {
    const markets = await getExtendedMarkets();
    const ratesMap = new Map<string, number>();
    
    // Use initial funding rates from markets list
    markets.forEach(market => {
      // Extract symbol from market name (e.g., "BTC-USD" -> "BTC")
      const symbol = market.name.split('-')[0];
      const rate = parseFloat(market.marketStats.fundingRate);
      ratesMap.set(symbol, rate);
    });

    console.log('Extended initial rates loaded:', ratesMap.size);
    return ratesMap;
  } catch (error) {
    console.error('Error fetching Extended funding rates:', error);
    throw error;
  }
}

// Function to update a single market's funding rate
export async function updateExtendedMarketRate(marketName: string): Promise<{ symbol: string; rate: number } | null> {
  try {
    const rate = await getExtendedMarketStats(marketName);
    if (rate === null) return null;
    
    const symbol = marketName.split('-')[0];
    return { symbol, rate };
  } catch (error) {
    console.error(`Error updating Extended market rate for ${marketName}:`, error);
    return null;
  }
}
