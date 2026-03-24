/** Header bar — platform name, connection status, last sync time. */

"use client";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface HeaderProps {
  lastUpdated: Date | null;
  isConnected: boolean;
  marketCount: number;
}

export function Header({ lastUpdated, isConnected, marketCount }: HeaderProps) {
  const formattedTime = lastUpdated
    ? lastUpdated.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })
    : "—";

  return (
    <header className="h-12 border-b border-border/50 bg-card/30 backdrop-blur-sm flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <span className="text-xs font-bold text-white">K</span>
          </div>
          <h1 className="text-sm font-semibold tracking-tight">
            KalshIQ
          </h1>
        </div>
        <Separator orientation="vertical" className="h-5" />
        <span className="text-xs text-muted-foreground font-medium">
          Quantitative Research & Execution
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="font-mono tabular-nums">{marketCount}</span>
          <span>markets</span>
        </div>
        <Separator orientation="vertical" className="h-4" />
        <div className="flex items-center gap-1.5">
          <div
            className={`h-1.5 w-1.5 rounded-full ${
              isConnected
                ? "bg-emerald-400 shadow-sm shadow-emerald-400/50 animate-pulse"
                : "bg-red-400 shadow-sm shadow-red-400/50"
            }`}
          />
          <span className="text-xs text-muted-foreground">
            {isConnected ? "Live" : "Disconnected"}
          </span>
        </div>
        <Separator orientation="vertical" className="h-4" />
        <span className="text-xs font-mono tabular-nums text-muted-foreground">
          {formattedTime}
        </span>
      </div>
    </header>
  );
}
