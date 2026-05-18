import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        gold: "#F7C948",
        ice: "#F8FAFC",
        deep: "#12355B",
        field: "#19A974",
        ink: "#102033"
      },
      boxShadow: {
        soft: "0 18px 50px rgba(18, 53, 91, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
