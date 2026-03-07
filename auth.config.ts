import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },  
  providers: [], 
  callbacks: {
   
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role || "GUEST";  
      }
      return token;
    },
 
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "ADMIN" | "GUEST";
      }
      return session;
    },
   
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      
      const isAdminRoute = nextUrl.pathname.startsWith('/admin');
      if (isAdminRoute) {
        if (!isLoggedIn) return false;  
        if (auth.user.role !== "ADMIN") {
          return Response.redirect(new URL('/', nextUrl));  
        }
        return true; 
      }

      if (!isLoggedIn) {
        return false;
      }

      const isAuthRoute = nextUrl.pathname === '/login' || nextUrl.pathname === '/register';
      if (isAuthRoute) {
        if (isLoggedIn) {
          return Response.redirect(new URL('/', nextUrl)); 
        }
        return true;
      }

      return true; 
    },
  },
} satisfies NextAuthConfig;

 
declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      role?: "ADMIN" | "GUEST";
    } & import("next-auth").DefaultSession["user"]
  }
  interface User {
    role?: "ADMIN" | "GUEST";
  }
}