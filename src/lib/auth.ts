import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id       = user.id
        token.role     = (user as { role?: string }).role
        token.fullName = (user as { fullName?: string }).fullName
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id       = token.id as string
        session.user.role     = token.role as string
        session.user.fullName = token.fullName as string
      }
      return session
    },
  },
  providers: [
    Credentials({
      credentials: {
        username: { label: 'Username' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null

        const user = await prisma.user.findFirst({
          where: {
            username: credentials.username as string,
            isActive: true,
          },
        })

        if (!user) return null

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isValid) return null

        return {
          id:       String(user.id),
          name:     user.fullName ?? user.username,
          email:    user.email,
          role:     user.role,
          fullName: user.fullName,
        }
      },
    }),
  ],
})