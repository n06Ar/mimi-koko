import type { NextAuthConfig } from "next-auth";

/**
 * Edge Runtime 対応の auth 設定（Prisma を含まない）
 * middleware.ts から参照される
 */
export const authConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const publicPaths = ["/login", "/signup", "/api/auth"];
      const isPublicPath = publicPaths.some((path) =>
        pathname.startsWith(path)
      );

      if (!auth?.user && !isPublicPath) {
        return false;
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
