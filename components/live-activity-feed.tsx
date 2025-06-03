"use client"

import { useState } from "react"
import { Activity, Users, Trophy, Zap } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRealTime } from "./real-time-provider"
import { formatDistanceToNow } from "date-fns"

export function LiveActivityFeed() {
  const { activityFeed, isConnected } = useRealTime()
  const [filter, setFilter] = useState<"all" | "user_action" | "system_event" | "achievement">("all")

  const filteredActivities = activityFeed.filter((activity) => filter === "all" || activity.type === filter)

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "user_action":
        return <Users className="h-4 w-4" />
      case "achievement":
        return <Trophy className="h-4 w-4" />
      case "system_event":
        return <Zap className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case "user_action":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20"
      case "achievement":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
      case "system_event":
        return "bg-purple-500/10 text-purple-600 border-purple-500/20"
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-500/20"
    }
  }

  const formatActivityAction = (action: string) => {
    return action.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Live Activity Feed
            {isConnected && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-green-600">Live</span>
              </div>
            )}
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={filter} onValueChange={(value: any) => setFilter(value)} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all" className="text-xs">
              All
            </TabsTrigger>
            <TabsTrigger value="user_action" className="text-xs">
              Users
            </TabsTrigger>
            <TabsTrigger value="achievement" className="text-xs">
              Achievements
            </TabsTrigger>
            <TabsTrigger value="system_event" className="text-xs">
              System
            </TabsTrigger>
          </TabsList>

          <TabsContent value={filter} className="mt-4">
            {filteredActivities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No activity yet</p>
                <p className="text-sm">Activity will appear here in real-time</p>
              </div>
            ) : (
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {filteredActivities.map((activity, index) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                        {getActivityIcon(activity.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {formatActivityAction(activity.action)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                          </span>
                        </div>

                        <p className="text-sm text-foreground mb-1">{activity.details}</p>

                        {activity.metadata && (
                          <div className="text-xs text-muted-foreground">
                            {Object.entries(activity.metadata).map(([key, value]) => (
                              <span key={key} className="mr-3">
                                {key}: {String(value)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
