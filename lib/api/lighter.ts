const LIGHTER_API_URL = 'https://mainnet.zklighter.elliot.ai/api/v1/funding-rates';
const LIGHTER_MARKETS_API_URL = 'https://explorer.elliot.ai/api/markets';

interface LighterFundingRate {
  market_id: number;
  exchange: string;
  symbol: string;
  rate: number;
}

interface LighterResponse {
  code: number;
  funding_rates: LighterFundingRate[];
}

export interface LighterMarket {
  symbol: string;
  market_index: number;
}

export interface LighterSpotMarket {
  symbol: string;
  baseSymbol: string;
  market_index: number;
}

export interface LighterMarketPrice {
  symbol: string;
  price: number;
  volume24h?: number;
}

export async function getLighterFundingRates(): Promise<Map<string, number>> {
  try {
    const response = await fetch(LIGHTER_API_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Lighter API error: ${response.statusText}`);
    }

    const data: LighterResponse = await response.json();
    
    const ratesMap = new Map<string, number>();
    
    // Filter only "lighter" exchange rates
    data.funding_rates
      .filter(item => item.exchange === 'lighter')
      .forEach(item => {
        ratesMap.set(item.symbol, item.rate);
      });

    console.log('Lighter rates fetched:', ratesMap.size);
    return ratesMap;
  } catch (error) {
    console.error('Error fetching Lighter funding rates:', error);
    throw error;
  }
}

export async function getLighterMarkets(): Promise<LighterMarket[]> {
  try {
    const response = await fetch(LIGHTER_MARKETS_API_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Lighter Markets API error: ${response.statusText}`);
    }

    const data: LighterMarket[] = await response.json();
    console.log('Lighter markets fetched:', data.length);
    return data;
  } catch (error) {
    console.error('Error fetching Lighter markets:', error);
    throw error;
  }
}

export async function getLighterSpotMarkets(): Promise<Map<string, LighterSpotMarket>> {
  try {
    const markets = await getLighterMarkets();
    const spotMarketsMap = new Map<string, LighterSpotMarket>();
    
    // Filter markets that contain /USDC (spot markets)
    markets
      .filter(market => market.symbol.includes('/USDC'))
      .forEach(market => {
        const baseSymbol = market.symbol.split('/')[0];
        spotMarketsMap.set(baseSymbol, {
          symbol: market.symbol,
          baseSymbol,
          market_index: market.market_index,
        });
      });
    
    console.log('Lighter spot markets found:', spotMarketsMap.size);
    return spotMarketsMap;
  } catch (error) {
    console.error('Error fetching Lighter spot markets:', error);
    throw error;
  }
}

// Get combined data: spot markets availability and funding rates
export async function getLighterArbitrageData(): Promise<{
  spotMarkets: Map<string, LighterSpotMarket>;
  fundingRates: Map<string, number>;
}> {
  try {
    const [spotMarkets, fundingRates] = await Promise.all([
      getLighterSpotMarkets(),
      getLighterFundingRates(),
    ]);

    return {
      spotMarkets,
      fundingRates,
    };
  } catch (error) {
    console.error('Error fetching Lighter arbitrage data:', error);
    throw error;
  }
}
