/** Edge Indicator component — visualizes delta between prediction and market price. */

"use client";

import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { EdgeSignal } from "@/types";

interface EdgeIndicatorProps {
  edgePct: number | null;
  signal: EdgeSignal | null;
  compact?: boolean;
}

function getSignalConfig(signal: EdgeSignal | null, edgePct: number | null) {
  const absEdge = Math.abs(edgePct ?? 0);

  if (!signal || signal === "HOLD") {
    return {
      bgClass: "bg-zinc-800/60 text-zinc-400 border-zinc-700/50",
      barColor: "bg-zinc-600",
      glowClass: "",
      label: "HOLD",
    };
  }

  if (signal === "BUY") {
    return {
      bgClass:
        absEdge > 5
          ? "bg-emerald-950/80 text-emerald-300 border-emerald-700/60"
          : "bg-emerald-950/50 text-emerald-400 border-emerald-800/40",
      barColor: absEdge > 5 ? "bg-emerald-400" : "bg-emerald-600",
      glowClass: absEdge > 8 ? "shadow-emerald-500/20 shadow-sm" : "",
      label: "BUY",
    };
  }

  return {
    bgClass:
      absEdge > 5
        ? "bg-red-950/80 text-red-300 border-red-700/60"
        : "bg-red-950/50 text-red-400 border-red-800/40",
    barColor: absEdge > 5 ? "bg-red-400" : "bg-red-600",
    glowClass: absEdge > 8 ? "shadow-red-500/20 shadow-sm" : "",
    label: "SELL",
  };
}

export function EdgeIndicator({
  edgePct,
  signal,
  compact = false,
}: EdgeIndicatorProps) {
  const config = getSignalConfig(signal, edgePct);
  const displayEdge = edgePct !== null ? `${edgePct > 0 ? "+" : ""}${edgePct.toFixed(1)}%` : "—";
  const barWidth = Math.min(Math.abs(edgePct ?? 0) * 8, 100);

  if (compact) {
    return (
      <Badge
        variant="outline"
        className={`font-mono text-xs tabular-nums ${config.bgClass} ${config.glowClass}`}
      >
        {displayEdge}
      </Badge>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger>
        <div className="flex items-center gap-2 min-w-[140px]">
          <Badge
            variant="outline"
            className={`font-mono text-xs tabular-nums px-2 py-0.5 ${config.bgClass} ${config.glowClass}`}
          >
            {config.label}
          </Badge>
          <div className="flex items-center gap-1.5 flex-1">
            <div className="h-1.5 flex-1 rounded-full bg-zinc-800/80 overflow-hidden">
              <div
                className={`h-full rounded-full ${config.barColor} transition-all duration-500 ease-out`}
                style={{ width: `${barWidth}%` }}
              />
            </div>
            <span className={`text-xs font-mono tabular-nums min-w-[48px] text-right ${
              signal === "BUY" ? "text-emerald-400" : signal === "SELL" ? "text-red-400" : "text-zinc-500"
            }`}>
              {displayEdge}
            </span>
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-xs">
          Edge: {displayEdge} · Signal: {signal ?? "N/A"}
        </p>
      </TooltipContent>
    </Tooltip>
  );
}
