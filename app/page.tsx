"use client";

import { useState, useEffect } from "react";
import { TopNav } from "@/components/top-nav";
import { FundingExtremes } from "@/components/funding-extremes";
import { Header } from "@/components/header";
import { FundingRatesTable } from "@/components/funding-rates-table";
import { Footer } from "@/components/footer";
import { useFundingStore } from "@/lib/store/funding-store";
import { Exchange } from "@/types/funding";

const exchanges: Exchange[] = [
  { id: 'hyperliquid', name: 'Hyperliquid', type: 'usdt' },
  { id: 'lighter', name: 'Lighter', type: 'usdt' },
  { id: 'aster', name: 'Aster', type: 'usdt' },
  { id: 'extended', name: 'Extended', type: 'usdt' },
];

export default function Home() {
  const [timeframe, setTimeframe] = useState("current");
  const [showFavorites, setShowFavorites] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const { 
    metaData, 
    isLoading, 
    error, 
    fetchMetaData, 
    getFundingRates 
  } = useFundingStore();

  // Fetch meta data only once on mount
  useEffect(() => {
    fetchMetaData();
  }, [fetchMetaData]);

  // Calculate funding rates based on current timeframe (no refetch needed)
  let fundingRates = metaData ? getFundingRates(timeframe) : [];
  
  // Filter by search query if present
  if (searchQuery) {
    fundingRates = fundingRates.filter(rate => 
      rate.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }
  
  console.log('Render - loading:', isLoading, 'error:', error, 'fundingRates:', fundingRates.length, 'timeframe:', timeframe);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopNav onSearch={setSearchQuery} />
      
      <div className="bg-card py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold text-center">Funding Rates For Perpetual Swaps</h1>
        </div>
      </div>
      
      <FundingExtremes />
      
      <Header
        currentTimeframe={timeframe}
        onTimeframeChange={setTimeframe}
        showFavorites={showFavorites}
        onToggleFavorites={() => setShowFavorites(!showFavorites)}
      />
      <main className="container mx-auto px-4 py-6">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
              <p className="mt-4 text-muted-foreground">Loading funding rates...</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-center">
            <p className="text-destructive font-medium">Error: {error}</p>
          </div>
        )}
        
        {!isLoading && !error && (
          <FundingRatesTable
            data={fundingRates}
            exchanges={exchanges}
            timeframe={timeframe}
            showFavorites={showFavorites}
          />
        )}
      </main>
      <Footer />
    </div>
  );
}
