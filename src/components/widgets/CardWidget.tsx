"use client";

import { Widget, useWidgetStore } from "@/store/widgetStore";
import { useEffect, useState } from "react";
import { apiService } from "@/lib/api/apiService";
import { TrendingUp, TrendingDown, Star, BarChart3, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CardWidgetProps {
  widget: Widget;
  isRefreshing: boolean;
}

interface CardItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

export function CardWidget({ widget, isRefreshing }: CardWidgetProps) {
  const { updateWidgetData } = useWidgetStore();
  const [data, setData] = useState<CardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cardType = widget.config.cardType || "watchlist";
  const limit = widget.config.limit || 5;
  const apiProvider = widget.config.apiProvider || "alphavantage";

  useEffect(() => {
    fetchData();
  }, [widget.id, isRefreshing]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      let items: CardItem[] = [];

      switch (cardType) {
        case "watchlist":
          items = await fetchWatchlist();
          break;
        case "gainers":
          items = await fetchGainers();
          break;
        case "performance":
          items = await fetchPerformance();
          break;
        case "financial":
          items = await fetchFinancial();
          break;
      }

      setData(items.slice(0, limit));
      updateWidgetData(widget.id, items);
    } catch (err) {
      console.error("Error fetching card data:", err);
      setError("Failed to fetch data. Check your API configuration.");
    } finally {
      setLoading(false);
    }
  };

  const fetchWatchlist = async (): Promise<CardItem[]> => {
    const watchlistSymbols = widget.config.symbols || ["AAPL", "GOOGL", "MSFT", "AMZN", "NVDA"];
    const quotes = await apiService.fetchMultipleQuotes(watchlistSymbols, apiProvider);
    return quotes;
  };

  const fetchGainers = async (): Promise<CardItem[]> => {
    const gainers = await apiService.fetchMarketGainers(apiProvider, limit);
    return gainers;
  };

  const fetchPerformance = async (): Promise<CardItem[]> => {
    // Fetch specific symbols for performance tracking
    const symbols = widget.config.symbols || ["AAPL", "TSLA", "NVDA", "AMD", "INTC"];
    const quotes = await apiService.fetchMultipleQuotes(symbols, apiProvider);
    return quotes;
  };

  const fetchFinancial = async (): Promise<CardItem[]> => {
    // Fetch financial sector stocks
    const financialSymbols = ["JPM", "BAC", "WFC", "GS", "MS"];
    const quotes = await apiService.fetchMultipleQuotes(financialSymbols, apiProvider);
    return quotes;
  };

  const getCardIcon = () => {
    switch (cardType) {
      case "watchlist":
        return <Star className="h-5 w-5" />;
      case "gainers":
        return <TrendingUp className="h-5 w-5 text-green-600" />;
      case "performance":
        return <BarChart3 className="h-5 w-5" />;
      case "financial":
        return <TrendingDown className="h-5 w-5" />;
      default:
        return <Star className="h-5 w-5" />;
    }
  };

  const getCardTitle = () => {
    switch (cardType) {
      case "watchlist":
        return "My Watchlist";
      case "gainers":
        return "Top Gainers";
      case "performance":
        return "Performance";
      case "financial":
        return "Financial Sector";
      default:
        return "Cards";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <p className="text-red-600 mb-2">{error}</p>
        <Button onClick={fetchData} size="sm">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2 pb-2 border-b">
        {getCardIcon()}
        <h3 className="font-semibold text-sm">{getCardTitle()}</h3>
      </div>

      {/* Card Items */}
      <div className="space-y-2">
        {data.map((item, index) => (
          <div
            key={`${item.symbol}-${index}`}
            className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
          >
            <div className="flex-1">
              <div className="font-medium text-sm">{item.symbol}</div>
              <div className="text-xs text-gray-500">{item.name}</div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-sm">${item.price.toFixed(2)}</div>
              <div
                className={`text-xs ${
                  item.change >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {item.change >= 0 ? "+" : ""}
                {item.changePercent.toFixed(2)}%
              </div>
            </div>
          </div>
        ))}
      </div>

      {data.length === 0 && (
        <div className="text-center py-8 text-gray-500">No data available</div>
      )}
    </div>
  );
}