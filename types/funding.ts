export interface FundingRate {
  symbol: string;
  icon?: string;
  exchanges: {
    [key: string]: number | null;
  };
  isFavorite?: boolean;
}

export interface Exchange {
  id: string;
  name: string;
  icon?: string;
  type: 'usdt' | 'token';
}
