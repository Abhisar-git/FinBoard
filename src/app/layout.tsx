import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import Footer from "@/components/Footer";
import { ApiInitializer } from "@/components/ApiInitializer";
import { Providers } from "../components/Provider"; // New component we'll create

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
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <ApiInitializer />
          <div className="flex flex-col min-h-screen">
            {children}
            <Footer />
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}