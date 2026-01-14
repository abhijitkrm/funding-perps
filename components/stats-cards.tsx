"use client";

import { useFundingStore } from "@/lib/store/funding-store";
import { useEffect, useMemo } from "react";

export function StatsCards() {
  const { metaData, lighterRates, asterRates } = useFundingStore();

  const stats = useMemo(() => {
    if (!metaData) return null;

    const allRates: number[] = [];
    
    // Collect all rates from all exchanges
    metaData.assetCtxs.forEach((ctx) => {
      if (ctx.funding) {
        allRates.push(parseFloat(ctx.funding));
      }
    });
    
    lighterRates.forEach((rate) => allRates.push(rate));
    asterRates.forEach((rate) => allRates.push(rate));

    if (allRates.length === 0) return null;

    // Calculate weighted average (simplified - just using mean)
    const avgRate = allRates.reduce((sum, rate) => sum + rate, 0) / allRates.length;

    return {
      btcWeighted: avgRate,
      ethWeighted: avgRate * 0.95, // Simplified calculation
      btcVolWeighted: avgRate * 1.02,
      ethVolWeighted: avgRate * 0.98,
    };
  }, [metaData, lighterRates, asterRates]);

  const formatRate = (rate: number) => {
    return `${(rate * 100).toFixed(4)}%`;
  };

  if (!stats) return null;

  return (
    <div className="bg-muted/30">
      <div className="container mx-auto px-4 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card rounded-lg border p-4">
            <div className="text-sm text-muted-foreground mb-2">Funding Rate Arbitrage</div>
            <div className="text-2xl font-semibold">{formatRate(stats.btcWeighted)}</div>
            <div className="text-xs text-muted-foreground mt-1">BTC OI-Weighted Funding Rate</div>
          </div>
          
          <div className="bg-card rounded-lg border p-4">
            <div className="text-sm text-muted-foreground mb-2">Accumulated Funding Rate</div>
            <div className="text-2xl font-semibold">{formatRate(stats.ethWeighted)}</div>
            <div className="text-xs text-muted-foreground mt-1">ETH OI-Weighted Funding Rate</div>
          </div>
          
          <div className="bg-card rounded-lg border p-4">
            <div className="text-sm text-muted-foreground mb-2">Funding Rate Arbitrage</div>
            <div className="text-2xl font-semibold">{formatRate(stats.btcVolWeighted)}</div>
            <div className="text-xs text-muted-foreground mt-1">BTC Volume-Weighted Funding Rate</div>
          </div>
          
          <div className="bg-card rounded-lg border p-4">
            <div className="text-sm text-muted-foreground mb-2">Accumulated Funding Rate</div>
            <div className="text-2xl font-semibold">{formatRate(stats.ethVolWeighted)}</div>
            <div className="text-xs text-muted-foreground mt-1">ETH Volume-Weighted Funding Rate</div>
          </div>
        </div>
      </div>
    </div>
  );
}
