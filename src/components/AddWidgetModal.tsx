"use client";

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
import { useWidgetStore, WidgetType } from "@/store/widgetStore";
import {
  Table,
  BarChart3,
  LineChart,
  X,
  Newspaper,
  Plus,
  Trash2,
} from "lucide-react";
import { apiService } from "@/lib/api/apiService";
import { StockSearchDropdown } from "./StockSearchDropdown";

interface AddWidgetModalProps {
  open: boolean;
  onClose: () => void;
}

export function AddWidgetModal({ open, onClose }: AddWidgetModalProps) {
  const { addWidget, widgets } = useWidgetStore();
  const [step, setStep] = useState(1);
  const [widgetType, setWidgetType] = useState<WidgetType>("table");
  const [title, setTitle] = useState("");
  const [config, setConfig] = useState<any>({
    refreshInterval: 60,
  });
  const [availableApis, setAvailableApis] = useState<any[]>([]);

  // For table widget - multiple stock selection
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>([]);

  // For chart widget - single stock selection
  const [selectedSymbol, setSelectedSymbol] = useState<string>("");

  useEffect(() => {
    if (open) {
      // Load available APIs
      const apis = apiService.getApiConfigs();
      setAvailableApis(apis);

      // Set default API provider if available
      if (apis.length > 0 && !config.apiProvider) {
        setConfig((prev: any) => ({
          ...prev,
          apiProvider: apis[0].provider,
        }));
      }
    }
  }, [open]);

  const handleReset = () => {
    setStep(1);
    setWidgetType("table");
    setTitle("");
    setSelectedSymbols([]);
    setSelectedSymbol("");
    const apis = apiService.getApiConfigs();
    setConfig({
      apiProvider: apis.length > 0 ? apis[0].provider : undefined,
      refreshInterval: 60,
    });
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleCreate = () => {
    // Check if API is configured
    if (availableApis.length === 0) {
      alert(
        "Please configure at least one API provider before adding widgets. Click 'API Keys' in the navbar."
      );
      return;
    }

    // Validate stock selections
    if (widgetType === "table" && selectedSymbols.length === 0) {
      alert("Please select at least one stock for the table widget");
      return;
    }

    if (widgetType === "chart" && !selectedSymbol) {
      alert("Please select a stock for the chart widget");
      return;
    }

    // Calculate position for new widget
    const position = {
      x: (widgets.length * 3) % 12,
      y: Math.floor(widgets.length / 4) * 3,
    };

    // Default sizes based on widget type
    const size =
      widgetType === "table"
        ? { w: 12, h: 4 }
        : widgetType === "chart"
        ? { w: 6, h: 3 }
        : widgetType === "news"
        ? { w: 6, h: 4 }
        : { w: 4, h: 3 };

    // Add symbols to config
    const finalConfig = { ...config };

    if (widgetType === "table") {
      finalConfig.symbols = selectedSymbols;
    }

    if (widgetType === "chart") {
      finalConfig.symbol = selectedSymbol;
    }

    addWidget({
      type: widgetType,
      title: title || getDefaultTitle(widgetType),
      position,
      size,
      config: finalConfig,
    });

    handleClose();
  };

  const getDefaultTitle = (type: WidgetType) => {
    switch (type) {
      case "table":
        return "Stock Table";
      case "card":
        return "Market Cards";
      case "chart":
        return "Stock Chart";
      case "news":
        return "News Feed";
      default:
        return "Widget";
    }
  };

  const updateConfig = (key: string, value: any) => {
    setConfig((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleAddSymbol = (symbol: string) => {
    if (symbol && !selectedSymbols.includes(symbol)) {
      setSelectedSymbols([...selectedSymbols, symbol]);
    }
  };

  const handleRemoveSymbol = (symbol: string) => {
    setSelectedSymbols(selectedSymbols.filter((s) => s !== symbol));
  };

  const widgetTypes = [
    {
      type: "table" as WidgetType,
      icon: Table,
      title: "Stock Table",
      description: "Paginated table with filters and search",
    },
    {
      type: "card" as WidgetType,
      icon: BarChart3,
      title: "Finance Cards",
      description: "Watchlist, gainers, or performance cards",
    },
    {
      type: "chart" as WidgetType,
      icon: LineChart,
      title: "Stock Chart",
      description: "Line or candlestick charts",
    },
    {
      type: "news" as WidgetType,
      icon: Newspaper,
      title: "News Feed",
      description: "Latest financial news and market updates",
    },
  ];

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-3xl max-h-[85vh] overflow-hidden m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-800">
          <div>
            <h2 className="text-xl font-semibold">
              {step === 1 ? "Select Widget Type" : "Configure Widget"}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {step === 1
                ? "Choose the type of widget you want to add to your dashboard"
                : "Customize your widget settings"}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-200px)]">
          {step === 1 ? (
            /* Step 1: Select Widget Type */
            <>
              {availableApis.length === 0 && (
                <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    ⚠️ No APIs configured. Click "API Keys" in the navbar to add
                    your API keys before creating widgets.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {widgetTypes.map((wt) => (
                  <button
                    key={wt.type}
                    onClick={() => {
                      if (availableApis.length === 0 && wt.type !== "news") {
                        alert(
                          "Please configure at least one API provider first. Click 'API Keys' in the navbar."
                        );
                        return;
                      }
                      setWidgetType(wt.type);
                      setStep(2);
                    }}
                    className={`p-6 border-2 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950 transition-all text-left ${
                      widgetType === wt.type
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                        : "border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    <wt.icon className="h-8 w-8 mb-3 text-blue-600" />
                    <h3 className="font-semibold mb-1">{wt.title}</h3>
                    <p className="text-sm text-gray-500">{wt.description}</p>
                  </button>
                ))}
              </div>
            </>
          ) : (
            /* Step 2: Configure Widget */
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Widget Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={getDefaultTitle(widgetType)}
                />
              </div>

              {availableApis.length > 0 && widgetType !== "news" && (
                <div className="space-y-2">
                  <Label htmlFor="apiProvider">API Provider</Label>
                  <Select
                    value={config.apiProvider || availableApis[0]?.provider}
                    onValueChange={(value) =>
                      updateConfig("apiProvider", value)
                    }
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
              )}

              <div className="space-y-2">
                <Label htmlFor="refreshInterval">Auto Refresh</Label>
                <Select
                  value={config.refreshInterval?.toString()}
                  onValueChange={(value) =>
                    updateConfig("refreshInterval", parseInt(value))
                  }
                >
                  <SelectTrigger id="refreshInterval">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">Every 30 seconds</SelectItem>
                    <SelectItem value="60">Every 1 minute</SelectItem>
                    <SelectItem value="300">Every 5 minutes</SelectItem>
                    <SelectItem value="600">Every 10 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Widget-specific config */}
              {widgetType === "table" && (
                <>
                  <div className="space-y-2">
                    <Label>Select Stocks to Track</Label>
                    <StockSearchDropdown
                      onSelect={handleAddSymbol}
                      placeholder="Search and add stocks..."
                    />

                    {/* Selected Symbols */}
                    {selectedSymbols.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <Label className="text-sm text-gray-600 dark:text-gray-400">
                          Selected Stocks ({selectedSymbols.length})
                        </Label>
                        <div className="flex flex-wrap gap-2">
                          {selectedSymbols.map((symbol) => (
                            <div
                              key={symbol}
                              className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm"
                            >
                              <span className="font-medium">{symbol}</span>
                              <button
                                onClick={() => handleRemoveSymbol(symbol)}
                                className="hover:text-blue-900 dark:hover:text-blue-100"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pageSize">Items per page</Label>
                    <Select
                      defaultValue="10"
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

              {widgetType === "card" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="cardType">Card Type</Label>
                    <Select
                      defaultValue="watchlist"
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
                        <SelectItem value="financial">
                          Financial Data
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="limit">Number of items</Label>
                    <Select
                      defaultValue="5"
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

              {widgetType === "chart" && (
                <>
                  <div className="space-y-2">
                    <Label>Select Stock</Label>
                    <StockSearchDropdown
                      selectedSymbol={selectedSymbol}
                      onSelect={(symbol: string) => setSelectedSymbol(symbol)}
                      placeholder="Search for a stock..."
                    />
                    {selectedSymbol && (
                      <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                        <span className="text-sm text-blue-700 dark:text-blue-300">
                          Selected: <strong>{selectedSymbol}</strong>
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="chartType">Chart Type</Label>
                    <Select
                      defaultValue="line"
                      onValueChange={(value) =>
                        updateConfig("chartType", value)
                      }
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
                      defaultValue="1D"
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

              {widgetType === "news" && (
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
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t dark:border-gray-800">
          {step === 2 && (
            <Button variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
          )}
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          {step === 2 && <Button onClick={handleCreate}>Create Widget</Button>}
        </div>
      </div>
    </div>
  );
}
