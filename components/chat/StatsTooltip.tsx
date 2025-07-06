"use client"

import { Info } from "lucide-react"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export interface StatsTooltipProps {
  stats: {
    responseTime: number
    timeToFirstToken: number
    tokensPerSecond: number
  }
}

export function StatsTooltip({ stats }: StatsTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={100} disableHoverableContent={false}>
        <TooltipTrigger asChild>
          <span
            className="flex flex-row items-end justify-end cursor-pointer self-end my-1 gap-1"
            style={{ zIndex: 1 }}
            tabIndex={0}
            role="button"
            aria-label="Show stats"
          >
            <Info className="w-4 h-4 dark:text-amber-400" />
            <span className="text-xs font-medium dark:text-amber-400">
              Stats
            </span>
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" align="end" className="max-w-xs text-xs p-0">
          <table className="w-fit text-left text-xs border border-border rounded-md px-4 pb-3 mx-2 my-2">
            <tbody>
              <tr className="border-b border-border last:border-b-0">
                <td className="pr-2 py-2 px-3 font-medium border-r border-border dark:text-amber-300">
                  <b>Response</b>
                </td>
                <td className="py-2 px-3">{stats.responseTime.toFixed(0)}ms</td>
              </tr>
              <tr className="border-b border-border last:border-b-0">
                <td className="pr-2 py-2 px-3 font-medium border-r border-border dark:text-amber-300">
                  <b>1st Token</b>
                </td>
                <td className="py-2 px-3">
                  {stats.timeToFirstToken.toFixed(0)}ms
                </td>
              </tr>
              <tr>
                <td className="pr-2 py-2 px-3 font-medium border-r border-border dark:text-amber-300">
                  <b>Tokens/sec</b>
                </td>
                <td className="py-2 px-3">
                  {stats.tokensPerSecond.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
