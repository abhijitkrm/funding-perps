export interface ArbitrageOpportunity {
  symbol: string;
  spotPrice: number;
  perpPrice: number;
  fundingRate: number;
  hourlyReturn: number;
  dailyReturn: number;
  monthlyReturn: number;
  annualReturn: number;
  action: 'buy_spot_short_perp' | 'sell_spot_long_perp';
  spotExchange: string;
  perpExchange: string;
}

export interface SpotMarketData {
  symbol: string;
  price: number;
  volume24h: number;
}

export interface CrossExchangePerpArbitrage {
  symbol: string;
  longExchange: string;
  shortExchange: string;
  longFundingRate: number;
  shortFundingRate: number;
  rateDifference: number;
  hourlyProfit: number;
  dailyProfit: number;
  monthlyProfit: number;
  annualProfit: number;
}
