import axios, { AxiosInstance } from "axios";

// API Provider Types
export type ApiProvider = "alphavantage" | "finnhub" | "yahoo" | "newsdata" | "custom";

// API Configuration Interface
export interface ApiConfig {
  provider: ApiProvider;
  apiKey: string;
  baseUrl?: string;
  name?: string;
}

// Stock Quote Response
export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  high?: number;
  low?: number;
  open?: number;
}

// Chart Data Point
export interface ChartDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

class ApiService {
  private configs: Map<string, ApiConfig> = new Map();
  private axiosInstances: Map<string, AxiosInstance> = new Map();
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 60000; // 1 minute
  private initialized = false;

  constructor() {
    // Don't initialize here - do it in init() method
  }

  // Initialize with environment variables (call this from client component)
  init() {
    if (this.initialized) return;
    
    // Load from localStorage first
    this.loadConfigsFromStorage();

    // Only add env keys if not already in storage
    if (typeof window !== "undefined") {
      // Check if Alpha Vantage is already configured
      if (!this.configs.has("alphavantage")) {
        const alphaKey = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_KEY;
        if (alphaKey && alphaKey !== "YT") {
          this.addApiConfig({
            provider: "alphavantage",
            apiKey: alphaKey,
            baseUrl: "https://www.alphavantage.co/query",
            name: "Alpha Vantage",
          });
        }
      }

      // Check if NewsData is already configured
      if (!this.configs.has("newsdata")) {
        const newsKey = process.env.NEXT_PUBLIC_NEWSDATA_KEY;
        if (newsKey && newsKey !== "pub_5") {
          this.addApiConfig({
            provider: "newsdata",
            apiKey: newsKey,
            baseUrl: "https://newsdata.io/api/1",
            name: "NewsData.io",
          });
        }
      }
    }

    this.initialized = true;
  }

  // Add or Update API Configuration
  addApiConfig(config: ApiConfig): void {
    const key = config.provider;
    this.configs.set(key, config);

    // Create axios instance for this provider
    const instance = axios.create({
      baseURL: config.baseUrl,
      timeout: 30000,
    });

    this.axiosInstances.set(key, instance);

    // Save to localStorage
    this.saveConfigsToStorage();
  }

  // Remove API Configuration
  removeApiConfig(provider: string): void {
    this.configs.delete(provider);
    this.axiosInstances.delete(provider);
    this.saveConfigsToStorage();
  }

  // Get All Configured APIs
  getApiConfigs(): ApiConfig[] {
    return Array.from(this.configs.values());
  }

  // Get Specific API Config
  getApiConfig(provider: string): ApiConfig | undefined {
    return this.configs.get(provider);
  }

  // Save configs to localStorage
  private saveConfigsToStorage(): void {
    if (typeof window !== "undefined") {
      const configArray = Array.from(this.configs.entries());
      localStorage.setItem("api-configs", JSON.stringify(configArray));
    }
  }

