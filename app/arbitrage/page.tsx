"use client";

import { useState, useEffect, useMemo } from "react";
import { TopNav } from "@/components/top-nav";
import { Footer } from "@/components/footer";
import { useFundingStore } from "@/lib/store/funding-store";
import { calculateArbitrageOpportunities, calculateLighterArbitrageOpportunities, formatPercentage, getActionDescription, getActionColor } from "@/lib/utils/arbitrage";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function ArbitragePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { 
    metaData, 
    spotMarkets, 
    lighterSpotMarkets,
    lighterRates,
    isLoading, 
    fetchMetaData, 
    fetchSpotMarkets,
    fetchLighterSpotMarkets
  } = useFundingStore();

  useEffect(() => {
    fetchMetaData();
    fetchSpotMarkets();
    fetchLighterSpotMarkets();
  }, [fetchMetaData, fetchSpotMarkets, fetchLighterSpotMarkets]);

  const hyperliquidOpportunities = useMemo(() => {
    if (!metaData || !spotMarkets || spotMarkets.size === 0) {
      return [];
    }

    // Extract current funding rates and prices from metaData
    const perpFundingRates = new Map<string, number>();
    const perpPrices = new Map<string, number>();

    metaData.assetCtxs.forEach((ctx: any, index: number) => {
      const coin = metaData.universe[index]?.name;
      if (coin && ctx.funding) {
        perpFundingRates.set(coin, parseFloat(ctx.funding));
        perpPrices.set(coin, parseFloat(ctx.markPx || '0'));
      }
    });

    return calculateArbitrageOpportunities(spotMarkets, perpFundingRates, perpPrices);
  }, [metaData, spotMarkets]);

  const lighterOpportunities = useMemo(() => {
    if (!lighterSpotMarkets || lighterSpotMarkets.size === 0 || !lighterRates || lighterRates.size === 0) {
      return [];
    }

    return calculateLighterArbitrageOpportunities(lighterSpotMarkets, lighterRates);
  }, [lighterSpotMarkets, lighterRates]);

  // Combine all opportunities and sort by absolute hourly return
  const allOpportunities = useMemo(() => {
    const combined = [...hyperliquidOpportunities, ...lighterOpportunities];
    combined.sort((a, b) => Math.abs(b.hourlyReturn) - Math.abs(a.hourlyReturn));
    return combined;
  }, [hyperliquidOpportunities, lighterOpportunities]);

  const filteredOpportunities = useMemo(() => {
    if (!searchQuery) return allOpportunities;
    return allOpportunities.filter(opp =>
      opp.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allOpportunities, searchQuery]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopNav onSearch={setSearchQuery} />

      <div className="bg-card py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold text-center">Spot Arbitrage</h1>
          <p className="text-center text-muted-foreground mt-2">
            Earn funding rates by hedging spot positions with perpetual futures across exchanges
          </p>
        </div>
      </div>

      <main className="container mx-auto px-4 py-6 flex-1">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
              <p className="mt-4 text-muted-foreground">Loading arbitrage opportunities...</p>
            </div>
          </div>
        )}

        {!isLoading && filteredOpportunities.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No spot arbitrage opportunities found</p>
          </div>
        )}

        {!isLoading && filteredOpportunities.length > 0 && (
          <div className="rounded-lg border bg-card font-[family-name:var(--font-ibm-plex-sans)] font-normal">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Asset</TableHead>
                  <TableHead>Exchange</TableHead>
                  <TableHead>Strategy</TableHead>
                  <TableHead className="text-right">Funding Rate</TableHead>
                  <TableHead className="text-right">Hourly Return</TableHead>
                  <TableHead className="text-right">Daily Return</TableHead>
                  <TableHead className="text-right">Monthly Return</TableHead>
                  <TableHead className="text-right">Annual Return</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOpportunities.map((opp, index) => (
                  <TableRow key={`${opp.symbol}-${opp.spotExchange}-${index}`} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{opp.symbol}</TableCell>
                    <TableCell>
                      <span className="text-xs font-semibold text-muted-foreground">
                        {opp.spotExchange === 'Hyperliquid Spot' ? 'HL' : 'LT'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs bg-muted px-2 py-1 rounded">
                        {getActionDescription(opp.action)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={getActionColor(opp.fundingRate)}>
                        {formatPercentage(opp.fundingRate)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatPercentage(opp.hourlyReturn)}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatPercentage(opp.dailyReturn)}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-green-500">
                      {formatPercentage(opp.monthlyReturn)}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-green-600">
                      {formatPercentage(opp.annualReturn)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <div className="mt-8 p-4 bg-muted/50 rounded-lg">
          <h3 className="font-semibold mb-2">How it works:</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• <strong>Negative Funding Rate:</strong> Longs pay shorts → Buy spot + Short perp to earn funding</li>
            <li>• <strong>Positive Funding Rate:</strong> Shorts pay longs → Sell spot + Long perp to earn funding</li>
            <li>• Funding rates are paid/received every hour on both Hyperliquid and Lighter</li>
            <li>• <strong>Note:</strong> Lighter prices not shown as API doesn't provide separate spot/perp prices</li>
          </ul>
        </div>

        <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <h3 className="font-semibold mb-2 text-yellow-600 dark:text-yellow-500">⚠️ Disclaimer:</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Returns shown are <strong>theoretical</strong> and assume perfect execution with no slippage</li>
            <li>• <strong>Price spreads</strong> between spot and perp markets may cause losses during trade execution</li>
            <li>• <strong>Trading fees</strong> are not included in the calculations and will reduce actual returns</li>
            <li>• Market conditions can change rapidly - always verify prices before executing trades</li>
          </ul>
        </div>
      </main>

      <Footer />
    </div>
  );
}
