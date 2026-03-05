import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Apple from "next-auth/providers/apple"
import Credentials from "next-auth/providers/credentials"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import clientPromise from "./lib/mongodb"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    Google,
    Apple,
    Credentials({
    
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      
      async authorize(credentials) {
     
        if (credentials.email === "admin@test.com") {
          return { id: "1", name: "Admin", email: "admin@test.com", role: "ADMIN" }
        }
        return null
      }
    }),
  ],

  session: { strategy: "jwt" },
  
  callbacks: {
    
    async jwt({ token, user }) {
   
      if (user) token.role = user.role || "USER"
      return token
    },

    async session({ session, token }) {
    
      if (session.user) session.user.role = token.role as string
      return session
    },

    authorized({ request, auth }) {
      const { pathname } = request.nextUrl
 
      if (pathname.startsWith("/admin")) {
        return auth?.user?.role === "ADMIN"
      }
      return true
    },

  },
})


declare module "next-auth" {
  interface Session {
    user: {
      role?: string
    } & import("next-auth").DefaultSession["user"]
  }
  interface User {
    role?: string
  }
}