import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import { authConfig } from "./auth.config"
import bcrypt from "bcryptjs"
import clientPromise from "./lib/mongodb"

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: MongoDBAdapter(clientPromise, { databaseName: process.env.DB_NAME }),

  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      profile(profile) {
      const userRole = profile.email === process.env.ADMIN_EMAIL ? "ADMIN" : "GUEST";
      
      return {
        id: profile.sub,
        name: profile.name,
        email: profile.email,
        role: userRole,
        orders: [], 
      }
      }
    }),
    Credentials({
    
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      
      async authorize(credentials) {
     
        if (!credentials?.email || !credentials?.password) return null;

        const client = await clientPromise;
        const db = client.db(process.env.DB_NAME);
        
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

})
