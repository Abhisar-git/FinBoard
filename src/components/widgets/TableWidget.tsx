"use client";

import { Widget, useWidgetStore } from "@/store/widgetStore";
import { useEffect, useState } from "react";
import { apiService } from "@/lib/api/apiService";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Search, Loader2 } from "lucide-react";

interface TableWidgetProps {
  widget: Widget;
  isRefreshing: boolean;
}

interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
}

export function TableWidget({ widget, isRefreshing }: TableWidgetProps) {
  const { updateWidgetData } = useWidgetStore();
  const [data, setData] = useState<StockData[]>([]);
  const [filteredData, setFilteredData] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = widget.config.pageSize || 10;
  const symbols = widget.config.symbols || ["AAPL", "GOOGL", "MSFT", "AMZN", "TSLA"];
  const apiProvider = widget.config.apiProvider || "alphavantage";

  useEffect(() => {
    fetchData();
  }, [widget.id, isRefreshing]);

  useEffect(() => {
    // Filter data based on search term
    if (searchTerm) {
      const filtered = data.filter(
        (item) =>
          item.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(data);
    }
    setCurrentPage(1);
  }, [searchTerm, data]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Use real API service
      const quotes = await apiService.fetchMultipleQuotes(symbols, apiProvider);
      setData(quotes);
      setFilteredData(quotes);
      updateWidgetData(widget.id, quotes);
    } catch (err) {
      console.error("Error fetching table data:", err);
      setError("Failed to fetch stock data. Check your API configuration.");
    } finally {
      setLoading(false);
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentData = filteredData.slice(startIndex, endIndex);

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
    <div className="flex flex-col h-full space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search symbols or names..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Symbol</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Change</TableHead>
              <TableHead>Change %</TableHead>
              <TableHead className="text-right">Volume</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-gray-500">
                  No stocks found
                </TableCell>
              </TableRow>
            ) : (
              currentData.map((stock) => (
                <TableRow key={stock.symbol}>
                  <TableCell className="font-medium">{stock.symbol}</TableCell>
                  <TableCell>${stock.price.toFixed(2)}</TableCell>
                  <TableCell
                    className={stock.change >= 0 ? "text-green-600" : "text-red-600"}
                  >
                    {stock.change >= 0 ? "+" : ""}
                    {stock.change.toFixed(2)}
                  </TableCell>
                  <TableCell
                    className={
                      stock.changePercent >= 0 ? "text-green-600" : "text-red-600"
                    }
                  >
                    {stock.changePercent >= 0 ? "+" : ""}
                    {stock.changePercent.toFixed(2)}%
                  </TableCell>
                  <TableCell className="text-right">
                    {stock.volume.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredData.length)} of{" "}
            {filteredData.length}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="flex items-center px-3 text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}