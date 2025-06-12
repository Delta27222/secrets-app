import "next-auth"
import "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    accessToken?: string
    tokenType?: string
    user: User
  }

  interface User {
    id?: string
    username?: string
    displayName?: string
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string
    tokenType?: string
    id?: string
    username?: string
    displayName?: string
  }
}
