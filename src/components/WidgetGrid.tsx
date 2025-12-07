"use client";

import { useWidgetStore } from "@/store/widgetStore";
import { WidgetCard } from "./WidgetCard";
import { Responsive, WidthProvider, Layout } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const ResponsiveGridLayout = WidthProvider(Responsive);

export function WidgetGrid() {
  const { widgets, updateWidgetPosition, updateWidgetSize } = useWidgetStore();

  const handleLayoutChange = (layout: Layout[]) => {
    layout.forEach((item) => {
      const widget = widgets.find((w) => w.id === item.i);
      if (widget) {
        // Update position if changed
        if (widget.position.x !== item.x || widget.position.y !== item.y) {
          updateWidgetPosition(item.i, { x: item.x, y: item.y });
        }
        // Update size if changed
        if (widget.size.w !== item.w || widget.size.h !== item.h) {
          updateWidgetSize(item.i, { w: item.w, h: item.h });
        }
      }
    });
  };

  const layouts = {
    lg: widgets.map((widget) => ({
      i: widget.id,
      x: widget.position.x,
      y: widget.position.y,
      w: widget.size.w,
      h: widget.size.h,
      minW: 2,
      minH: 2,
    })),
  };

  return (
    <ResponsiveGridLayout
      className="layout"
      layouts={layouts}
      breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
      cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
      rowHeight={100}
      onLayoutChange={handleLayoutChange}
      isDraggable={true}
      isResizable={true}
      compactType="vertical"
      preventCollision={false}
    >
      {widgets.map((widget) => (
        <div key={widget.id}>
          <WidgetCard widget={widget} />
        </div>
      ))}
    </ResponsiveGridLayout>
  );
}