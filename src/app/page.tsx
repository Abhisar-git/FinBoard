"use client";

import { Dashboard } from "@/components/Dashboard";
import Navbar from "@/components/Navbar";
import { useEffect } from "react";
import { apiService } from "@/lib/api/apiService";

export default function Home() {
  useEffect(() => {
    // Initialize API service on mount
    apiService.init();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="container mx-auto px-4 py-6">
        <Dashboard />
      </div>
    </main>
  );
}