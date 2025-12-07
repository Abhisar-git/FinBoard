"use client";

import { Widget, useWidgetStore } from "@/store/widgetStore";
import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Loader2, ExternalLink, Calendar, TrendingUp } from "lucide-react";
import { apiService } from "@/lib/api/apiService";

interface NewsWidgetProps {
  widget: Widget;
  isRefreshing: boolean;
}

interface NewsArticle {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  source_id: string;
  image_url?: string;
  category?: string[];
}

export function NewsWidget({ widget, isRefreshing }: NewsWidgetProps) {
  const { updateWidgetData } = useWidgetStore();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const category = widget.config.newsCategory || "business";
  const limit = widget.config.limit || 10;

  useEffect(() => {
    fetchNews();
  }, [widget.id, isRefreshing, category]);

  const fetchNews = async () => {
    setLoading(true);
    setError(null);

    try {
      const config = apiService.getApiConfig("newsdata");
      
      if (!config) {
        console.warn("NewsData.io API not configured, using mock data");
        const mockNews = generateMockNews(limit, category);
        setArticles(mockNews);
        setLoading(false);
        return;
      }

      // NewsData.io API endpoint
      const response = await axios.get(`${config.baseUrl}/news`, {
        params: {
          apikey: config.apiKey,
          category: category,
          language: "en",
          country: "us",
        },
      });

      if (response.data.status === "success" && response.data.results) {
        const newsData = response.data.results.slice(0, limit);
        setArticles(newsData);
        updateWidgetData(widget.id, newsData);
      } else {
        throw new Error("Invalid response from NewsData.io");
      }
    } catch (err: any) {
      console.error("Error fetching news:", err);
      
      // Check error type
      if (err.response?.status === 429) {
        setError("API rate limit reached. Showing sample news.");
      } else if (err.response?.status === 401) {
        setError("Invalid API key. Showing sample news.");
      } else {
        setError("Unable to fetch live news. Showing sample news.");
      }
      
      // Use mock data as fallback
      const mockNews = generateMockNews(limit, category);
      setArticles(mockNews);
    } finally {
      setLoading(false);
    }
  };

  const generateMockNews = (count: number, category: string): NewsArticle[] => {
    const newsByCategory: Record<string, any[]> = {
      business: [
        {
          title: "Stock Market Reaches New Heights Amid Economic Recovery",
          description: "Major indices hit record highs as investor confidence grows following positive economic indicators and strong corporate earnings reports.",
          source_id: "Financial Times",
        },
        {
          title: "Tech Giants Report Record Quarterly Earnings",
          description: "Leading technology companies exceed analyst expectations with robust revenue growth driven by cloud services and AI investments.",
          source_id: "Bloomberg",
        },
        {
          title: "Federal Reserve Announces Interest Rate Decision",
          description: "Central bank maintains current rates while signaling potential adjustments based on inflation trends and economic growth.",
          source_id: "Reuters",
        },
        {
          title: "Major Merger Deal Reshapes Industry Landscape",
          description: "Two industry leaders announce strategic merger valued at billions, promising enhanced innovation and market reach.",
          source_id: "Wall Street Journal",
        },
        {
          title: "Global Supply Chain Shows Signs of Recovery",
          description: "Shipping delays decrease as ports improve efficiency and companies adapt to new logistics strategies.",
          source_id: "CNBC",
        },
      ],
      technology: [
        {
          title: "AI Revolution: New Language Model Sets Performance Records",
          description: "Latest artificial intelligence breakthrough demonstrates unprecedented capabilities in natural language understanding and generation.",
          source_id: "TechCrunch",
        },
        {
          title: "Quantum Computing Breakthrough Announced by Tech Giant",
          description: "Researchers achieve significant milestone in quantum computing, bringing practical applications closer to reality.",
          source_id: "Wired",
        },
        {
          title: "5G Network Expansion Accelerates Globally",
          description: "Telecommunications companies invest heavily in next-generation wireless infrastructure, enabling faster connectivity.",
          source_id: "The Verge",
        },
        {
          title: "Cybersecurity Threats Evolve as Companies Strengthen Defenses",
          description: "Security experts warn of sophisticated attacks while organizations adopt advanced protection measures.",
          source_id: "ZDNet",
        },
        {
          title: "Electric Vehicle Technology Reaches New Milestone",
          description: "Battery efficiency improvements promise extended range and faster charging for next-generation EVs.",
          source_id: "Electrek",
        },
      ],
      entertainment: [
        {
          title: "Streaming Wars Intensify with New Platform Launches",
          description: "Entertainment giants unveil competing services as viewers embrace on-demand content consumption.",
          source_id: "Variety",
        },
        {
          title: "Box Office Records Broken by Latest Blockbuster",
          description: "Summer tentpole film exceeds expectations with massive opening weekend revenue across global markets.",
          source_id: "Hollywood Reporter",
        },
        {
          title: "Music Industry Adapts to Digital Streaming Era",
          description: "Artists and labels navigate evolving landscape as streaming becomes dominant revenue source.",
          source_id: "Billboard",
        },
        {
          title: "Gaming Industry Continues Explosive Growth",
          description: "Video game market expands with mobile gaming and esports driving unprecedented engagement.",
          source_id: "IGN",
        },
        {
          title: "Virtual Reality Entertainment Gains Mainstream Traction",
          description: "VR experiences attract broader audiences as technology improves and content library expands.",
          source_id: "Engadget",
        },
      ],
      sports: [
        {
          title: "Championship Game Draws Record Viewership",
          description: "Historic matchup captivates millions as underdog team challenges defending champions in thrilling contest.",
          source_id: "ESPN",
        },
        {
          title: "Olympic Athletes Prepare for Upcoming International Competition",
          description: "World-class competitors showcase training regimens ahead of major sporting event.",
          source_id: "Sports Illustrated",
        },
        {
          title: "Professional League Announces Expansion Plans",
          description: "Sports organization reveals strategy to add new franchises and grow fan base in emerging markets.",
          source_id: "The Athletic",
        },
        {
          title: "Rising Star Breaks Long-Standing Record",
          description: "Young athlete achieves remarkable feat, surpassing milestone that stood for decades.",
          source_id: "Bleacher Report",
        },
        {
          title: "Team Signs Major Contract Extension with Star Player",
          description: "Franchise secures future by reaching agreement with key performer on lucrative long-term deal.",
          source_id: "Yahoo Sports",
        },
      ],
      world: [
        {
          title: "International Summit Addresses Global Climate Challenges",
          description: "World leaders convene to discuss coordinated action on environmental issues and sustainability goals.",
          source_id: "BBC News",
        },
        {
          title: "Economic Partnership Agreement Signed Between Nations",
          description: "Countries formalize trade relations with comprehensive deal aimed at boosting mutual prosperity.",
          source_id: "Al Jazeera",
        },
        {
          title: "Humanitarian Aid Efforts Expand in Response to Crisis",
          description: "International organizations mobilize resources to support affected populations in regions facing challenges.",
          source_id: "The Guardian",
        },
        {
          title: "Scientific Collaboration Yields Breakthrough Discovery",
          description: "Researchers from multiple countries achieve significant advancement through joint research initiative.",
          source_id: "Nature",
        },
        {
          title: "Cultural Exchange Program Strengthens International Relations",
          description: "Educational and artistic initiatives foster understanding between diverse communities worldwide.",
          source_id: "NPR",
        },
      ],
    };

    const categoryNews = newsByCategory[category] || newsByCategory.business;
    
    return categoryNews.slice(0, count).map((news, index) => ({
      title: news.title,
      description: news.description,
      link: "#",
      pubDate: new Date(Date.now() - index * 3600000).toISOString(),
      source_id: news.source_id,
      category: [category],
    }));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getCategoryIcon = () => {
    return <TrendingUp className="h-5 w-5 text-blue-600" />;
  };

  const getCategoryTitle = () => {
    return category.charAt(0).toUpperCase() + category.slice(1) + " News";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b">
        <div className="flex items-center gap-2">
          {getCategoryIcon()}
          <h3 className="font-semibold text-sm">{getCategoryTitle()}</h3>
        </div>
        <span className="text-xs text-gray-500">{articles.length} articles</span>
      </div>

      {/* Error Message (if any) */}
      {error && (
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-xs text-yellow-800 dark:text-yellow-200">{error}</p>
        </div>
      )}

      {/* News Articles */}
      <div className="space-y-3 max-h-[500px] overflow-y-auto">
        {articles.map((article, index) => (
          <div
            key={index}
            className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
            onClick={() => article.link !== "#" && window.open(article.link, "_blank")}
          >
            <div className="flex gap-3">
              {article.image_url && (
                <img
                  src={article.image_url}
                  alt={article.title}
                  className="w-20 h-20 rounded object-cover flex-shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm line-clamp-2 mb-1">
                  {article.title}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
                  {article.description}
                </p>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(article.pubDate)}
                  </span>
                  <span className="font-medium text-gray-600 dark:text-gray-300">
                    {article.source_id}
                  </span>
                  {article.link !== "#" && (
                    <ExternalLink className="w-3 h-3 ml-auto" />
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {articles.length === 0 && (
        <div className="text-center py-8 text-gray-500">No news available</div>
      )}
    </div>
  );
}