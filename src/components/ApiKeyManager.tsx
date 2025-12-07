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
import { apiService, ApiConfig, ApiProvider } from "@/lib/api/apiService";
import { Plus, Trash2, Check, X, Key, ExternalLink } from "lucide-react";

interface ApiKeyManagerProps {
  open: boolean;
  onClose: () => void;
}

export function ApiKeyManager({ open, onClose }: ApiKeyManagerProps) {
  const [configs, setConfigs] = useState<ApiConfig[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newConfig, setNewConfig] = useState<Partial<ApiConfig>>({
    provider: "custom",
    apiKey: "",
    baseUrl: "",
    name: "",
  });
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (open) {
      loadConfigs();
    }
  }, [open]);

  const loadConfigs = () => {
    apiService.loadConfigsFromStorage();
    setConfigs(apiService.getApiConfigs());
  };

  const handleAddConfig = () => {
    if (!newConfig.apiKey || !newConfig.provider) {
      alert("Please fill in all required fields");
      return;
    }

    if (newConfig.provider === "custom" && (!newConfig.baseUrl || !newConfig.name)) {
      alert("Custom APIs require a name and base URL");
      return;
    }

    const config: ApiConfig = {
      provider: newConfig.provider as ApiProvider,
      apiKey: newConfig.apiKey,
      baseUrl: newConfig.baseUrl || getDefaultBaseUrl(newConfig.provider as ApiProvider),
      name: newConfig.name || getProviderName(newConfig.provider as ApiProvider),
    };

    apiService.addApiConfig(config);
    loadConfigs();
    setIsAdding(false);
    setNewConfig({
      provider: "custom",
      apiKey: "",
      baseUrl: "",
      name: "",
    });
  };

  const handleRemoveConfig = (provider: string) => {
    if (confirm(`Remove ${provider} API configuration?`)) {
      apiService.removeApiConfig(provider);
      loadConfigs();
    }
  };

  const handleTestConnection = async (provider: string) => {
    setTestingProvider(provider);
    const success = await apiService.testConnection(provider);
    setTestResults((prev) => ({ ...prev, [provider]: success }));
    setTestingProvider(null);
    setTimeout(() => {
      setTestResults((prev) => {
        const updated = { ...prev };
        delete updated[provider];
        return updated;
      });
    }, 3000);
  };

  const getDefaultBaseUrl = (provider: ApiProvider): string => {
    switch (provider) {
      case "alphavantage":
        return "https://www.alphavantage.co/query";
      case "finnhub":
        return "https://finnhub.io/api/v1";
      case "yahoo":
        return "https://query1.finance.yahoo.com/v8/finance";
      case "newsdata":
        return "https://newsdata.io/api/1";
      default:
        return "";
    }
  };

  const getProviderName = (provider: ApiProvider): string => {
    switch (provider) {
      case "alphavantage":
        return "Alpha Vantage";
      case "finnhub":
        return "Finnhub";
      case "yahoo":
        return "Yahoo Finance";
      case "newsdata":
        return "NewsData.io";
      default:
        return "Custom API";
    }
  };

  const getProviderDocs = (provider: ApiProvider): string => {
    switch (provider) {
      case "alphavantage":
        return "https://www.alphavantage.co/documentation/";
      case "finnhub":
        return "https://finnhub.io/docs/api";
      case "yahoo":
        return "https://finance.yahoo.com";
      case "newsdata":
        return "https://newsdata.io/documentation";
      default:
        return "";
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-3xl max-h-[85vh] overflow-hidden m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Key className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">API Key Management</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Configure your financial data providers
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-180px)]">
          {/* Existing Configs */}
          <div className="space-y-4 mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Connected APIs
            </h3>

            {configs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No APIs configured yet. Add your first API below.
              </div>
            ) : (
              <div className="space-y-3">
                {configs.map((config) => (
                  <div
                    key={config.provider}
                    className="flex items-center justify-between p-4 border dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {config.name}
                        </h4>
                        {testResults[config.provider] !== undefined && (
                          <span
                            className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${
                              testResults[config.provider]
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            }`}
                          >
                            {testResults[config.provider] ? (
                              <>
                                <Check className="w-3 h-3" /> Connected
                              </>
                            ) : (
                              <>
                                <X className="w-3 h-3" /> Failed
                              </>
                            )}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {config.baseUrl}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        API Key: {config.apiKey.substring(0, 8)}...
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleTestConnection(config.provider)}
                        disabled={testingProvider === config.provider}
                      >
                        {testingProvider === config.provider
                          ? "Testing..."
                          : "Test"}
                      </Button>
                      {getProviderDocs(config.provider as ApiProvider) && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            window.open(
                              getProviderDocs(config.provider as ApiProvider),
                              "_blank"
                            )
                          }
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveConfig(config.provider)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add New Config */}
          {!isAdding ? (
            <Button onClick={() => setIsAdding(true)} variant="outline" className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add New API
            </Button>
          ) : (
            <div className="border dark:border-gray-700 rounded-lg p-4 space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Add New API Configuration
              </h3>

              <div className="space-y-4">
                {/* Provider Selection */}
                <div className="space-y-2">
                  <Label htmlFor="provider">API Provider</Label>
                  <Select
                    value={newConfig.provider}
                    onValueChange={(value) =>
                      setNewConfig((prev) => ({ ...prev, provider: value as ApiProvider }))
                    }
                  >
                    <SelectTrigger id="provider">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alphavantage">Alpha Vantage</SelectItem>
                      <SelectItem value="finnhub">Finnhub</SelectItem>
                      <SelectItem value="yahoo">Yahoo Finance</SelectItem>
                      <SelectItem value="newsdata">NewsData.io</SelectItem>
                      <SelectItem value="custom">Custom API</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Custom API Fields */}
                {newConfig.provider === "custom" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="name">API Name</Label>
                      <Input
                        id="name"
                        value={newConfig.name || ""}
                        onChange={(e) =>
                          setNewConfig((prev) => ({ ...prev, name: e.target.value }))
                        }
                        placeholder="My Custom Finance API"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="baseUrl">Base URL</Label>
                      <Input
                        id="baseUrl"
                        value={newConfig.baseUrl || ""}
                        onChange={(e) =>
                          setNewConfig((prev) => ({ ...prev, baseUrl: e.target.value }))
                        }
                        placeholder="https://api.example.com"
                      />
                    </div>
                  </>
                )}

                {/* API Key */}
                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    value={newConfig.apiKey || ""}
                    onChange={(e) =>
                      setNewConfig((prev) => ({ ...prev, apiKey: e.target.value }))
                    }
                    placeholder="Enter your API key"
                  />
                  <p className="text-xs text-gray-500">
                    Your API key is stored locally and never sent to our servers
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleAddConfig} className="flex-1">
                  Add API
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAdding(false);
                    setNewConfig({
                      provider: "custom",
                      apiKey: "",
                      baseUrl: "",
                      name: "",
                    });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Help Section */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
              Need API Keys?
            </h4>
            <div className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
              <p>• Alpha Vantage: <a href="https://www.alphavantage.co/support/#api-key" target="_blank" className="underline">Get free API key</a></p>
              <p>• Finnhub: <a href="https://finnhub.io/register" target="_blank" className="underline">Sign up for free</a></p>
              <p>• NewsData: <a href="https://newsdata.io/register" target="_blank" className="underline">Create account</a></p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t dark:border-gray-800">
          <Button onClick={onClose}>Done</Button>
        </div>
      </div>
    </div>
  );
}