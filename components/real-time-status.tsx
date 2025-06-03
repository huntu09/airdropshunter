"use client"
import { Wifi, WifiOff } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useRealTime } from "./real-time-provider"

export function RealTimeStatus() {
  const { isConnected } = useRealTime()

  return (
    <Badge variant={isConnected ? "default" : "destructive"} className="flex items-center gap-1 text-xs">
      {isConnected ? (
        <>
          <Wifi className="h-3 w-3" />
          Live
        </>
      ) : (
        <>
          <WifiOff className="h-3 w-3" />
          Offline
        </>
      )}
    </Badge>
  )
}
