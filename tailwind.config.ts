import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#f8fafc", // Light background
        foreground: "#1f2937", // Dark foreground
        accent: "#2563eb", // Accent color for links
        // Dark mode adjustments
        "background-dark": "#1e293b",
        "foreground-dark": "#e2e8f0",
      },
      fontFamily: {
        sans: ['"Inter"', "sans-serif"],
      },
      typography: (theme: (arg0: string) => any) => ({
        DEFAULT: {
          css: {
            color: theme("colors.foreground"),
            a: {
              color: theme("colors.accent"),
              "&:hover": {
                textDecoration: "underline",
              },
            },
            h1: {
              color: theme("colors.foreground"),
              fontWeight: "700",
              fontSize: "2.5rem",
              marginBottom: "1.5rem",
            },
            h2: {
              color: theme("colors.foreground"),
              fontWeight: "600",
              fontSize: "2rem",
              marginBottom: "1rem",
            },
            p: {
              color: theme("colors.foreground"),
              lineHeight: "1.75rem",
              marginBottom: "1rem",
              fontSize: "1.125rem",
            },
            "h1,h2,h3,h4": {
              marginTop: "2rem",
              marginBottom: "1rem",
            },
          },
        },
        dark: {
          css: {
            color: theme("colors.foreground-dark"),
            a: {
              color: theme("colors.accent"),
            },
            h1: {
              color: theme("colors.foreground-dark"),
            },
            h2: {
              color: theme("colors.foreground-dark"),
            },
            p: {
              color: theme("colors.foreground-dark"),
            },
          },
        },
      }),
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
