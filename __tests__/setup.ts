import "@testing-library/jest-dom"
import { beforeAll, afterAll, afterEach } from "vitest"
import { cleanup } from "@testing-library/react"
import { server } from "./mocks/server"

// Setup MSW
beforeAll(() => server.listen())
afterEach(() => {
  cleanup()
  server.resetHandlers()
})
afterAll(() => server.close())

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co"
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key"
process.env.NEXT_PUBLIC_SITE_URL = "https://test.airdropshunter.com"
