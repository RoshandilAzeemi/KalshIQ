/** KalshIQ — Main Trading Dashboard */

"use client";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { NavSidebar } from "@/components/dashboard/nav-sidebar";
import { Header } from "@/components/dashboard/header";
import { MarketTable } from "@/components/dashboard/market-table";
import { RecommendationSidebar } from "@/components/dashboard/recommendation-sidebar";
import { usePolling } from "@/hooks/use-polling";
import { getMarkets, getRecommendations } from "@/lib/api";

export default function DashboardPage() {
  const {
    data: marketsData,
    isLoading: marketsLoading,
    error: marketsError,
    lastUpdated,
  } = usePolling({
    fetcher: () => getMarkets({ limit: 100 }),
    interval: 5000,
  });

  const {
    data: recsData,
    isLoading: recsLoading,
  } = usePolling({
    fetcher: () => getRecommendations({ limit: 20 }),
    interval: 5000,
  });

  const markets = marketsData?.markets ?? [];
  const recommendations = recsData?.recommendations ?? [];
  const isConnected = !marketsError;

  return (
    <SidebarProvider defaultOpen={true}>
      <NavSidebar />
      <SidebarInset className="flex flex-col h-screen overflow-hidden">
        <Header
          lastUpdated={lastUpdated}
          isConnected={isConnected}
          marketCount={marketsData?.total ?? 0}
        />

        <div className="flex flex-1 overflow-hidden">
          {/* Main content — Market Table */}
          <main className="flex-1 p-3 overflow-auto">
            <MarketTable markets={markets} isLoading={marketsLoading} />
          </main>

          {/* Right sidebar — Recommendations */}
          <RecommendationSidebar
            recommendations={recommendations}
            isLoading={recsLoading}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
