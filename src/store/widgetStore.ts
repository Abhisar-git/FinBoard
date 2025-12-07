import { create } from "zustand";
import { persist } from "zustand/middleware";

export type WidgetType = "table" | "card" | "chart" | "news";
export type ChartType = "line" | "candlestick";
export type CardType = "watchlist" | "gainers" | "performance" | "financial";
export type RefreshInterval = 30 | 60 | 300 | 600; // seconds

export interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  position: { x: number; y: number };
  size: { w: number; h: number };
  config: {
    // For all widgets
    apiProvider?: "alphavantage" | "finnhub" | "yahoo";
    apiKey?: string; // <--- ADDED THIS FIELD
    refreshInterval?: RefreshInterval;
    lastUpdated?: number;

    // For table widgets
    symbols?: string[];
    columns?: string[];
    pageSize?: number;

    // For card widgets
    cardType?: CardType;
    limit?: number;

    // For chart widgets
    chartType?: ChartType;
    symbol?: string;
    interval?: "1D" | "1W" | "1M" | "3M" | "1Y";
    newsQuery?: string;
  };
  data?: any;
  newsCategory?: string; // "business", "technology", "entertainment", etc.
  limit?: number;
}

interface WidgetStore {
  widgets: Widget[];
  addWidget: (widget: Omit<Widget, "id">) => void;
  removeWidget: (id: string) => void;
  updateWidget: (id: string, updates: Partial<Widget>) => void;
  updateWidgetData: (id: string, data: any) => void;
  updateWidgetPosition: (
    id: string,
    position: { x: number; y: number }
  ) => void;
  updateWidgetSize: (id: string, size: { w: number; h: number }) => void;
  exportDashboard: () => any;
  importDashboard: (config: any) => void;
  clearDashboard: () => void;
}

export const useWidgetStore = create<WidgetStore>()(
  persist(
    (set, get) => ({
      widgets: [],

      addWidget: (widget) => {
        const newWidget: Widget = {
          ...widget,
          id: `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        };
        set((state) => ({
          widgets: [...state.widgets, newWidget],
        }));
      },

      removeWidget: (id) => {
        set((state) => ({
          widgets: state.widgets.filter((w) => w.id !== id),
        }));
      },

      updateWidget: (id, updates) => {
        set((state) => ({
          widgets: state.widgets.map((w) =>
            w.id === id ? { ...w, ...updates } : w
          ),
        }));
      },

      updateWidgetData: (id, data) => {
        set((state) => ({
          widgets: state.widgets.map((w) =>
            w.id === id
              ? { ...w, data, config: { ...w.config, lastUpdated: Date.now() } }
              : w
          ),
        }));
      },

      updateWidgetPosition: (id, position) => {
        set((state) => ({
          widgets: state.widgets.map((w) =>
            w.id === id ? { ...w, position } : w
          ),
        }));
      },

      updateWidgetSize: (id, size) => {
        set((state) => ({
          widgets: state.widgets.map((w) => (w.id === id ? { ...w, size } : w)),
        }));
      },

      exportDashboard: () => {
        const state = get();
        return {
          version: "1.0",
          exportedAt: new Date().toISOString(),
          widgets: state.widgets,
        };
      },

      importDashboard: (config) => {
        if (config.widgets && Array.isArray(config.widgets)) {
          set({ widgets: config.widgets });
        }
      },

      clearDashboard: () => {
        set({ widgets: [] });
      },
    }),
    {
      name: "finboard-dashboard",
    }
  )
);
