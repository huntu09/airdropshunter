"use client"

import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import AirdropCard from "@/components/airdrop-card"

const mockAirdrop = {
  id: "1",
  title: "Test Airdrop",
  description: "Test Description",
  short_description: "Short test",
  category: "DeFi",
  status: "active" as const,
  reward_amount: "100 TOKENS",
  reward_type: "token" as const,
  blockchain: "Ethereum",
  difficulty_level: "easy" as const,
  estimated_time: "5 minutes",
  start_date: "2024-01-01T00:00:00Z",
  end_date: "2024-12-31T23:59:59Z",
  logo_url: "https://example.com/logo.png",
  website_url: "https://example.com",
  max_participants: 1000,
  participants_count: 100,
  featured: false,
  views_count: 50,
  priority: 1,
  created_by: "admin",
  created_at: "2024-01-01T00:00:00Z",
}

describe("AirdropCard", () => {
  it("renders airdrop information correctly", () => {
    render(<AirdropCard airdrop={mockAirdrop} />)

    expect(screen.getByText("Test Airdrop")).toBeInTheDocument()
    expect(screen.getByText("100 TOKENS")).toBeInTheDocument()
    expect(screen.getByText("Ethereum")).toBeInTheDocument()
    expect(screen.getByText("Easy")).toBeInTheDocument()
  })

  it("handles click events", () => {
    const mockOnClick = vi.fn()
    render(<AirdropCard airdrop={mockAirdrop} onClick={mockOnClick} />)

    fireEvent.click(screen.getByRole("button"))
    expect(mockOnClick).toHaveBeenCalledWith(mockAirdrop)
  })

  it("displays correct status badge", () => {
    render(<AirdropCard airdrop={mockAirdrop} />)
    expect(screen.getByText("Active")).toBeInTheDocument()
  })
})
