import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  content: ["./src/**/*.tsx"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
        head: ["var(--font-head)", ...fontFamily.sans],
      },
      boxShadow: {
        xs: "1px 1px 0 0 #000",
        md: "3px 3px 0 0 #000",
        "3xl": "10px 10px 0 0 #000",
      },
      colors: {
        primary: {
          50: "#FFFEF0",
          100: "#FFFAC2",
          200: "#FFF299",
          300: "#FFE766",
          400: "#FFDB33",
          500: "#FFCC00",
          600: "#FFB700",
          700: "#FF9F00",
          800: "#E68A00",
          900: "#B36B00",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
