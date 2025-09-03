import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: string
      provider?: string
    }
  }

  interface User {
    id: string
    role: string
    provider?: string
  }

  interface AdapterUser {
    id: string
    name?: string | null
    email?: string | null
    emailVerified?: Date | null
    image?: string | null
    role: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
    provider?: string
  }
}
