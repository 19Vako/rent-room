import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Apple from "next-auth/providers/apple"
import Credentials from "next-auth/providers/credentials"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import bcrypt from "bcryptjs"
import clientPromise from "./lib/mongodb"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  session: { strategy: "jwt" },

  providers: [
    Google,
    Apple,
    Credentials({
    
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      
      async authorize(credentials) {
     
        if (!credentials?.email || !credentials?.password) return null;

        const client = await clientPromise;
        const db = client.db("courseWork");
        
        const user = await db.collection("users").findOne({ email: credentials.email });
        
        if (!user || !user.password) {
          throw new Error("User not found or password not set");
        }

        const isPasswordValid = await bcrypt.compare(credentials.password as string, user.password);
        
        if (!isPasswordValid) {
          throw new Error("Invalid password");
        }

        return { 
            id: user._id.toString(), 
            name: user.name, 
            email: user.email, 
            role: user.role 
        };
      }

    }),
  ],

  callbacks: {
    
    async jwt({ token, user }) {
   
      if(user){
        token.id = user.id;
        if (user.email === process.env.ADMIN_EMAIL) {
          token.role = "ADMIN";
        } else {
          token.role = user.role || "USER";
        }
      }
      
      return token;
    },

    async session({ session, token }) {
    
      if (session.user){
        session.user.id = token.id as string;
        session.user.role = token.role as "ADMIN" | "GUEST";
      }
        
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
    role?: "ADMIN" | "GUEST";
  }
}