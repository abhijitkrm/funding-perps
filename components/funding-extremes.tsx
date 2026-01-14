"use client";

import { useFundingStore } from "@/lib/store/funding-store";
import { useMemo } from "react";

export function FundingExtremes() {
  const { metaData, lighterRates, asterRates } = useFundingStore();

  const extremes = useMemo(() => {
    if (!metaData) return { highest: [], lowest: [] };

    const allRatesWithSymbol: Array<{ symbol: string; rate: number; exchange: string }> = [];
    
    // Collect from Hyperliquid
    metaData.assetCtxs.forEach((ctx, index) => {
      const coin = metaData.universe[index]?.name;
      if (coin && ctx.funding) {
        allRatesWithSymbol.push({
          symbol: coin,
          rate: parseFloat(ctx.funding),
          exchange: 'Hyperliquid'
        });
      }
    });
    
    // Collect from other exchanges
    lighterRates.forEach((rate, symbol) => {
      allRatesWithSymbol.push({ symbol, rate, exchange: 'Lighter' });
    });
    asterRates.forEach((rate, symbol) => {
      allRatesWithSymbol.push({ symbol, rate, exchange: 'Aster' });
    });

    // Sort and get top 5 highest and lowest
    const sorted = [...allRatesWithSymbol].sort((a, b) => b.rate - a.rate);
    
    return {
      highest: sorted.slice(0, 5),
      lowest: sorted.slice(-5).reverse(),
    };
  }, [metaData, lighterRates, asterRates]);

  const formatRate = (rate: number) => {
    const percentage = (rate * 100).toFixed(4);
    return `${rate >= 0 ? '' : ''}${percentage}%`;
  };

  const getRateColor = (rate: number) => {
    if (rate > 0) return "text-red-500";
    if (rate < 0) return "text-green-500";
    return "text-muted-foreground";
  };

  return (
    <div className="bg-card">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Highest Funding Rate</h3>
            <div className="space-y-2">
              {extremes.highest.map((item, index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{item.symbol}</span>
                    <span className="text-xs text-muted-foreground">{item.exchange}</span>
                  </div>
                  <span className={`font-semibold ${getRateColor(item.rate)}`}>
                    {formatRate(item.rate)}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Lowest Funding Rate</h3>
            <div className="space-y-2">
              {extremes.lowest.map((item, index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{item.symbol}</span>
                    <span className="text-xs text-muted-foreground">{item.exchange}</span>
                  </div>
                  <span className={`font-semibold ${getRateColor(item.rate)}`}>
                    {formatRate(item.rate)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
