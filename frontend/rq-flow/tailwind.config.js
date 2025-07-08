/** @type {import('tailwindcss').Config} */
const plugin = require("tailwindcss/plugin")
module.exports = {
  content: ["./src/**/*.{js,ts,tsx,jsx}"],
  darkMode: ["class", "class"],
  important: true,
  theme: {
    fontFamily: {
      sans: [
        '"Inter var", sans-serif, -apple-system',
        {
          fontFeatureSettings: '"cv11", "ss01"',
          fontVariationSettings: '"opsz" 32',
        },
      ],
      serif: ["Merriweather", "serif"],
      // mono: [
      //   "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
      //   {
      //     fontFeatureSettings: '"cv11", "ss01"',
      //     fontVariationSettings: '"opsz" 32',
      //   },
      // ]
    },
    extend: {
      spacing: {
        128: "32rem",
      },
      borderColor: {
        "red-outline": "rgba(255, 0, 0, 0.8)",
        "green-outline": "rgba(72, 187, 120, 0.7)",
      },
      boxShadow: {
        "red-outline": "0 0 10px rgba(255, 0, 0, 0.5)",
        "green-outline": "0 0 5px rgba(72, 187, 120, 0.7)",
      },
      animation: {
        "pulse-green": "pulseGreen 1s linear",
        "pulse-red": "pulseRed 1s linear infinite",
        "pulse-gray-to-orange":
          "pulseGrayToOrange 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "pulse-orange": "pulseOrange 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "pulse-strong": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        pulseGreen: {
          "0%": {
            boxShadow: "0 0 0 0 rgba(72, 187, 120, 0.7)",
          },
          "100%": {
            boxShadow: "0 0 0 10px rgba(72, 187, 120, 0)",
          },
        },
        pulseRed: {
          "0%": {
            boxShadow: "0 0 0 0 rgba(255, 0, 0, 0.5)",
          },
          "100%": {
            boxShadow: "0 0 0 10px rgba(255, 0, 0, 0)",
          },
        },
        pulseOrange: {
          "0%": {
            boxShadow: "0 0 0 0 rgba(0, 0, 0, 0.2)",
          },
          "100%": {
            boxShadow: "0 0 0 10px rgba(255, 165, 0, 1)",
          },
        },
        pulseGrayToOrange: {
          "0%": {
            boxShadow: "0 0 0 0 rgba(255, 0, 0, 0.5)",
          },
          "100%": {
            boxShadow: "0 0 0 0 rgba(255, 165, 0, 0.5)",
          },
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms")({
      strategy: "class", // only generate classes
    }),
    plugin(function ({ addUtilities }) {
      addUtilities({
        ".scrollbar-hide": {
          /* IE and Edge */
          "-ms-overflow-style": "none",
          /* Firefox */
          "scrollbar-width": "none",
          /* Safari and Chrome */
          "&::-webkit-scrollbar": {
            display: "none",
          },
        },
        ".arrow-hide": {
          "&::-webkit-inner-spin-button": {
            "-webkit-appearance": "none",
            margin: 0,
          },
          "&::-webkit-outer-spin-button": {
            "-webkit-appearance": "none",
            margin: 0,
          },
        },
        ".password": {
          "-webkit-text-security": "disc",
          "font-family": "text-security-disc",
        },
        ".custom-scroll": {
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "#f1f1f1",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#ccc",
            borderRadius: "999px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            backgroundColor: "#bbb",
          },
        },
      })
    }),
    require("tailwindcss-animate"),
  ],
}
