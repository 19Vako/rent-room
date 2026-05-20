import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/auth/login",
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

      const isAdminRoute = nextUrl.pathname.startsWith("/admin");
      if (isAdminRoute) {
        if (!isLoggedIn) return false;
        if (auth.user?.role !== "ADMIN") {
          return Response.redirect(new URL("/", nextUrl));
        }
        return true;
      }

      const publicAuthRoutes = [
        "/auth/login",
        "/auth/forgot-password",
        "/auth/forgot-password/reset-password",
      ];

      const isAuthRoute = publicAuthRoutes.includes(nextUrl.pathname);
      if (isAuthRoute) {
        if (isLoggedIn) {
          if (auth.user?.role === "ADMIN") {
            return Response.redirect(new URL("/admin", nextUrl));
          }

          return Response.redirect(new URL("/", nextUrl));
        }
        return true;
      }

      if (!isLoggedIn) {
        return false;
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
    } & import("next-auth").DefaultSession["user"];
  }
  interface User {
    role?: "ADMIN" | "GUEST";
  }
}
