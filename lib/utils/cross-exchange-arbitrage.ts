import { CrossExchangePerpArbitrage } from '@/types/arbitrage';

interface ExchangeRates {
  [exchange: string]: Map<string, number>;
}

export function calculateCrossExchangePerpArbitrage(
  hyperliquidRates: Map<string, number>,
  lighterRates: Map<string, number>,
  asterRates: Map<string, number>,
  extendedRates: Map<string, number>
): CrossExchangePerpArbitrage[] {
  const opportunities: CrossExchangePerpArbitrage[] = [];
  
  // Create exchange rates object for easier iteration
  const exchanges: ExchangeRates = {
    'Hyperliquid': hyperliquidRates,
    'Lighter': lighterRates,
    'Aster': asterRates,
    'Extended': extendedRates,
  };

  // Get all unique symbols across all exchanges
  const allSymbols = new Set<string>();
  Object.values(exchanges).forEach(ratesMap => {
    ratesMap.forEach((_, symbol) => allSymbols.add(symbol));
  });

  // For each symbol, find arbitrage opportunities between exchanges
  allSymbols.forEach(symbol => {
    const exchangeRatesForSymbol: Array<{ exchange: string; rate: number }> = [];
    
    // Collect rates from all exchanges for this symbol
    Object.entries(exchanges).forEach(([exchangeName, ratesMap]) => {
      const rate = ratesMap.get(symbol);
      if (rate !== undefined && rate !== null) {
        exchangeRatesForSymbol.push({ exchange: exchangeName, rate });
      }
    });

    // Need at least 2 exchanges to have an arbitrage opportunity
    if (exchangeRatesForSymbol.length < 2) {
      return;
    }

    // Sort by funding rate (ascending)
    exchangeRatesForSymbol.sort((a, b) => a.rate - b.rate);

    // Find the best arbitrage: lowest rate (long) vs highest rate (short)
    const lowest = exchangeRatesForSymbol[0];
    const highest = exchangeRatesForSymbol[exchangeRatesForSymbol.length - 1];

    // Calculate profit (difference in funding rates)
    // Long on exchange with lowest rate (pay less), short on exchange with highest rate (receive more)
    const rateDifference = highest.rate - lowest.rate;
    
    // Only include if there's a meaningful difference (at least 0.0001% or 0.000001 in decimal)
    if (Math.abs(rateDifference) > 0.000001) {
      const hourlyProfit = Math.abs(rateDifference);
      const dailyProfit = hourlyProfit * 24;
      const monthlyProfit = dailyProfit * 30;
      const annualProfit = dailyProfit * 365;

      opportunities.push({
        symbol,
        longExchange: lowest.exchange,
        shortExchange: highest.exchange,
        longFundingRate: lowest.rate,
        shortFundingRate: highest.rate,
        rateDifference,
        hourlyProfit,
        dailyProfit,
        monthlyProfit,
        annualProfit,
      });
    }
  });

  // Sort by hourly profit (best opportunities first)
  opportunities.sort((a, b) => b.hourlyProfit - a.hourlyProfit);

  return opportunities;
}

export function formatPerpPercentage(value: number): string {
  return `${(value * 100).toFixed(4)}%`;
}

export function getStrategyDescription(longExchange: string, shortExchange: string): string {
  const getSymbol = (exchange: string): string => {
    const symbols: { [key: string]: string } = {
      'Hyperliquid': 'HL',
      'Lighter': 'LT',
      'Aster': 'AS',
      'Extended': 'EX',
    };
    return symbols[exchange] || exchange;
  };
  
  return `Long ${getSymbol(longExchange)} + Short ${getSymbol(shortExchange)}`;
}
