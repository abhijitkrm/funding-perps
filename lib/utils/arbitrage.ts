import { ArbitrageOpportunity, SpotMarketData } from '@/types/arbitrage';
import { LighterSpotMarket } from '@/lib/api/lighter';

export function calculateArbitrageOpportunities(
  spotMarkets: Map<string, SpotMarketData>,
  perpFundingRates: Map<string, number>,
  perpPrices: Map<string, number>
): ArbitrageOpportunity[] {
  const opportunities: ArbitrageOpportunity[] = [];

  spotMarkets.forEach((spotData, symbol) => {
    const fundingRate = perpFundingRates.get(symbol);
    const perpPrice = perpPrices.get(symbol);

    if (fundingRate !== undefined && perpPrice !== undefined) {
      // Funding rate is hourly, already in percentage form
      const hourlyReturn = Math.abs(fundingRate);
      const dailyReturn = hourlyReturn * 24;
      const monthlyReturn = dailyReturn * 30;
      const annualReturn = dailyReturn * 365;

      // Determine action based on funding rate sign
      // Negative funding: longs pay shorts -> buy spot, short perp
      // Positive funding: shorts pay longs -> sell spot, long perp
      const action = fundingRate < 0 ? 'buy_spot_short_perp' : 'sell_spot_long_perp';

      opportunities.push({
        symbol,
        spotPrice: spotData.price,
        perpPrice,
        fundingRate,
        hourlyReturn,
        dailyReturn,
        monthlyReturn,
        annualReturn,
        action,
        spotExchange: 'Hyperliquid Spot',
        perpExchange: 'Hyperliquid Perps',
      });
    }
  });

  // Sort by absolute hourly return (best opportunities first)
  opportunities.sort((a, b) => Math.abs(b.hourlyReturn) - Math.abs(a.hourlyReturn));

  return opportunities;
}

export function calculateLighterArbitrageOpportunities(
  lighterSpotMarkets: Map<string, LighterSpotMarket>,
  lighterFundingRates: Map<string, number>
): ArbitrageOpportunity[] {
  const opportunities: ArbitrageOpportunity[] = [];

  lighterSpotMarkets.forEach((spotMarket, symbol) => {
    const fundingRate = lighterFundingRates.get(symbol);

    if (fundingRate !== undefined) {
      // Funding rate is hourly, already in percentage form
      const hourlyReturn = Math.abs(fundingRate);
      const dailyReturn = hourlyReturn * 24;
      const monthlyReturn = dailyReturn * 30;
      const annualReturn = dailyReturn * 365;

      // Determine action based on funding rate sign
      const action = fundingRate < 0 ? 'buy_spot_short_perp' : 'sell_spot_long_perp';

      // For Lighter, we don't have separate spot/perp prices from the API
      // We'll show 0 for prices and focus on the funding rate opportunity
      opportunities.push({
        symbol,
        spotPrice: 0,
        perpPrice: 0,
        fundingRate,
        hourlyReturn,
        dailyReturn,
        monthlyReturn,
        annualReturn,
        action,
        spotExchange: 'Lighter Spot',
        perpExchange: 'Lighter Perps',
      });
    }
  });

  return opportunities;
}

export function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(4)}%`;
}

export function getActionDescription(action: 'buy_spot_short_perp' | 'sell_spot_long_perp'): string {
  if (action === 'buy_spot_short_perp') {
    return 'Buy Spot + Short Perp';
  }
  return 'Sell Spot + Long Perp';
}

export function getActionColor(fundingRate: number): string {
  if (fundingRate < 0) {
    return 'text-green-500'; // Negative funding = opportunity to earn
  }
  return 'text-red-500'; // Positive funding = pay to hold
}
