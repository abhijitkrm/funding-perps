"use client";

import { useState, useEffect, useMemo } from "react";
import { TopNav } from "@/components/top-nav";
import { Footer } from "@/components/footer";
import { useFundingStore } from "@/lib/store/funding-store";
import { calculateCrossExchangePerpArbitrage, formatPerpPercentage, getStrategyDescription } from "@/lib/utils/cross-exchange-arbitrage";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function PerpArbitragePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { 
    metaData,
    lighterRates, 
    asterRates,
    isLoading, 
    fetchMetaData
  } = useFundingStore();

  useEffect(() => {
    fetchMetaData();
  }, [fetchMetaData]);

  const opportunities = useMemo(() => {
    if (!metaData) {
      return [];
    }

    // Extract Hyperliquid rates from metaData
    const hyperliquidRates = new Map<string, number>();
    metaData.assetCtxs.forEach((ctx: any, index: number) => {
      const coin = metaData.universe[index]?.name;
      if (coin && ctx.funding) {
        hyperliquidRates.set(coin, parseFloat(ctx.funding));
      }
    });

    return calculateCrossExchangePerpArbitrage(
      hyperliquidRates,
      lighterRates,
      asterRates,
      new Map()
    );
  }, [metaData, lighterRates, asterRates]);

  const filteredOpportunities = useMemo(() => {
    if (!searchQuery) return opportunities;
    return opportunities.filter(opp =>
      opp.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [opportunities, searchQuery]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopNav onSearch={setSearchQuery} />

      <div className="bg-card py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold text-center">Perp ↔ Perp Cross-Exchange Arbitrage</h1>
          <p className="text-center text-muted-foreground mt-2">
            Profit from funding rate differences across exchanges by going long on one and short on another
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
            <p className="text-muted-foreground">No cross-exchange arbitrage opportunities found</p>
          </div>
        )}

        {!isLoading && filteredOpportunities.length > 0 && (
          <div className="rounded-lg border bg-card font-[family-name:var(--font-ibm-plex-sans)] font-normal">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Asset</TableHead>
                  <TableHead>Strategy</TableHead>
                  <TableHead className="text-right">Long Rate</TableHead>
                  <TableHead className="text-right">Short Rate</TableHead>
                  <TableHead className="text-right">Rate Diff</TableHead>
                  <TableHead className="text-right">Hourly Profit</TableHead>
                  <TableHead className="text-right">Daily Profit</TableHead>
                  <TableHead className="text-right">Monthly Profit</TableHead>
                  <TableHead className="text-right">Annual Profit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOpportunities.map((opp, index) => (
                  <TableRow key={`${opp.symbol}-${index}`} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{opp.symbol}</TableCell>
                    <TableCell>
                      <span className="text-xs bg-muted px-2 py-1 rounded">
                        {getStrategyDescription(opp.longExchange, opp.shortExchange)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-xs text-muted-foreground">{opp.longExchange}</span>
                        <span className="text-blue-500">{formatPerpPercentage(opp.longFundingRate)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-xs text-muted-foreground">{opp.shortExchange}</span>
                        <span className="text-orange-500">{formatPerpPercentage(opp.shortFundingRate)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-semibold text-purple-500">
                        {formatPerpPercentage(opp.rateDifference)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatPerpPercentage(opp.hourlyProfit)}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatPerpPercentage(opp.dailyProfit)}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-green-500">
                      {formatPerpPercentage(opp.monthlyProfit)}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-green-600">
                      {formatPerpPercentage(opp.annualProfit)}
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
            <li>• <strong>Cross-Exchange Arbitrage:</strong> Profit from funding rate differences between exchanges</li>
            <li>• <strong>Strategy:</strong> Go long on the exchange with the lowest funding rate (pay less) and short on the exchange with the highest rate (receive more)</li>
            <li>• <strong>Profit:</strong> The difference between the two funding rates is your net profit per hour</li>
            <li>• <strong>Risk:</strong> Price risk is hedged since you're both long and short the same asset, but you're exposed to exchange risk and basis risk</li>
          </ul>
        </div>

        <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <h3 className="font-semibold mb-2 text-yellow-600 dark:text-yellow-500">⚠️ Disclaimer:</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Returns shown are <strong>theoretical</strong> and assume perfect execution with no slippage</li>
            <li>• <strong>Price spreads</strong> between exchanges may cause losses during trade execution</li>
            <li>• <strong>Trading fees</strong> are not included in the calculations and will reduce actual returns</li>
            <li>• <strong>Basis drift</strong> between exchanges can impact profitability over time</li>
            <li>• Market conditions can change rapidly - always verify prices and rates before executing trades</li>
          </ul>
        </div>
      </main>

      <Footer />
    </div>
  );
}
