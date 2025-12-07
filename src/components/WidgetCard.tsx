"use client";

import { Widget, useWidgetStore } from "@/store/widgetStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MoreVertical,
  Trash2,
  Settings,
  RefreshCw,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect, memo } from "react";
import { TableWidget } from "./widgets/TableWidget";
import { CardWidget } from "./widgets/CardWidget";
import { ChartWidget } from "./widgets/ChartWidget";
import { ConfigModal } from "./ConfigModal";
import { NewsWidget } from "./widgets/NewsWidget";

interface WidgetCardProps {
  widget: Widget;
}

function WidgetCardComponent({ widget }: WidgetCardProps) {
  const { removeWidget } = useWidgetStore();
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Auto-refresh data based on refresh interval
  useEffect(() => {
    if (!widget.config.refreshInterval) return;

    const interval = setInterval(() => {
      handleRefresh();
    }, widget.config.refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [widget.config.refreshInterval, widget.id]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setRefreshKey((prev) => prev + 1);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to remove this widget?")) {
      removeWidget(widget.id);
    }
  };

  const handleConfigOpen = () => {
    setIsConfigOpen(true);
  };

  const handleConfigClose = () => {
    setIsConfigOpen(false);
  };

  const renderWidget = () => {
    switch (widget.type) {
      case "table":
        return <TableWidget widget={widget} isRefreshing={isRefreshing} key={refreshKey} />;
      case "card":
        return <CardWidget widget={widget} isRefreshing={isRefreshing} key={refreshKey} />;
      case "chart":
        return <ChartWidget widget={widget} isRefreshing={isRefreshing} key={refreshKey} />;
      case "news": // Add this
      return <NewsWidget widget={widget} isRefreshing={isRefreshing} key={refreshKey} />;
      default:
        return <div>Unknown widget type</div>;
    }
  };

  return (
    <>
      <Card className="h-full flex flex-col shadow-lg hover:shadow-xl transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 py-3 border-b">
          <CardTitle className="text-sm font-medium truncate flex-1">
            {widget.title}
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleConfigOpen}>
                  <Settings className="mr-2 h-4 w-4" />
                  Configure
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleRefresh}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh Now
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-4 overflow-auto">
          {renderWidget()}
        </CardContent>
      </Card>

      {/* Configuration Modal - Only render when open */}
      {isConfigOpen && (
        <ConfigModal
          widget={widget}
          open={isConfigOpen}
          onClose={handleConfigClose}
        />
      )}
    </>
  );
}

// Memoize the component to prevent unnecessary re-renders
export const WidgetCard = memo(WidgetCardComponent, (prevProps, nextProps) => {
  return prevProps.widget.id === nextProps.widget.id &&
         prevProps.widget.title === nextProps.widget.title &&
         JSON.stringify(prevProps.widget.config) === JSON.stringify(nextProps.widget.config);
});