"use client";

import { useState } from "react";
import { Star, Grid3x3, LayoutList } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FundingRate, Exchange } from "@/types/funding";
import { cn } from "@/lib/utils";

interface FundingRatesTableProps {
  data: FundingRate[];
  exchanges: Exchange[];
  timeframe: string;
  showFavorites?: boolean;
}

export function FundingRatesTable({ data, exchanges, timeframe, showFavorites = false }: FundingRatesTableProps) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const toggleFavorite = (symbol: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(symbol)) {
      newFavorites.delete(symbol);
    } else {
      newFavorites.add(symbol);
    }
    setFavorites(newFavorites);
  };

  const formatRate = (rate: number | null) => {
    if (rate === null) return "-";
    const percentage = (rate * 100).toFixed(4);
    return `${percentage}%`;
  };

  const getRateColor = (rate: number | null) => {
    if (rate === null) return "text-muted-foreground";
    if (rate > 0) return "text-red-500";
    if (rate < 0) return "text-green-500";
    return "text-muted-foreground";
  };

  const usdtExchanges = exchanges.filter(e => e.type === 'usdt');
  const tokenExchanges = exchanges.filter(e => e.type === 'token');

  // Filter data based on favorites if showFavorites is enabled
  const displayData = showFavorites ? data.filter(item => favorites.has(item.symbol)) : data;

  return (
    <div className="w-full font-[family-name:var(--font-ibm-plex-sans)] font-normal">
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[200px] sticky left-0 bg-card z-10">
                <div className="flex items-center gap-2">
                  Symbol
                </div>
              </TableHead>
              {usdtExchanges.map((exchange) => (
                <TableHead key={exchange.id} className="text-center min-w-[100px]">
                  <div className="flex items-center justify-center gap-2">
                    {exchange.id === 'hyperliquid' && (
                      <img 
                        src="https://s2.coinmarketcap.com/static/img/coins/64x64/32196.png" 
                        alt="Hyperliquid"
                        className="w-5 h-5"
                      />
                    )}
                    {exchange.id === 'lighter' && (
                      <img 
                        src="https://s2.coinmarketcap.com/static/img/coins/64x64/39125.png" 
                        alt="Lighter"
                        className="w-5 h-5"
                      />
                    )}
                    {exchange.name}
                  </div>
                </TableHead>
              ))}
              {tokenExchanges.map((exchange) => (
                <TableHead key={exchange.id} className="text-center min-w-[100px]">
                  {exchange.name}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayData.map((item) => (
              <TableRow key={item.symbol} className="hover:bg-muted/50">
                <TableCell className="sticky left-0 bg-card z-10 font-medium">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleFavorite(item.symbol)}
                      className="text-muted-foreground hover:text-yellow-500 transition-colors"
                    >
                      <Star
                        className={cn(
                          "h-4 w-4",
                          favorites.has(item.symbol) && "fill-yellow-500 text-yellow-500"
                        )}
                      />
                    </button>
                    <span className="font-semibold">{item.symbol}</span>
                  </div>
                </TableCell>
                {usdtExchanges.map((exchange) => {
                  const rate = item.exchanges[exchange.id] ?? null;
                  return (
                    <TableCell key={exchange.id} className="text-center">
                      <span className={getRateColor(rate)}>
                        {formatRate(rate)}
                      </span>
                    </TableCell>
                  );
                })}
                {tokenExchanges.map((exchange) => {
                  const rate = item.exchanges[exchange.id] ?? null;
                  return (
                    <TableCell key={exchange.id} className="text-center">
                      <span className={getRateColor(rate)}>
                        {formatRate(rate)}
                      </span>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
