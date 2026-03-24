/** Right sidebar — top recommendations ranked by absolute edge. */

"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { EdgeIndicator } from "./edge-indicator";
import type { Recommendation } from "@/types";

interface RecommendationSidebarProps {
  recommendations: Recommendation[];
  isLoading: boolean;
}

function ConfidenceBar({ confidence }: { confidence: number }) {
  const pct = Math.round(confidence * 100);
  return (
    <div className="flex items-center gap-1.5">
      <div className="h-1 w-16 rounded-full bg-zinc-800/80 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${
            pct >= 70
              ? "bg-violet-500"
              : pct >= 40
                ? "bg-amber-500"
                : "bg-zinc-600"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[10px] font-mono tabular-nums text-muted-foreground">
        {pct}%
      </span>
    </div>
  );
}

function RecCardSkeleton() {
  return (
    <div className="p-3 space-y-2">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-2 w-16" />
    </div>
  );
}

export function RecommendationSidebar({
  recommendations,
  isLoading,
}: RecommendationSidebarProps) {
  const buys = recommendations.filter((r) => r.signal === "BUY");
  const sells = recommendations.filter((r) => r.signal === "SELL");

  return (
    <div className="w-[320px] border-l border-border/50 bg-card/20 backdrop-blur-sm flex flex-col shrink-0">
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-border/30 flex items-center justify-between shrink-0">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground/80">
          Recommendations
        </h2>
        <Badge variant="outline" className="text-[10px] font-mono tabular-nums bg-muted/30">
          {recommendations.length}
        </Badge>
      </div>

      {/* Signal Summary */}
      <div className="px-4 py-2 border-b border-border/20 flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-emerald-400" />
          <span className="text-[10px] text-muted-foreground">
            {buys.length} BUY
          </span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-red-400" />
          <span className="text-[10px] text-muted-foreground">
            {sells.length} SELL
          </span>
        </div>
      </div>

      {/* Scrollable List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1.5">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="bg-muted/10 border-border/30">
                <RecCardSkeleton />
              </Card>
            ))
          ) : recommendations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-xs">
              No recommendations yet.
              <br />
              <span className="text-[10px]">
                Start the backend to populate.
              </span>
            </div>
          ) : (
            recommendations.map((rec) => (
              <Card
                key={rec.ticker}
                className="bg-muted/10 border-border/30 hover:bg-muted/20 transition-colors cursor-pointer group"
              >
                <CardContent className="p-3 space-y-2">
                  {/* Top row: ticker + signal */}
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-foreground/90 group-hover:text-violet-400 transition-colors">
                      {rec.ticker}
                    </span>
                    <EdgeIndicator edgePct={rec.edge_pct} signal={rec.signal} compact />
                  </div>

                  {/* Prices */}
                  <div className="flex items-center gap-4 text-[10px]">
                    <div>
                      <span className="text-muted-foreground/60">Mkt </span>
                      <span className="font-mono tabular-nums text-foreground/70">
                        {rec.market_price.toFixed(0)}¢
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground/60">Fair </span>
                      <span className="font-mono tabular-nums text-violet-400">
                        {rec.fair_price.toFixed(0)}¢
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground/60">Edge </span>
                      <span
                        className={`font-mono tabular-nums ${
                          rec.signal === "BUY"
                            ? "text-emerald-400"
                            : rec.signal === "SELL"
                              ? "text-red-400"
                              : "text-zinc-500"
                        }`}
                      >
                        {rec.edge_pct > 0 ? "+" : ""}{rec.edge_pct.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Confidence */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground/60">Confidence</span>
                    <ConfidenceBar confidence={rec.confidence} />
                  </div>

                  {/* Reasoning */}
                  {rec.reasoning && (
                    <p className="text-[10px] text-muted-foreground/50 line-clamp-2 leading-relaxed">
                      {rec.reasoning}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
