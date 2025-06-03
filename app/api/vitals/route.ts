import { NextResponse } from "next/server"
import { logger } from "@/lib/utils/logger"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Log the web vitals data
    logger.info("Web Vitals", body)

    // Here you could store the data in a database or send to an analytics service

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error("Error processing web vitals", { error })
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
