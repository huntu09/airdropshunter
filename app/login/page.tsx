import type { Metadata } from "next"
import LoginPageClient from "./login-page-client"

export const metadata: Metadata = {
  title: "Admin Login | Airdrops Hunter",
  description: "Login to access the admin dashboard",
}

export default function LoginPage() {
  return <LoginPageClient />
}
