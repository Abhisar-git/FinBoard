"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import axios from "axios";
import { apiService } from "@/lib/api/apiService";

interface StockSearchDropdownProps {
  onSelect: (symbol: string) => void;
  placeholder?: string;
  selectedSymbol?: string;
}

interface StockSearchResult {
  symbol: string;
  name: string;
  type: string;
  region: string;
  currency: string;
}

export function StockSearchDropdown({
  onSelect,
  placeholder = "Search stocks...",
  selectedSymbol,
}: StockSearchDropdownProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<StockSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length < 1) {
      setResults([]);
      return;
    }

    const delayDebounce = setTimeout(() => {
      searchStocks(query);
    }, 500); // Debounce 500ms

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const searchStocks = async (searchQuery: string) => {
    setLoading(true);
    try {
      const config = apiService.getApiConfig("alphavantage");
      
      if (!config) {
        console.warn("Alpha Vantage not configured");
        setResults(getMockResults(searchQuery));
        setLoading(false);
        return;
      }

      const response = await axios.get(config.baseUrl!, {
        params: {
          function: "SYMBOL_SEARCH",
          keywords: searchQuery,
          apikey: config.apiKey,
        },
      });

      const matches = response.data.bestMatches || [];
      const stockResults: StockSearchResult[] = matches.map((match: any) => ({
        symbol: match["1. symbol"],
        name: match["2. name"],
        type: match["3. type"],
        region: match["4. region"],
        currency: match["8. currency"],
      }));

      setResults(stockResults);
      setIsOpen(true);
    } catch (error) {
      console.error("Stock search error:", error);
      setResults(getMockResults(searchQuery));
    } finally {
      setLoading(false);
    }
  };

  const getMockResults = (searchQuery: string): StockSearchResult[] => {
    const allStocks = [
      { symbol: "AAPL", name: "Apple Inc.", type: "Equity", region: "United States", currency: "USD" },
      { symbol: "GOOGL", name: "Alphabet Inc.", type: "Equity", region: "United States", currency: "USD" },
      { symbol: "MSFT", name: "Microsoft Corporation", type: "Equity", region: "United States", currency: "USD" },
      { symbol: "AMZN", name: "Amazon.com Inc.", type: "Equity", region: "United States", currency: "USD" },
      { symbol: "TSLA", name: "Tesla Inc.", type: "Equity", region: "United States", currency: "USD" },
      { symbol: "NVDA", name: "NVIDIA Corporation", type: "Equity", region: "United States", currency: "USD" },
      { symbol: "META", name: "Meta Platforms Inc.", type: "Equity", region: "United States", currency: "USD" },
      { symbol: "NFLX", name: "Netflix Inc.", type: "Equity", region: "United States", currency: "USD" },
      { symbol: "AMD", name: "Advanced Micro Devices", type: "Equity", region: "United States", currency: "USD" },
      { symbol: "INTC", name: "Intel Corporation", type: "Equity", region: "United States", currency: "USD" },
    ];

    return allStocks.filter(
      (stock) =>
        stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stock.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const handleSelect = (symbol: string) => {
    onSelect(symbol);
    setQuery(symbol);
    setIsOpen(false);
    setResults([]);
  };

  return (
    <div ref={dropdownRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          value={selectedSymbol || query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => query && setIsOpen(true)}
          placeholder={placeholder}
          className="pl-9 pr-10"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-auto">
          {results.map((stock) => (
            <button
              key={stock.symbol}
              onClick={() => handleSelect(stock.symbol)}
              className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border-b dark:border-gray-700 last:border-0"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">{stock.symbol}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {stock.name}
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  {stock.currency}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {isOpen && query && results.length === 0 && !loading && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-lg p-4 text-center text-sm text-gray-500">
          No stocks found
        </div>
      )}
    </div>
  );
}