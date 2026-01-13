"use client";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star } from "lucide-react";

interface HeaderProps {
  onTimeframeChange: (timeframe: string) => void;
  currentTimeframe: string;
  showFavorites: boolean;
  onToggleFavorites: () => void;
}

export function Header({
  onTimeframeChange,
  currentTimeframe,
  showFavorites,
  onToggleFavorites,
}: HeaderProps) {
  return (
    <div className="border-b bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Tabs value={currentTimeframe} onValueChange={onTimeframeChange}>
            <TabsList>
              <TabsTrigger value="current">Current</TabsTrigger>
              <TabsTrigger value="1day">1 Day</TabsTrigger>
              <TabsTrigger value="7day">7 Day</TabsTrigger>
              <TabsTrigger value="30day">30 Day</TabsTrigger>
              <TabsTrigger value="1year">1 Year</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Button
            variant={showFavorites ? "default" : "outline"}
            size="sm"
            onClick={onToggleFavorites}
          >
            <Star className="h-4 w-4 mr-2" />
            Show Favorites
          </Button>
        </div>
      </div>
    </div>
  );
}
