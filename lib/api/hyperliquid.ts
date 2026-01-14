const HYPERLIQUID_API_URL = "https://api.hyperliquid.xyz/info";

export interface HyperliquidFundingHistory {
  coin: string;
  fundingRate: string;
  premium: string;
  time: number;
}

export interface HyperliquidPredictedFunding {
  coin: string;
  fundingRate: string;
}

export interface HyperliquidAssetContext {
  coin: string;
  markPx: string;
  funding: string;
  openInterest: string;
  prevDayPx: string;
}

export interface HyperliquidMetaAndAssetCtxs {
  universe: Array<{
    name: string;
    szDecimals: number;
  }>;
  assetCtxs: HyperliquidAssetContext[];
}

export interface SpotToken {
  name: string;
  szDecimals: number;
  weiDecimals: number;
  index: number;
  tokenId: string;
  isCanonical: boolean;
}

export interface SpotPair {
  name: string;
  tokens: [number, number];
  index: number;
  isCanonical: boolean;
}

export interface SpotAssetContext {
  dayNtlVlm: string;
  markPx: string;
  midPx: string;
  prevDayPx: string;
}

export interface SpotMetaAndAssetCtxs {
  tokens: SpotToken[];
  universe: SpotPair[];
  assetCtxs: SpotAssetContext[];
}

export async function getMetaAndAssetCtxs(): Promise<HyperliquidMetaAndAssetCtxs> {
  const response = await fetch(HYPERLIQUID_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "metaAndAssetCtxs",
    }),
  });

  if (!response.ok) {
    throw new Error(`Hyperliquid API error: ${response.statusText}`);
  }

  const data = await response.json();
  
  if (!data) {
    throw new Error('Empty response from Hyperliquid API');
  }

  if (Array.isArray(data) && data.length >= 2) {
    const metaData = data[0];
    const assetCtxs = data[1];
    
    return {
      universe: metaData.universe || [],
      assetCtxs: assetCtxs || [],
    };
  }

  return data as HyperliquidMetaAndAssetCtxs;
}

export async function getFundingHistory(
  coin: string,
  startTime: number,
  endTime?: number
): Promise<HyperliquidFundingHistory[]> {
  const body: any = {
    type: "fundingHistory",
    coin,
    startTime,
  };

  if (endTime) {
    body.endTime = endTime;
  }

  const response = await fetch(HYPERLIQUID_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Hyperliquid API error: ${response.statusText}`);
  }

  return response.json();
}

export async function getPredictedFundings(): Promise<HyperliquidPredictedFunding[]> {
  const response = await fetch(HYPERLIQUID_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "predictedFundings",
    }),
  });

  if (!response.ok) {
    throw new Error(`Hyperliquid API error: ${response.statusText}`);
  }

  return response.json();
}

export async function getCurrentFundingRates(): Promise<Map<string, number>> {
  const data = await getMetaAndAssetCtxs();
  const fundingMap = new Map<string, number>();

  if (!data.assetCtxs || !Array.isArray(data.assetCtxs)) {
    console.error('Invalid assetCtxs in response:', data);
    throw new Error('Invalid response structure from Hyperliquid API');
  }

  data.assetCtxs.forEach((ctx) => {
    if (ctx && ctx.coin && ctx.funding) {
      fundingMap.set(ctx.coin, parseFloat(ctx.funding));
    }
  });

  return fundingMap;
}

export async function getHistoricalFundingRates(
  coins: string[],
  hours: number = 24
): Promise<Map<string, number>> {
  const endTime = Date.now();
  const startTime = endTime - hours * 60 * 60 * 1000;
  const fundingMap = new Map<string, number>();

  await Promise.all(
    coins.map(async (coin) => {
      try {
        const history = await getFundingHistory(coin, startTime, endTime);
        if (history.length > 0) {
          const avgFunding =
            history.reduce((sum, h) => sum + parseFloat(h.fundingRate), 0) /
            history.length;
          fundingMap.set(coin, avgFunding);
        }
      } catch (error) {
        console.error(`Error fetching funding history for ${coin}:`, error);
      }
    })
  );

  return fundingMap;
}

export async function getSpotMetaAndAssetCtxs(): Promise<SpotMetaAndAssetCtxs> {
  const response = await fetch(HYPERLIQUID_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "spotMetaAndAssetCtxs",
    }),
  });

  if (!response.ok) {
    throw new Error(`Hyperliquid Spot API error: ${response.statusText}`);
  }

  const data = await response.json();
  
  if (Array.isArray(data) && data.length >= 2) {
    const metaData = data[0];
    const assetCtxs = data[1];
    
    return {
      tokens: metaData.tokens || [],
      universe: metaData.universe || [],
      assetCtxs: assetCtxs || [],
    };
  }

  throw new Error('Invalid response structure from Hyperliquid Spot API');
}
