"use client";

import { Widget, useWidgetStore } from "@/store/widgetStore";
import { useEffect, useState } from "react";
import { apiService } from "@/lib/api/apiService";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface ChartWidgetProps {
  widget: Widget;
  isRefreshing: boolean;
}

interface ChartDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export function ChartWidget({ widget, isRefreshing }: ChartWidgetProps) {
  const { updateWidgetData } = useWidgetStore();
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const chartType = widget.config.chartType || "line";
  const symbol = widget.config.symbol || "AAPL";
  const interval = widget.config.interval || "1D";
  const apiProvider = widget.config.apiProvider || "alphavantage";

  useEffect(() => {
    fetchData();
  }, [widget.id, isRefreshing, symbol, interval]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Use real API service
      const chartData = await apiService.fetchChartData(symbol, interval, apiProvider);
      setData(chartData);
      updateWidgetData(widget.id, chartData);
    } catch (err) {
      console.error("Error fetching chart data:", err);
      setError("Failed to fetch chart data. Check your API configuration.");
    } finally {
      setLoading(false);
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

  // Find min and max for chart scaling
  const prices = data.map((d) => d.close);
  const minPrice = Math.min(...prices) - 5;
  const maxPrice = Math.max(...prices) + 5;

  return (
    <div className="h-full flex flex-col">
      {/* Chart Info */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-lg font-bold">{symbol}</div>
          <div className="text-sm text-gray-500">{interval} Chart</div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">
            ${data[data.length - 1]?.close.toFixed(2) || "0.00"}
          </div>
          <div
            className={`text-sm ${
              data[data.length - 1]?.close >= data[0]?.close
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {data.length > 0 &&
              (
                ((data[data.length - 1].close - data[0].close) /
                  data[0].close) *
                100
              ).toFixed(2)}
            %
          </div>
        </div>
      </div>

      {/* Chart - Using Canvas */}
      <div className="flex-1 relative border rounded-lg bg-white dark:bg-gray-950 p-4">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 800 400"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          {/* Grid lines */}
          <line
            x1="0"
            y1="100"
            x2="800"
            y2="100"
            stroke="#e5e7eb"
            strokeDasharray="5,5"
          />
          <line
            x1="0"
            y1="200"
            x2="800"
            y2="200"
            stroke="#e5e7eb"
            strokeDasharray="5,5"
          />
          <line
            x1="0"
            y1="300"
            x2="800"
            y2="300"
            stroke="#e5e7eb"
            strokeDasharray="5,5"
          />

          {/* Chart Line */}
          {chartType === "line" ? (
            <>
              {/* Area fill */}
              <defs>
                <linearGradient
                  id={`gradient-${widget.id}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d={data
                  .map((point, i) => {
                    const x = (i / (data.length - 1)) * 800;
                    const y =
                      400 -
                      ((point.close - minPrice) / (maxPrice - minPrice)) * 400;
                    return `${i === 0 ? "M" : "L"} ${x} ${y}`;
                  })
                  .join(" ") + ` L 800 400 L 0 400 Z`}
                fill={`url(#gradient-${widget.id})`}
              />
              <polyline
                points={data
                  .map((point, i) => {
                    const x = (i / (data.length - 1)) * 800;
                    const y =
                      400 -
                      ((point.close - minPrice) / (maxPrice - minPrice)) * 400;
                    return `${x},${y}`;
                  })
                  .join(" ")}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
              />
            </>
          ) : (
            <>
              {/* Candlestick chart */}
              {data.map((point, i) => {
                const x = (i / (data.length - 1)) * 800;
                const yHigh =
                  400 - ((point.high - minPrice) / (maxPrice - minPrice)) * 400;
                const yLow =
                  400 - ((point.low - minPrice) / (maxPrice - minPrice)) * 400;
                const yOpen =
                  400 - ((point.open - minPrice) / (maxPrice - minPrice)) * 400;
                const yClose =
                  400 -
                  ((point.close - minPrice) / (maxPrice - minPrice)) * 400;
                const isGreen = point.close >= point.open;

                return (
                  <g key={i}>
                    {/* Wick */}
                    <line
                      x1={x}
                      y1={yHigh}
                      x2={x}
                      y2={yLow}
                      stroke={isGreen ? "#10b981" : "#ef4444"}
                      strokeWidth="1"
                    />
                    {/* Body */}
                    <rect
                      x={x - 3}
                      y={Math.min(yOpen, yClose)}
                      width="6"
                      height={Math.abs(yClose - yOpen) || 1}
                      fill={isGreen ? "#10b981" : "#ef4444"}
                    />
                  </g>
                );
              })}
            </>
          )}
        </svg>

        {/* Price labels */}
        <div className="absolute top-2 left-2 text-xs text-gray-500">
          ${maxPrice.toFixed(2)}
        </div>
        <div className="absolute bottom-2 left-2 text-xs text-gray-500">
          ${minPrice.toFixed(2)}
        </div>
      </div>
    </div>
  );
}