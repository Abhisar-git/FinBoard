"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Download, Upload } from "lucide-react";
import { useWidgetStore } from "@/store/widgetStore";
import { WidgetGrid } from "./WidgetGrid";
import { AddWidgetModal } from "./AddWidgetModal";

export function Dashboard() {
  const [isAddWidgetOpen, setIsAddWidgetOpen] = useState(false);
  const { widgets, importDashboard, exportDashboard } = useWidgetStore();

  const handleExport = () => {
    const config = exportDashboard();
    const blob = new Blob([JSON.stringify(config, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `finboard-config-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event: any) => {
          try {
            const config = JSON.parse(event.target.result);
            importDashboard(config);
          } catch (error) {
            console.error("Failed to import config:", error);
            alert("Invalid configuration file");
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className="w-full">
      {/* Dashboard Header */}
      <div className="flex items-center justify-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            My Dashboard
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {widgets.length} widget{widgets.length !== 1 ? "s" : ""} active
          </p>
        </div>

        <div className="flex items-center gap-3 mb-5 p-5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={widgets.length === 0}
          >
            <Download className="w-4 h-4 mr-2 mt -3" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={handleImport}>
            <Upload className="w-4 h-4 mr-2 " />
            Import
          </Button>
          <Button onClick={() => setIsAddWidgetOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Widget
          </Button>
        </div>
      </div>

      {/* Empty State */}
      {widgets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No widgets yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Start building your custom finance dashboard by adding your first
              widget
            </p>
            <Button onClick={() => setIsAddWidgetOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Widget
            </Button>
          </div>
        </div>
      ) : (
        /* Widget Grid - Drag and Drop Layout */
        <WidgetGrid />
      )}

      {/* Add Widget Modal */}
      <AddWidgetModal
        open={isAddWidgetOpen}
        onClose={() => setIsAddWidgetOpen(false)}
      />
    </div>
  );
}