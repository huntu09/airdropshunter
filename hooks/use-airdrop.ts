"use client"

import { useState, useEffect } from "react"
import { dbHelpers, type Airdrop, type AirdropTask, type Category } from "@/lib/supabase"
import { useAuth } from "@/components/auth-provider"

interface AirdropDetailData extends Airdrop {
  category_data?: Category
  tasks: AirdropTask[]
}

interface UseAirdropOptions {
  incrementViews?: boolean
}

export function useAirdrop(airdropId: string, options: UseAirdropOptions = {}) {
  const [airdrop, setAirdrop] = useState<AirdropDetailData | null>(null)
  const [completedTasks, setCompletedTasks] = useState<string[]>([])
  const [userProgress, setUserProgress] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    if (airdropId) {
      fetchAirdropDetail(airdropId)
    }
  }, [airdropId, user])

  const fetchAirdropDetail = async (id: string) => {
    try {
      setLoading(true)
      setError(null)

      // 1. Fetch airdrop details
      const airdropData = await dbHelpers.airdrops.getById(id)

      // 2. Fetch category data
      let categoryData: Category | null = null
      if (airdropData.category) {
        try {
          categoryData = await dbHelpers.categories.getByName(airdropData.category)
        } catch (error) {
          console.error("Error fetching category:", error)
          // Continue without category data
        }
      }

      // 3. Fetch tasks
      const tasksData = await dbHelpers.tasks.getByAirdropId(id)

      // 4. Fetch user progress if authenticated
      let userTaskProgress: string[] = []
      if (user) {
        try {
          const progressData = await dbHelpers.tasks.getUserProgress(user.id, id)
          userTaskProgress = progressData.map((p) => p.task_id)
        } catch (error) {
          console.error("Error fetching user progress:", error)
          // Continue without progress data
        }
      }

      // 5. Increment view count if option is enabled
      if (options.incrementViews) {
        try {
          await dbHelpers.airdrops.incrementViews(id)
        } catch (error) {
          console.error("Error incrementing view count:", error)
          // Non-critical, continue
        }
      }

      // 6. Create airdrop detail object
      const airdropDetail: AirdropDetailData = {
        ...airdropData,
        category_data: categoryData || undefined,
        tasks: tasksData,
      }

      setAirdrop(airdropDetail)
      setCompletedTasks(userTaskProgress)

      // Calculate progress
      const progress = tasksData.length > 0 ? (userTaskProgress.length / tasksData.length) * 100 : 0
      setUserProgress(progress)
    } catch (error: any) {
      console.error("Error fetching airdrop detail:", error)
      setError(error.message || "Failed to load airdrop details")
    } finally {
      setLoading(false)
    }
  }

  const completeTask = async (taskId: string, completed: boolean) => {
    if (!user || !airdrop) {
      throw new Error("User must be logged in to complete tasks")
    }

    try {
      // Optimistic UI update
      if (completed) {
        setCompletedTasks((prev) => [...prev, taskId])
      } else {
        setCompletedTasks((prev) => prev.filter((id) => id !== taskId))
      }

      // Update progress
      const newCompletedCount = completed ? completedTasks.length + 1 : completedTasks.length - 1
      const newProgress = (newCompletedCount / airdrop.tasks.length) * 100
      setUserProgress(newProgress)

      // Update database
      if (completed) {
        await dbHelpers.tasks.completeTask(user.id, airdropId, taskId)
      } else {
        // Remove task completion
        await dbHelpers.supabase
          .from("user_task_progress")
          .delete()
          .eq("user_id", user.id)
          .eq("airdrop_id", airdropId)
          .eq("task_id", taskId)
      }

      return true
    } catch (error) {
      // Revert optimistic update
      if (completed) {
        setCompletedTasks((prev) => prev.filter((id) => id !== taskId))
      } else {
        setCompletedTasks((prev) => [...prev, taskId])
      }

      throw error
    }
  }

  return {
    airdrop,
    completedTasks,
    userProgress,
    loading,
    error,
    completeTask,
    refetch: () => fetchAirdropDetail(airdropId),
  }
}
