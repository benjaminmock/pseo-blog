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
        background: "#f5f8f7", // Soft mint background
        foreground: "#2d3748", // Calm dark gray for text
        accent: "#8ca1a5", // Muted teal for accents
        secondary: "#edf6f9", // Light teal for secondary areas
        highlight: "#f4e3cf", // Subtle beige for highlights
        // Dark mode adjustments
        "background-dark": "#1a202c", // Deep dark gray
        "foreground-dark": "#d1d5db", // Soft gray for dark mode text
        "accent-dark": "#4fd1c5", // Bright teal for dark mode accents
      },
      fontFamily: {
        sans: ['"Poppins"', "sans-serif"], // Softer, modern sans-serif font
        serif: ['"Playfair Display"', "serif"], // Elegant serif for titles
      },
      typography: (theme: (arg0: string) => any) => ({
        DEFAULT: {
          css: {
            color: theme("colors.foreground"),
            a: {
              color: theme("colors.accent"),
              "&:hover": {
                textDecoration: "underline",
                color: theme("colors.highlight"),
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
              color: theme("colors.accent-dark"),
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
