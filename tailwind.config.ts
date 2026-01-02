import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1280px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        heading: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      fontSize: {
        "display": ["4.5rem", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "700" }],
        "h1": ["3.5rem", { lineHeight: "1.15", letterSpacing: "-0.02em", fontWeight: "700" }],
        "h2": ["2.5rem", { lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: "700" }],
        "h3": ["1.875rem", { lineHeight: "1.3", letterSpacing: "-0.01em", fontWeight: "600" }],
        "h4": ["1.5rem", { lineHeight: "1.4", letterSpacing: "-0.01em", fontWeight: "600" }],
        "body": ["1rem", { lineHeight: "1.6", fontWeight: "400" }],
        "body-lg": ["1.125rem", { lineHeight: "1.6", fontWeight: "400" }],
        "small": ["0.875rem", { lineHeight: "1.5", fontWeight: "400" }],
        "caption": ["0.75rem", { lineHeight: "1.4", fontWeight: "500" }],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        purple: {
          DEFAULT: "hsl(271 76% 40%)",
          50: "hsl(270 100% 98%)",
          100: "hsl(270 100% 95%)",
          200: "hsl(270 100% 90%)",
          300: "hsl(270 95% 80%)",
          400: "hsl(271 90% 65%)",
          500: "hsl(271 85% 53%)",
          600: "hsl(271 76% 40%)",
          700: "hsl(271 76% 33%)",
          800: "hsl(271 76% 25%)",
          900: "hsl(271 76% 18%)",
          950: "hsl(271 76% 10%)",
        },
        violet: {
          DEFAULT: "hsl(262 83% 58%)",
          50: "hsl(262 100% 98%)",
          100: "hsl(262 100% 95%)",
          200: "hsl(262 100% 90%)",
          300: "hsl(262 95% 80%)",
          400: "hsl(262 90% 68%)",
          500: "hsl(262 83% 58%)",
          600: "hsl(262 75% 48%)",
          700: "hsl(262 70% 38%)",
          800: "hsl(262 65% 28%)",
          900: "hsl(262 60% 18%)",
        },
      },
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
        "88": "22rem",
        "128": "32rem",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      boxShadow: {
        glow: "0 0 60px hsl(262 83% 58% / 0.3)",
        "glow-sm": "0 0 20px hsl(262 83% 58% / 0.2)",
        "glow-lg": "0 0 100px hsl(262 83% 58% / 0.4)",
        card: "0 8px 32px hsl(222 47% 5% / 0.3)",
        elevated: "0 20px 60px hsl(222 47% 5% / 0.5)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        "pulse-slow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        float: "float 6s ease-in-out infinite",
        "pulse-slow": "pulse-slow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        shimmer: "shimmer 2s linear infinite",
        "fade-in": "fade-in 0.5s ease-out forwards",
        "fade-in-up": "fade-in-up 0.6s ease-out forwards",
        "scale-in": "scale-in 0.3s ease-out forwards",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
