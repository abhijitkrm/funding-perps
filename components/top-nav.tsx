"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface TopNavProps {
  onSearch: (query: string) => void;
}

export function TopNav({ onSearch }: TopNavProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };
  
  return (
    <div className="border-b bg-card">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <Image 
                src="/fundingperpslogo.png" 
                alt="fundingperps logo" 
                width={32} 
                height={32}
                className="h-8 w-8"
              />
              <span className="text-xl font-bold">fundingperps</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-6 text-sm">
              <Link 
                href="/" 
                className={`font-semibold transition-colors ${
                  pathname === '/' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Funding Rates
              </Link>
              <Link 
                href="/arbitrage" 
                className={`font-semibold transition-colors ${
                  pathname === '/arbitrage' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Perps ↔ Spot Arb
              </Link>
              <Link 
                href="/perp-arbitrage" 
                className={`font-semibold transition-colors ${
                  pathname === '/perp-arbitrage' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Perp ↔ Perp Arb
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder="Search" 
                className="pl-9 w-64"
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearch(e.target.value)}
              />
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </div>
  );
}
