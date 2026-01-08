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
        'bg-base': '#040510',
        'bg-surface': '#080c19',
        'bg-elevated': '#0d1324',
        'accent-cyan': '#3de8ff',
        'accent-purple': '#7c4dff',
      },
    },
  },
  plugins: [],
};
export default config;
