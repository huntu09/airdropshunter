"use client"

import type React from "react"

// Hooks for toast notifications
import { useState, useEffect, useCallback } from "react"

type ToastType = "default" | "destructive" | "success" | "warning" | "info"

export interface Toast {
  id: string
  title?: string
  description?: string
  action?: React.ReactNode
  variant?: ToastType
  duration?: number
}

interface ToastState {
  toasts: Toast[]
}

const TOAST_LIMIT = 5
const TOAST_REMOVE_DELAY = 1000

export const useToast = () => {
  const [state, setState] = useState<ToastState>({
    toasts: [],
  })

  const { toasts } = state

  const removeToast = useCallback((id: string) => {
    setState((prevState) => ({
      ...prevState,
      toasts: prevState.toasts.filter((toast) => toast.id !== id),
    }))
  }, [])

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9)

    setState((prevState) => {
      const newToasts = [{ id, ...toast }, ...prevState.toasts].slice(0, TOAST_LIMIT)

      return {
        ...prevState,
        toasts: newToasts,
      }
    })

    return id
  }, [])

  const updateToast = useCallback((id: string, toast: Partial<Omit<Toast, "id">>) => {
    if (!id) return

    setState((prevState) => {
      const newToasts = prevState.toasts.map((t) => (t.id === id ? { ...t, ...toast } : t))

      return {
        ...prevState,
        toasts: newToasts,
      }
    })
  }, [])

  useEffect(() => {
    const timeouts: ReturnType<typeof setTimeout>[] = []

    toasts.forEach((toast) => {
      const { id, duration = 5000 } = toast

      if (duration > 0) {
        const timeout = setTimeout(() => {
          removeToast(id)
        }, duration)

        timeouts.push(timeout)
      }
    })

    return () => {
      timeouts.forEach((timeout) => clearTimeout(timeout))
    }
  }, [toasts, removeToast])

  return {
    toasts,
    addToast,
    removeToast,
    updateToast,
    toast: (props: Omit<Toast, "id">) => addToast(props),
    success: (props: Omit<Toast, "id" | "variant">) => addToast({ ...props, variant: "success" }),
    error: (props: Omit<Toast, "id" | "variant">) => addToast({ ...props, variant: "destructive" }),
    warning: (props: Omit<Toast, "id" | "variant">) => addToast({ ...props, variant: "warning" }),
    info: (props: Omit<Toast, "id" | "variant">) => addToast({ ...props, variant: "info" }),
  }
}

// Tambahkan di akhir file setelah useToast hook
let toastInstance: ReturnType<typeof useToast> | null = null

export const toast = (props: Omit<Toast, "id">) => {
  if (!toastInstance) {
    // Fallback jika dipanggil di luar komponen React
    console.warn("Toast called outside React component context")
    return ""
  }
  return toastInstance.toast(props)
}

export const success = (props: Omit<Toast, "id" | "variant">) => {
  if (!toastInstance) {
    console.warn("Toast called outside React component context")
    return ""
  }
  return toastInstance.success(props)
}

export const error = (props: Omit<Toast, "id" | "variant">) => {
  if (!toastInstance) {
    console.warn("Toast called outside React component context")
    return ""
  }
  return toastInstance.error(props)
}

export const warning = (props: Omit<Toast, "id" | "variant">) => {
  if (!toastInstance) {
    console.warn("Toast called outside React component context")
    return ""
  }
  return toastInstance.warning(props)
}

export const info = (props: Omit<Toast, "id" | "variant">) => {
  if (!toastInstance) {
    console.warn("Toast called outside React component context")
    return ""
  }
  return toastInstance.info(props)
}

// Helper untuk set instance (dipanggil dari Toaster component)
export const setToastInstance = (instance: ReturnType<typeof useToast>) => {
  toastInstance = instance
}
