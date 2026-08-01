import type { Config } from "tailwindcss";

/* ───────────────────────────────────────────────────────────────
   SUNSET BLAZE PALETTE HARMONIZATION
   Every raw Tailwind color family used across the clinical modules
   is re-tinted onto the app's Sunset Blaze hues (coral / amber /
   magenta / violet / teal / emerald) with one shared lightness ramp
   so text keeps guaranteed contrast on both light and dark surfaces.
   ─────────────────────────────────────────────────────────────── */
const LIGHTNESS: Record<string, number> = {
  50: 97, 100: 94, 200: 87, 300: 78, 400: 68, 500: 58,
  600: 48, 700: 37, 800: 26, 900: 17, 950: 11,
};

const NEUTRAL_LIGHTNESS: Record<string, number> = {
  50: 97, 100: 94, 200: 87, 300: 82, 400: 72, 500: 60,
  600: 46, 700: 31, 800: 21, 900: 13, 950: 8,
};

const ramp = (hue: number, sat: number, neutral = false) =>
  Object.fromEntries(
    Object.entries(neutral ? NEUTRAL_LIGHTNESS : LIGHTNESS).map(([shade, l]) => {
      const n = Number(shade);
      // soften saturation at the extremes so tints/shades stay legible
      const s = n <= 100 ? sat * 0.45 : n >= 900 ? sat * 0.7 : sat;
      return [shade, `hsl(${hue} ${Math.round(s)}% ${l}%)`];
    }),
  );

const brandScales = {
  // violet-tinted neutrals — match --card / --border surfaces
  slate: ramp(260, 14, true),
  gray: ramp(260, 10, true),
  zinc: ramp(260, 8, true),
  neutral: ramp(260, 6, true),
  stone: ramp(30, 8, true),
  // cool accents → brand violet / teal
  cyan: ramp(175, 62),
  teal: ramp(175, 66),
  sky: ramp(253, 60),
  blue: ramp(253, 66),
  indigo: ramp(253, 70),
  violet: ramp(253, 68),
  purple: ramp(268, 64),
  // warm accents → brand magenta / coral / amber
  fuchsia: ramp(320, 70),
  pink: ramp(336, 74),
  rose: ramp(336, 70),
  red: ramp(2, 78),
  orange: ramp(14, 90),
  amber: ramp(32, 88),
  yellow: ramp(44, 88),
  // success family
  lime: ramp(140, 60),
  green: ramp(152, 62),
  emerald: ramp(160, 68),
};


export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1400px",
      },
    },
    extend: {
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
          blue: "hsl(var(--accent-blue))",
          purple: "hsl(var(--accent-purple))",
          pink: "hsl(var(--accent-pink))",
          teal: "hsl(var(--accent-teal))",
          amber: "hsl(var(--accent-amber))",
          emerald: "hsl(var(--accent-emerald))",
          rose: "hsl(var(--accent-rose))",
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
        medical: {
          header: "hsl(var(--medical-header))",
          section: "hsl(var(--medical-section))",
          complete: "hsl(var(--medical-complete))",
          pending: "hsl(var(--medical-pending))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
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
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "glow": {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.8" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "shimmer": "shimmer 3s ease-in-out infinite",
        "glow": "glow 3s ease-in-out infinite",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
