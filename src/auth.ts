import { type DefaultSession, AuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Adapter } from "next-auth/adapters";
import Google from "next-auth/providers/google";
import LinkedIn, { LinkedInProfile } from "next-auth/providers/linkedin";
import EmailProvider from "next-auth/providers/email";
import { prisma } from "./lib/prisma";

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
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: "student", // Default role, will be overridden if provided
        };
      },
    }),
    LinkedIn({
      clientId: process.env.LINKEDIN_CLIENT_ID || "",
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET || "",
      client: { token_endpoint_auth_method: "client_secret_post" },
      profile: (profile: LinkedInProfile) => ({
        id: profile.sub,
        name: profile.name,
        email: profile.email,
        image: profile.picture,
        role: "student", // Default role, will be overridden if provided
      }),
      wellKnown:
        "https://www.linkedin.com/oauth/.well-known/openid-configuration",
      authorization: {
        params: {
          scope: "openid profile email",
        },
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
    async session({ session, token }) {
      if (token?.sub) {
        // Fetch user data from database to get the latest role
        const prismaUser = await prisma.user.findUnique({
          where: { id: token.sub },
        });

        return {
          ...session,
          user: {
            ...session.user,
            id: token.sub,
            role: prismaUser?.role || "student",
          },
        };
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
    async jwt({ token, account, user }) {
      if (account) {
        token.accessToken = account.access_token;
        console.log("OAuth Access Token:", token.accessToken);
      }

      // Include user ID in token for session callback
      if (user) {
        token.sub = user.id;
      }

      return token;
    },
    async signIn({ user, account, email, credentials }) {
      try {
        // Get the role from the appropriate source based on the provider
        let role: string | undefined;

        if (account?.provider === "email" && email) {
          role = (email as { role?: string }).role;
        } else if (credentials) {
          role = (credentials as { role?: string }).role;
        } else if (
          account?.provider === "google" ||
          account?.provider === "linkedin"
        ) {
          // For OAuth providers, the role is passed in the callbackUrl's state parameter
          // Extract it from the account state if available
          if (account.state && typeof account.state === "string") {
            try {
              // The state might be a JSON string or have the role as a URL parameter
              if (account.state.includes("role=")) {
                const stateParams = new URLSearchParams(account.state);
                const roleValue = stateParams.get("role");
                if (roleValue) {
                  role = roleValue;
                }
              } else {
                // Try parsing as JSON
                const stateObj = JSON.parse(account.state);
                if (
                  stateObj &&
                  typeof stateObj === "object" &&
                  "role" in stateObj
                ) {
                  role = stateObj.role;
                }
              }
            } catch (e) {
              console.error("Error parsing state:", e);
            }
          }
        }

        // If a valid role is provided, update the user's role
        if (role && ["student", "teacher"].includes(role)) {
          // Update the user's role in the database
          await prisma.user.update({
            where: { id: user.id },
            data: { role },
          });
          // Update the user object for this session
          user.role = role;
        } else {
          // If no valid role is provided, ensure the user has a default role
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
          });

          if (!dbUser?.role || dbUser.role === "user" || dbUser.role === "") {
            // Update to default role "student"
            await prisma.user.update({
              where: { id: user.id },
              data: { role: "student" },
            });
            user.role = "student";
          }
        }

        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return true; // Still allow sign in even if role update fails
      }
    },
  },
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
  debug: true, // Enable debug logs
};

// Helper function to get the session on the server side
export const getServerAuthSession = () => getServerSession(authOptions);

// For backward compatibility
export { getServerAuthSession as auth };
