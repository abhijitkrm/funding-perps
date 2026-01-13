"use client";

import { useFundingStore } from "@/lib/store/funding-store";
import { useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function FundingExtremes() {
  const { metaData, lighterRates, asterRates, extendedRates } = useFundingStore();

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
    extendedRates.forEach((rate, symbol) => {
      allRatesWithSymbol.push({ symbol, rate, exchange: 'Extended' });
    });

    // Sort and get top 5 highest and lowest
    const sorted = [...allRatesWithSymbol].sort((a, b) => b.rate - a.rate);
    
    return {
      highest: sorted.slice(0, 5),
      lowest: sorted.slice(-5).reverse(),
    };
  }, [metaData, lighterRates, asterRates, extendedRates]);

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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-[family-name:var(--font-ibm-plex-sans)] font-normal">
          <div>
            <h3 className="text-lg font-semibold mb-4">Highest Funding Rate</h3>
            <div className="rounded-lg border bg-card">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Asset (DEX)</TableHead>
                    <TableHead className="text-right">Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {extremes.highest.map((item, index) => (
                    <TableRow key={index} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.symbol}</span>
                          <span className="text-xs text-muted-foreground">({item.exchange})</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`font-semibold ${getRateColor(item.rate)}`}>
                          {formatRate(item.rate)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Lowest Funding Rate</h3>
            <div className="rounded-lg border bg-card">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Asset (DEX)</TableHead>
                    <TableHead className="text-right">Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {extremes.lowest.map((item, index) => (
                    <TableRow key={index} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.symbol}</span>
                          <span className="text-xs text-muted-foreground">({item.exchange})</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`font-semibold ${getRateColor(item.rate)}`}>
                          {formatRate(item.rate)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
