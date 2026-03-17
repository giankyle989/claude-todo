import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isAuthPage =
        nextUrl.pathname === "/login" || nextUrl.pathname === "/register"

      if (!isLoggedIn && !isAuthPage) {
        return false // redirects to signIn page
      }

      if (isLoggedIn && isAuthPage) {
        return Response.redirect(new URL("/", nextUrl))
      }

      return true
    },
    jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    session({ session, token }) {
      if (session.user) session.user.id = token.id as string
      return session
    },
  },
  providers: [], // providers added in auth.ts (not needed for middleware)
} satisfies NextAuthConfig
