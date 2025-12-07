"use client";

import { Widget, useWidgetStore } from "@/store/widgetStore";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";
import { apiService } from "@/lib/api/apiService";

interface ConfigModalProps {
  widget: Widget;
  open: boolean;
  onClose: () => void;
}

export function ConfigModal({ widget, open, onClose }: ConfigModalProps) {
  const { updateWidget } = useWidgetStore();
  const [title, setTitle] = useState(widget.title);
  const [config, setConfig] = useState(widget.config);
  const [availableApis, setAvailableApis] = useState<any[]>([]);

  useEffect(() => {
    if (open) {
      setTitle(widget.title);
      setConfig(widget.config);
      // Load available APIs
      const apis = apiService.getApiConfigs();
      setAvailableApis(apis);

      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open, widget.title, widget.config]);

  const handleSave = () => {
    updateWidget(widget.id, {
      title,
      config,
    });
    onClose();
  };

  const updateConfig = (key: string, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-800">
          <div>
            <h2 className="text-xl font-semibold">Configure Widget</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Customize your widget settings and data sources
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-180px)]">
          <div className="space-y-6">
            {/* Widget Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Widget Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter widget title"
              />
            </div>

            {/* API Provider - Only show if APIs are configured */}
            {availableApis.length > 0 ? (
              <div className="space-y-2">
                <Label htmlFor="apiProvider">API Provider</Label>
                <Select
                  value={config.apiProvider || availableApis[0]?.provider}
                  onValueChange={(value) => updateConfig("apiProvider", value)}
                >
                  <SelectTrigger id="apiProvider">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableApis.map((api) => (
                      <SelectItem key={api.provider} value={api.provider}>
                        {api.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  ⚠️ No APIs configured. Click "API Keys" in the navbar to add
                  your API keys.
                </p>
              </div>
            )}

            {/* Refresh Interval */}
            <div className="space-y-2">
              <Label htmlFor="refreshInterval">Refresh Interval</Label>
              <Select
                value={config.refreshInterval?.toString() || "60"}
                onValueChange={(value) =>
                  updateConfig("refreshInterval", parseInt(value))
                }
              >
                <SelectTrigger id="refreshInterval">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 seconds</SelectItem>
                  <SelectItem value="60">1 minute</SelectItem>
                  <SelectItem value="300">5 minutes</SelectItem>
                  <SelectItem value="600">10 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Widget Type Specific Config */}
            {widget.type === "table" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="symbols">
                    Stock Symbols (comma-separated)
                  </Label>
                  <Input
                    id="symbols"
                    value={config.symbols?.join(", ") || ""}
                    onChange={(e) =>
                      updateConfig(
                        "symbols",
                        e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean)
                      )
                    }
                    placeholder="AAPL, GOOGL, MSFT"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pageSize">Items per page</Label>
                  <Select
                    value={config.pageSize?.toString() || "10"}
                    onValueChange={(value) =>
                      updateConfig("pageSize", parseInt(value))
                    }
                  >
                    <SelectTrigger id="pageSize">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {widget.type === "card" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="cardType">Card Type</Label>
                  <Select
                    value={config.cardType || "watchlist"}
                    onValueChange={(value) => updateConfig("cardType", value)}
                  >
                    <SelectTrigger id="cardType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="watchlist">Watchlist</SelectItem>
                      <SelectItem value="gainers">Market Gainers</SelectItem>
                      <SelectItem value="performance">
                        Performance Data
                      </SelectItem>
                      <SelectItem value="financial">Financial Data</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="limit">Number of items to show</Label>
                  <Select
                    value={config.limit?.toString() || "5"}
                    onValueChange={(value) =>
                      updateConfig("limit", parseInt(value))
                    }
                  >
                    <SelectTrigger id="limit">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="15">15</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {widget.type === "chart" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="symbol">Stock Symbol</Label>
                  <Input
                    id="symbol"
                    value={config.symbol || ""}
                    onChange={(e) =>
                      updateConfig("symbol", e.target.value.toUpperCase())
                    }
                    placeholder="AAPL"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="chartType">Chart Type</Label>
                  <Select
                    value={config.chartType || "line"}
                    onValueChange={(value) => updateConfig("chartType", value)}
                  >
                    <SelectTrigger id="chartType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="line">Line Chart</SelectItem>
                      <SelectItem value="candlestick">Candlestick</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="interval">Time Interval</Label>
                  <Select
                    value={config.interval || "1D"}
                    onValueChange={(value) => updateConfig("interval", value)}
                  >
                    <SelectTrigger id="interval">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1D">Daily</SelectItem>
                      <SelectItem value="1W">Weekly</SelectItem>
                      <SelectItem value="1M">Monthly</SelectItem>
                      <SelectItem value="3M">3 Months</SelectItem>
                      <SelectItem value="1Y">1 Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            {widget.type === "news" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="newsCategory">News Category</Label>
                  <Select
                    defaultValue="business"
                    onValueChange={(value) =>
                      updateConfig("newsCategory", value)
                    }
                  >
                    <SelectTrigger id="newsCategory">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="business">
                        Business & Finance
                      </SelectItem>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="entertainment">
                        Entertainment
                      </SelectItem>
                      <SelectItem value="sports">Sports</SelectItem>
                      <SelectItem value="world">World News</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="limit">Number of articles</Label>
                  <Select
                    defaultValue="10"
                    onValueChange={(value) =>
                      updateConfig("limit", parseInt(value))
                    }
                  >
                    <SelectTrigger id="limit">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="15">15</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t dark:border-gray-800">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </div>
    </div>
  );
}
