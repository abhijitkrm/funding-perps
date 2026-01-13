const LIGHTER_API_URL = 'https://mainnet.zklighter.elliot.ai/api/v1/funding-rates';

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
