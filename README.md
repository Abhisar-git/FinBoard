FinBoard
FinBoard is a modular, real-time finance dashboard that allows users to monitor markets through customizable widgets. Built with performance and flexibility in mind, it features a drag-and-drop interface and local state persistence.

Features

Customizable Layout: Drag-and-drop grid system to arrange widgets exactly how you want them.



Dynamic Widgets: Support for Stock Tables, Watchlist Cards, and Interactive Charts.



API Integration: Built-in adapters for Alpha Vantage, Finnhub, and Yahoo Finance with intelligent caching.



Local Persistence: Dashboard layouts and API configurations are saved locally, preserving your workspace between sessions.


Real-time Monitoring: Configurable auto-refresh intervals for live market data updates.

Tech Stack

Framework: Next.js 14 (App Router) 

Language: TypeScript


Styling: Tailwind CSS & Shadcn/UI 


State Management: Zustand (Persist Middleware) 

Layout Engine: React Grid Layout

Getting Started
Clone the repository:

Bash

git clone https://github.com/yourusername/finboard.git
cd finboard
Install dependencies:

Bash

npm install
Run the application:

Bash

npm run dev
Open in browser: Navigate to http://localhost:3000.

Configuration
FinBoard runs entirely client-side. To fetch real market data:

Click the API Keys button in the top navigation.

Add your API key for a supported provider (e.g., Alpha Vantage or Finnhub).

Your keys are stored securely in your browser's local storage and are never sent to an external server.

Note: If no API key is provided, the dashboard will utilize mock data for demonstration purposes.