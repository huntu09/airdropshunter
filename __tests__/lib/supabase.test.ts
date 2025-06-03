import { describe, it, expect, beforeEach, vi } from "vitest"
import { dbHelpers } from "@/lib/supabase"

// Mock Supabase client
vi.mock("@/lib/supabase", async () => {
  const actual = await vi.importActual("@/lib/supabase")
  return {
    ...actual,
    supabase: {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() =>
              Promise.resolve({
                data: { id: "1", title: "Test" },
                error: null,
              }),
            ),
          })),
        })),
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() =>
              Promise.resolve({
                data: { id: "1", title: "Test" },
                error: null,
              }),
            ),
          })),
        })),
      })),
    },
  }
})

describe("Database Helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("airdrops", () => {
    it("should fetch airdrop by id", async () => {
      const result = await dbHelpers.airdrops.getById("1")
      expect(result).toEqual({ id: "1", title: "Test" })
    })

    it("should create new airdrop", async () => {
      const airdropData = {
        title: "New Airdrop",
        description: "Test description",
        category: "DeFi",
        status: "active" as const,
        reward_amount: "100 TOKENS",
        reward_type: "token" as const,
        blockchain: "Ethereum",
        difficulty_level: "easy" as const,
        estimated_time: "5 minutes",
        start_date: "2024-01-01T00:00:00Z",
        end_date: "2024-12-31T23:59:59Z",
        max_participants: 1000,
        featured: false,
        priority: 1,
        created_by: "admin",
      }

      const result = await dbHelpers.airdrops.create(airdropData)
      expect(result).toEqual({ id: "1", title: "Test" })
    })
  })
})
