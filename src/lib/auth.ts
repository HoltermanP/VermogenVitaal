import { JWT } from "next-auth/jwt"
import GoogleProvider from "next-auth/providers/google"
import type { Session } from "next-auth"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const authOptions: any = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "dummy-client-id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "dummy-client-secret",
    }),
  ],
  callbacks: {
    session: async ({ session, token }: { session: Session; token: JWT }) => {
      if (session?.user && token?.sub) {
        session.user.id = token.sub
        session.user.tier = 'FREE'
        session.user.role = 'USER'
      }
      return session
    },
    jwt: async ({ user, token }: { user?: { id: string }; token: JWT }) => {
      if (user) {
        token.sub = user.id
      }
      return token
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
}