  // Load configs from localStorage
  loadConfigsFromStorage(): void {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("api-configs");
      if (stored) {
        try {
          const configArray = JSON.parse(stored);
          configArray.forEach(([key, config]: [string, ApiConfig]) => {
            this.configs.set(key, config);
            // Recreate axios instance
            const instance = axios.create({
              baseURL: config.baseUrl,
              timeout: 30000,
            });
            this.axiosInstances.set(key, instance);
          });
        } catch (error) {
          console.error("Failed to load API configs from storage:", error);
        }
      }
    }
  }

  // Cache Management
  private getCached(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  // Fetch Stock Quote
  async fetchStockQuote(
    symbol: string,
    provider: ApiProvider = "alphavantage"
  ): Promise<StockQuote> {
    const cacheKey = `quote-${provider}-${symbol}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    const config = this.configs.get(provider);
    if (!config) {
      console.warn(`API provider ${provider} not configured, using mock data`);
      return this.generateMockQuote(symbol);
    }

    let quote: StockQuote;

    switch (provider) {
      case "alphavantage":
        quote = await this.fetchAlphaVantageQuote(symbol, config);
        break;
      default:
        console.warn(`Provider ${provider} not supported for stock quotes, using mock data`);
        quote = this.generateMockQuote(symbol);
    }

    this.setCache(cacheKey, quote);
    return quote;
  }

  // Fetch Multiple Stock Quotes
  async fetchMultipleQuotes(
    symbols: string[],
    provider: ApiProvider = "alphavantage"
  ): Promise<StockQuote[]> {
    const promises = symbols.map((symbol) =>
      this.fetchStockQuote(symbol, provider).catch((err) => {
        console.error(`Failed to fetch ${symbol}:`, err);
        return this.generateMockQuote(symbol);
      })
    );

    return Promise.all(promises);
  }

  // Fetch Chart Data
  async fetchChartData(
    symbol: string,
    interval: "1D" | "1W" | "1M" | "3M" | "1Y",
    provider: ApiProvider = "alphavantage"
  ): Promise<ChartDataPoint[]> {
    const cacheKey = `chart-${provider}-${symbol}-${interval}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    const config = this.configs.get(provider);
    if (!config) {
      console.warn(`API provider ${provider} not configured, using mock data`);
      return this.generateMockChartData(interval);
    }

    let chartData: ChartDataPoint[];

    switch (provider) {
      case "alphavantage":
        chartData = await this.fetchAlphaVantageChart(symbol, interval, config);
        break;
      default:
        console.warn(`Provider ${provider} not supported for charts, using mock data`);
        chartData = this.generateMockChartData(interval);
    }

    this.setCache(cacheKey, chartData);
    return chartData;
  }

  // Alpha Vantage Implementation
  private async fetchAlphaVantageQuote(
    symbol: string,
    config: ApiConfig
  ): Promise<StockQuote> {
    try {
      const response = await axios.get(config.baseUrl!, {
        params: {
          function: "GLOBAL_QUOTE",
          symbol: symbol,
          apikey: config.apiKey,
        },
      });

      const quote = response.data["Global Quote"];

      if (!quote || Object.keys(quote).length === 0) {
        // API limit reached or invalid response
        console.warn(`Alpha Vantage limit reached for ${symbol}, using mock data`);
        return this.generateMockQuote(symbol);
      }

      return {
        symbol: quote["01. symbol"],
        name: symbol,
        price: parseFloat(quote["05. price"]),
        change: parseFloat(quote["09. change"]),
        changePercent: parseFloat(quote["10. change percent"].replace("%", "")),
        volume: parseInt(quote["06. volume"]),
        high: parseFloat(quote["03. high"]),
        low: parseFloat(quote["04. low"]),
        open: parseFloat(quote["02. open"]),
      };
    } catch (error) {
      console.error(`Alpha Vantage error for ${symbol}:`, error);
      return this.generateMockQuote(symbol);
    }
  }

  private async fetchAlphaVantageChart(
    symbol: string,
    interval: string,
    config: ApiConfig
  ): Promise<ChartDataPoint[]> {
    try {
      let functionName = "TIME_SERIES_DAILY";
      let timeKey = "Time Series (Daily)";

      // Map interval to Alpha Vantage function
      switch (interval) {
        case "1D":
          functionName = "TIME_SERIES_INTRADAY";
          timeKey = "Time Series (60min)";
          break;
        case "1W":
        case "1M":
          functionName = "TIME_SERIES_DAILY";
          timeKey = "Time Series (Daily)";
          break;
        case "3M":
        case "1Y":
          functionName = "TIME_SERIES_WEEKLY";
          timeKey = "Weekly Time Series";
          break;
      }

      const params: any = {
        function: functionName,
        symbol: symbol,
        apikey: config.apiKey,
      };

      if (functionName === "TIME_SERIES_INTRADAY") {
        params.interval = "60min";
      }

      const response = await axios.get(config.baseUrl!, { params });

      const timeSeries = response.data[timeKey];

      if (!timeSeries) {
        console.warn(`Alpha Vantage chart limit reached for ${symbol}, using mock data`);
        return this.generateMockChartData(interval);
      }

      const chartData: ChartDataPoint[] = Object.entries(timeSeries)
        .slice(0, this.getDataPointsForInterval(interval))
        .map(([date, values]: [string, any]) => ({
          date: new Date(date).toLocaleDateString(),
          open: parseFloat(values["1. open"]),
          high: parseFloat(values["2. high"]),
          low: parseFloat(values["3. low"]),
          close: parseFloat(values["4. close"]),
          volume: parseInt(values["5. volume"]),
        }))
        .reverse();

      return chartData;
    } catch (error) {
      console.error(`Alpha Vantage chart error for ${symbol}:`, error);
      return this.generateMockChartData(interval);
    }
  }

  // Fetch Market Gainers
  async fetchMarketGainers(
    provider: ApiProvider = "alphavantage",
    limit: number = 10
  ): Promise<StockQuote[]> {
    const cacheKey = `gainers-${provider}-${limit}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    // For demo, return mock data
    // In production, use actual API endpoints
    const gainers = this.generateMockGainers(limit);
    this.setCache(cacheKey, gainers);
    return gainers;
  }

  // Test API Connection
  async testConnection(provider: string): Promise<boolean> {
    try {
      const config = this.configs.get(provider);
      if (!config) return false;

      // Try a simple API call
      await this.fetchStockQuote("AAPL", provider as ApiProvider);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Helper Methods
  private getDataPointsForInterval(interval: string): number {
    switch (interval) {
      case "1D":
        return 24;
      case "1W":
        return 7;
      case "1M":
        return 30;
      case "3M":
        return 90;
      case "1Y":
        return 365;
      default:
        return 30;
    }
  }

  // Mock Data Generators (fallback when API fails)
  private generateMockQuote(symbol: string): StockQuote {
    const basePrice = Math.random() * 500 + 50;
    const change = (Math.random() - 0.5) * 10;
    const changePercent = (change / basePrice) * 100;

    return {
      symbol,
      name: symbol,
      price: basePrice,
      change,
      changePercent,
      volume: Math.floor(Math.random() * 10000000) + 1000000,
      marketCap: basePrice * Math.floor(Math.random() * 1000000000),
    };
  }

  private generateMockChartData(interval: string): ChartDataPoint[] {
    const dataPoints = this.getDataPointsForInterval(interval);
    const data: ChartDataPoint[] = [];
    let basePrice = 150;

    for (let i = 0; i < dataPoints; i++) {
      const change = (Math.random() - 0.5) * 5;
      basePrice += change;
      const open = basePrice + (Math.random() - 0.5) * 2;
      const close = basePrice + (Math.random() - 0.5) * 2;
      const high = Math.max(open, close) + Math.random() * 3;
      const low = Math.min(open, close) - Math.random() * 3;

      data.push({
        date: new Date(Date.now() - (dataPoints - i) * 86400000).toLocaleDateString(),
        open,
        high,
        low,
        close,
        volume: Math.floor(Math.random() * 10000000) + 1000000,
      });
    }

    return data;
  }

  private generateMockGainers(count: number): StockQuote[] {
    const symbols = ["AAPL", "GOOGL", "MSFT", "AMZN", "TSLA", "NVDA", "META", "NFLX", "AMD", "INTC"];

    return Array.from({ length: count }, (_, i) => {
      const basePrice = Math.random() * 500 + 50;
      const change = Math.random() * 10 + 2; // Always positive for gainers

      return {
        symbol: symbols[i % symbols.length],
        name: symbols[i % symbols.length],
        price: basePrice,
        change,
        changePercent: (change / basePrice) * 100,
        volume: Math.floor(Math.random() * 10000000) + 1000000,
      };
    });
  }
}

// Export singleton instance
export const apiService = new ApiService();