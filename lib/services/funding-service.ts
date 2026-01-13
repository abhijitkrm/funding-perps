import { FundingRate } from "@/types/funding";
import {
  getCurrentFundingRates,
  getHistoricalFundingRates,
  getPredictedFundings,
  getMetaAndAssetCtxs,
} from "@/lib/api/hyperliquid";

export async function fetchAllFundingRates(
  timeframe: string = "current"
): Promise<FundingRate[]> {
  try {
    console.log('Fetching funding rates for timeframe:', timeframe);
    const metaData = await getMetaAndAssetCtxs();
    console.log('MetaData received:', { 
      universeLength: metaData.universe?.length, 
      assetCtxsLength: metaData.assetCtxs?.length 
    });
    
    if (!metaData.universe || !Array.isArray(metaData.universe)) {
      console.error('Invalid universe data:', metaData);
      throw new Error('Invalid universe data from Hyperliquid API');
    }
    
    const coins = metaData.universe.map((u) => u.name);
    console.log('Coins extracted:', coins.length);
    
    const hyperliquidRates = new Map<string, number>();
    
    if (timeframe === "current" || timeframe === "1day") {
      // For current and 1 day, show hourly rate as-is
      metaData.assetCtxs.forEach((ctx, index) => {
        const coin = metaData.universe[index]?.name;
        if (coin && ctx.funding) {
          hyperliquidRates.set(coin, parseFloat(ctx.funding));
        }
      });
      console.log('Current/1day rates extracted:', hyperliquidRates.size);
    } else if (timeframe === "7day") {
      // For 7 day, multiply hourly rate by 24*7 = 168 to show weekly total
      metaData.assetCtxs.forEach((ctx, index) => {
        const coin = metaData.universe[index]?.name;
        if (coin && ctx.funding) {
          const weeklyRate = parseFloat(ctx.funding) * 168;
          hyperliquidRates.set(coin, weeklyRate);
        }
      });
      console.log('7day rates calculated:', hyperliquidRates.size);
    } else if (timeframe === "30day") {
      // For 30 day, multiply hourly rate by 24*30 = 720 to show monthly total
      metaData.assetCtxs.forEach((ctx, index) => {
        const coin = metaData.universe[index]?.name;
        if (coin && ctx.funding) {
          const monthlyRate = parseFloat(ctx.funding) * 720;
          hyperliquidRates.set(coin, monthlyRate);
        }
      });
      console.log('30day rates calculated:', hyperliquidRates.size);
    } else if (timeframe === "1year") {
      // For 1 year, multiply hourly rate by 24*365 = 8760 to show yearly total
      metaData.assetCtxs.forEach((ctx, index) => {
        const coin = metaData.universe[index]?.name;
        if (coin && ctx.funding) {
          const yearlyRate = parseFloat(ctx.funding) * 8760;
          hyperliquidRates.set(coin, yearlyRate);
        }
      });
      console.log('1year rates calculated:', hyperliquidRates.size);
    } else {
      // Default to current hourly rate
      metaData.assetCtxs.forEach((ctx, index) => {
        const coin = metaData.universe[index]?.name;
        if (coin && ctx.funding) {
          hyperliquidRates.set(coin, parseFloat(ctx.funding));
        }
      });
    }

    const predictedFundings = await getPredictedFundings();
    const predictedMap = new Map(
      predictedFundings.map((p) => [p.coin, parseFloat(p.fundingRate)])
    );

    const fundingRates: FundingRate[] = [];

    hyperliquidRates.forEach((rate, symbol) => {
      fundingRates.push({
        symbol,
        exchanges: {
          hyperliquid: rate,
        },
      });
    });

    console.log('Total funding rates created:', fundingRates.length);
    console.log('Sample rates:', fundingRates.slice(0, 3));

    fundingRates.sort((a, b) => {
      const order = ["BTC", "ETH", "SOL", "XRP", "DOGE", "BNB"];
      const aIndex = order.indexOf(a.symbol);
      const bIndex = order.indexOf(b.symbol);
      
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      return a.symbol.localeCompare(b.symbol);
    });

    console.log('Returning funding rates:', fundingRates.length);
    return fundingRates;
  } catch (error) {
    console.error("Error fetching funding rates:", error);
    throw error;
  }
}
