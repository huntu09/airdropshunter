import { setupServer } from "msw/node"
import { rest } from "msw"

export const handlers = [
  // Mock Supabase API
  rest.get("https://test.supabase.co/rest/v1/airdrops", (req, res, ctx) => {
    return res(
      ctx.json([
        {
          id: "1",
          title: "Test Airdrop",
          description: "Test Description",
          status: "active",
          reward_amount: "100 TOKENS",
          blockchain: "Ethereum",
          created_at: "2024-01-01T00:00:00Z",
        },
      ]),
    )
  }),

  // Mock auth endpoints
  rest.post("https://test.supabase.co/auth/v1/token", (req, res, ctx) => {
    return res(
      ctx.json({
        access_token: "test-token",
        user: {
          id: "test-user-id",
          email: "test@example.com",
          role: "user",
        },
      }),
    )
  }),
]

export const server = setupServer(...handlers)
