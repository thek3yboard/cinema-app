import type { Config } from "tailwindcss";
import { nextui } from "@nextui-org/react";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        "aero-blue": "#506691",
        "blueish-gray": "#333d4f",
        "pastel-yellow": "#d8e3bf",
        "midnight-green": "#114b5f",
        "teal": "#028090",
        "nyanza": "#e4fde1",
        "lapis-lazuli": "#456990",
        "bright-pink": "#f45b69"
      },
    },
  },
  darkMode: "class",
  plugins: [nextui()]
};
export default config;
