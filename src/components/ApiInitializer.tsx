"use client";

import { useEffect } from "react";
import { apiService } from "@/lib/api/apiService";

export function ApiInitializer() {
  useEffect(() => {
    // Load configs from local storage when the app starts
    apiService.init();
  }, []);

  return null; // This component renders nothing, it just runs logic
}