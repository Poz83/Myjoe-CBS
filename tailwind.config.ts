import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'bg-base': '#0D0D0D',      // page background
        'bg-surface': '#1A1A1A',   // cards, panels
        'bg-elevated': '#262626',  // modals, dropdowns
        'bg-canvas': '#171717',    // neutral canvas surround
      },
    },
  },
  plugins: [],
};
export default config;
