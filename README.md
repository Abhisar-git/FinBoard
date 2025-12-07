# FinBoard 📈

**FinBoard** is a customizable, real-time finance dashboard that allows users to monitor stocks, market trends, and financial data through an interactive drag-and-drop interface. Built for performance and resilience, it supports multiple API providers and persists user layouts automatically.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-3.0-38b2ac)
![Zustand](https://img.shields.io/badge/State-Zustand-orange)

## ✨ Key Features

* **🎨 Customizable Layout:** Drag-and-drop grid system to arrange widgets exactly how you want.
* **📊 Multiple Widget Types:**
    * **Interactive Charts:** Line and Candlestick charts with adjustable time intervals (1D, 1W, 1M, etc.).
    * **Data Tables:** Paginated lists of stock data with search filtering.
    * **Finance Cards:** Quick-glance metrics for Watchlists, Top Gainers, and Sector Performance.
* **🔌 Multi-API Support:** Seamless integration with **Alpha Vantage** and **Finnhub**.
* **💾 Smart Persistence:** Dashboard layout and API configurations are saved automatically to your browser (LocalStorage).
* **🛡️ Fail-Safe Architecture:** Automatically switches to mock data if API limits are reached, ensuring the UI never crashes.
* **tao Dark Mode:** Fully responsive UI with built-in light/dark theme switching.

## 🛠️ Tech Stack

* **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
* **State Management:** [Zustand](https://github.com/pmndrs/zustand)
* **Drag & Drop:** [React Grid Layout](https://github.com/react-grid-layout/react-grid-layout)
* **HTTP Client:** [Axios](https://axios-http.com/)

## 🚀 Getting Started

### Prerequisites
* Node.js 18+ installed.
**** Get Your API Keys from AlphaVantage(https://www.alphavantage.co/support/#api-key)
     and NewsData.io(https://newsdata.io/) to use the app.****

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/yourusername/finboard.git](https://github.com/yourusername/finboard.git)
    cd finboard
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```

4.  **Open the app:**
    Visit `http://localhost:3000` in your browser.

## ⚙️ Configuration

FinBoard is designed to be **Zero-Config**. You do not need to set up a complex `.env` file to get started.

1.  Click **"+ Add Widget"** on the dashboard.
2.  Select a widget type (Chart, Table, or Card).
3.  In the configuration modal, paste your **API Key**.
4.  The app will cache this key locally for future requests.

> **Note:** If no API key is provided or limits are hit, the application gracefully degrades to display realistic mock data for demonstration purposes.

## 📂 Project Structure

```bash
src/
├── app/              # Next.js App Router pages
├── components/       # Reusable UI components
│   ├── ui/           # Shadcn UI primitives
│   └── widgets/      # Logic for Charts, Cards, and Tables
├── lib/
│   └── api/          # Centralized API service & adapters
├── store/            # Zustand state management
└── styles/           # Global CSS
