import type { NextAuthConfig } from "next-auth";

// Edge-safe base config (no providers / no Node-only deps like Prisma or
// bcrypt) so it can be used from middleware, which runs on the Edge runtime.
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};
