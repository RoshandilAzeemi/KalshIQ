/** High-density market data table with edge indicators. */

"use client";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { EdgeIndicator } from "./edge-indicator";
import type { Market } from "@/types";

interface MarketTableProps {
  markets: Market[];
  isLoading: boolean;
}

function formatPrice(cents: number): string {
  return `${cents.toFixed(0)}¢`;
}

function formatVolume(vol: number): string {
  if (vol >= 1_000_000) return `${(vol / 1_000_000).toFixed(1)}M`;
  if (vol >= 1_000) return `${(vol / 1_000).toFixed(1)}K`;
  return String(vol);
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, string> = {
    open: "bg-emerald-950/50 text-emerald-400 border-emerald-800/40",
    closed: "bg-zinc-800/50 text-zinc-500 border-zinc-700/40",
    settled: "bg-blue-950/50 text-blue-400 border-blue-800/40",
  };

  return (
    <Badge
      variant="outline"
      className={`text-[10px] font-medium uppercase tracking-wider ${config[status] ?? config.closed}`}
    >
      {status}
    </Badge>
  );
}

function TableSkeleton() {
  return (
    <TableBody>
      {Array.from({ length: 8 }).map((_, i) => (
        <TableRow key={i} className="border-border/30">
          {Array.from({ length: 8 }).map((_, j) => (
            <TableCell key={j} className="py-2">
              <Skeleton className="h-4 w-full" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  );
}

export function MarketTable({ markets, isLoading }: MarketTableProps) {
  return (
    <div className="rounded-lg border border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden">
      <div className="px-4 py-2.5 border-b border-border/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground/80">
            Market Overview
          </h2>
          <Badge variant="outline" className="text-[10px] font-mono tabular-nums bg-muted/30">
            {markets.length}
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] text-muted-foreground">Live</span>
        </div>
      </div>

      <div className="overflow-auto max-h-[calc(100vh-160px)]">
        <Table>
          <TableHeader>
            <TableRow className="border-border/30 hover:bg-transparent">
              <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/70 h-8 w-[100px]">
                Ticker
              </TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/70 h-8">
                Title
              </TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/70 h-8 text-right w-[60px]">
                Yes
              </TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/70 h-8 text-right w-[60px]">
                No
              </TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/70 h-8 text-right w-[70px]">
                Fair
              </TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/70 h-8 text-right w-[60px]">
                Vol
              </TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/70 h-8 w-[200px]">
                Edge
              </TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/70 h-8 w-[70px]">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>

          {isLoading ? (
            <TableSkeleton />
          ) : (
            <TableBody>
              {markets.map((market) => (
                <TableRow
                  key={market.ticker}
                  className="border-border/20 cursor-pointer transition-colors hover:bg-muted/20 group"
                >
                  <TableCell className="py-2">
                    <span className="font-mono text-xs font-medium text-foreground/90 group-hover:text-violet-400 transition-colors">
                      {market.ticker}
                    </span>
                  </TableCell>
                  <TableCell className="py-2 max-w-[300px]">
                    <span className="text-xs text-foreground/70 line-clamp-1">
                      {market.title}
                    </span>
                  </TableCell>
                  <TableCell className="py-2 text-right">
                    <span className="font-mono text-xs tabular-nums text-emerald-400">
                      {formatPrice(market.yes_price)}
                    </span>
                  </TableCell>
                  <TableCell className="py-2 text-right">
                    <span className="font-mono text-xs tabular-nums text-red-400">
                      {formatPrice(market.no_price)}
                    </span>
                  </TableCell>
                  <TableCell className="py-2 text-right">
                    <span className="font-mono text-xs tabular-nums text-violet-400">
                      {market.fair_price !== null ? formatPrice(market.fair_price) : "—"}
                    </span>
                  </TableCell>
                  <TableCell className="py-2 text-right">
                    <span className="font-mono text-xs tabular-nums text-muted-foreground">
                      {formatVolume(market.volume)}
                    </span>
                  </TableCell>
                  <TableCell className="py-2">
                    <EdgeIndicator edgePct={market.edge_pct} signal={market.signal} />
                  </TableCell>
                  <TableCell className="py-2">
                    <StatusBadge status={market.status} />
                  </TableCell>
                </TableRow>
              ))}

              {markets.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-muted-foreground text-sm">
                    No markets available. Start the backend data pipeline to populate.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          )}
        </Table>
      </div>
    </div>
  );
}
