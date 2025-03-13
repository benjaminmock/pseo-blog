import { type DefaultSession, AuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Adapter } from "next-auth/adapters";
import Google from "next-auth/providers/google";
import LinkedIn from "next-auth/providers/linkedin";
import EmailProvider from "next-auth/providers/email";
import { prisma } from "./lib/prisma";
import { type User as PrismaUser } from "@prisma/client";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: string;
    email: string | null;
    name: string | null;
    image: string | null;
  }
}

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // LinkedIn({
    //   clientId: process.env.LINKEDIN_CLIENT_ID!,
    //   clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
    //   authorization: {
    //     params: {
    //       scope: "profile email openid",
    //     },
    //   },
    //   userinfo: {
    //     url: "https://api.linkedin.com/v2/userinfo",
    //   },
    //   profile(profile) {
    //     return {
    //       id: profile.sub,
    //       name: profile.name,
    //       email: profile.email,
    //       image: profile.picture,
    //       role: "user",
    //     };
    //   },
    // }),
    // LinkedIn({
    //   clientId: process.env.LINKEDIN_CLIENT_ID!,
    //   clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
    //   authorization: {
    //     params: {
    //       scope: "profile email openid",
    //     },
    //   },
    //   idToken: false, // Disable ID token validation
    //   userinfo: {
    //     url: "https://api.linkedin.com/v2/me", // Correct LinkedIn user info endpoint
    //   },
    //   profile(profile) {
    //     return {
    //       id: profile.id, // LinkedIn uses 'id' instead of 'sub'
    //       name: profile.localizedFirstName + " " + profile.localizedLastName,
    //       email: profile.emailAddress || null,
    //       image:
    //         profile.profilePicture?.["displayImage~"]?.elements[0]
    //           ?.identifiers[0]?.identifier || null,
    //       role: "user",
    //     };
    //   },
    // }),
    // LinkedIn({
    //   clientId: process.env.LINKEDIN_CLIENT_ID!,
    //   clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
    //   authorization: {
    //     params: {
    //       scope: "profile email", // Removed 'openid' to avoid OpenID Connect handling
    //     },
    //   },
    // }),
    LinkedIn({
      clientId: process.env.LINKEDIN_CLIENT_ID!,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "profile email", // ❌ Removed "openid" to avoid OpenID validation errors
        },
      },
      idToken: false, // ✅ Explicitly disable ID token handling
      userinfo: {
        url: "https://api.linkedin.com/v2/me", // Correct LinkedIn API endpoint
      },
      async profile(profile, tokens) {
        const emailRes = await fetch(
          "https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))",
          {
            headers: {
              Authorization: `Bearer ${tokens.access_token}`,
            },
          }
        );
        const emailData = await emailRes.json();
        const email =
          emailData.elements?.[0]?.["handle~"]?.emailAddress || null;

        return {
          id: profile.id, // LinkedIn uses 'id', not 'sub'
          name: `${profile.localizedFirstName} ${profile.localizedLastName}`,
          email,
          image:
            profile.profilePicture?.["displayImage~"]?.elements[0]
              ?.identifiers[0]?.identifier || null,
          role: "user",
        };
      },
    }),

    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: user.id,
          role: (user as PrismaUser).role,
        },
      };
    },
    async redirect({ url, baseUrl }) {
      // Always redirect to /intern after sign in
      if (url.includes("/api/auth/signin") || url.includes("callback")) {
        return `${baseUrl}/intern`;
      }
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  session: {
    strategy: "database",
  },
  debug: process.env.NODE_ENV === "development",
};

// Helper function to get the session on the server side
export const getServerAuthSession = () => getServerSession(authOptions);

// For backward compatibility
export { getServerAuthSession as auth };
