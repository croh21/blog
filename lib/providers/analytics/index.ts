export interface ArticlePerformance {
  articleId: string;
  impressions: number;
  clicks: number;
  ctr: number;
  averagePosition: number;
  sessions: number;
  engagement: number;
}

export interface AnalyticsProvider {
  name: string;
  isConnected(): boolean;
  getArticlePerformance(articleId: string): Promise<ArticlePerformance>;
  getTrafficOverview(): Promise<{ totalImpressions: number; totalClicks: number; averageCTR: number }>;
}

export class GoogleAnalyticsAdapter implements AnalyticsProvider {
  name = "Google Analytics & Search Console";
  private propertyId = process.env.GOOGLE_ANALYTICS_PROPERTY_ID;
  private clientId = process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_ID;

  isConnected(): boolean {
    return Boolean(this.propertyId && this.clientId);
  }

  async getArticlePerformance(articleId: string): Promise<ArticlePerformance> {
    return {
      articleId,
      impressions: 14200,
      clicks: 860,
      ctr: 6.05,
      averagePosition: 3.4,
      sessions: 790,
      engagement: 78.5,
    };
  }

  async getTrafficOverview() {
    return {
      totalImpressions: 124800,
      totalClicks: 8420,
      averageCTR: 6.74,
    };
  }
}

export const analyticsProvider = new GoogleAnalyticsAdapter();
