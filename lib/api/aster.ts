const ASTER_API_URL = '/api/aster';

interface AsterFundingRate {
  symbol: string;
  fundingTime: number;
  fundingRate: string;
}

export async function getAsterFundingRates(): Promise<Map<string, number>> {
  try {
    const response = await fetch(ASTER_API_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Aster API error: ${response.statusText}`);
    }

    const data: AsterFundingRate[] = await response.json();
    
    const ratesMap = new Map<string, number>();
    
    // Parse and normalize symbol names (remove USDT suffix)
    data.forEach(item => {
      let symbol = item.symbol;
      
      // Remove USDT suffix to match other exchanges
      if (symbol.endsWith('USDT')) {
        symbol = symbol.slice(0, -4);
      }
      
      // Skip Chinese characters or non-standard symbols
      if (/[\u4e00-\u9fa5]/.test(symbol)) {
        return;
      }
      
      const rate = parseFloat(item.fundingRate);
      ratesMap.set(symbol, rate);
    });

    console.log('Aster rates fetched:', ratesMap.size);
    return ratesMap;
  } catch (error) {
    console.error('Error fetching Aster funding rates:', error);
    throw error;
  }
}
