"use client";

import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import Footer from "@/components/Footer"; // Import the footer
import { apiService } from "@/lib/api/apiService";
import { useEffect } from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FinBoard",
  description: "Finance Dashboard Assignment",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
   useEffect(() => {
    // Load saved API configs from localStorage on mount
    apiService.loadConfigsFromStorage();
  }, []);
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="flex flex-col min-h-screen">
            {children}
            <Footer /> {/* Added Footer here */}
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}