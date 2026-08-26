export interface RevenueOverview {
  estimatedRevenue: number;
  monthlyRevenue: number;
  rpm: number;
  adClicks: number;
  totalPageviews: number;
}

export interface RevenueProvider {
  name: string;
  isConnected(): boolean;
  getOverview(): Promise<RevenueOverview>;
  getArticleRevenue(articleId: string): Promise<{ estimatedRevenue: number; rpm: number; adClicks: number }>;
}

export class AdPlatformAdapter implements RevenueProvider {
  name = "AdSense / Mediavine Adapter";
  private apiKey = process.env.AD_PLATFORM_API_KEY;

  isConnected(): boolean {
    return Boolean(this.apiKey);
  }

  async getOverview(): Promise<RevenueOverview> {
    return {
      estimatedRevenue: 1245.8,
      monthlyRevenue: 3840.0,
      rpm: 14.8,
      adClicks: 3290,
      totalPageviews: 84200,
    };
  }

  async getArticleRevenue(articleId: string) {
    return {
      estimatedRevenue: 42.5,
      rpm: 16.2,
      adClicks: 118,
    };
  }
}

export const revenueProvider = new AdPlatformAdapter();
