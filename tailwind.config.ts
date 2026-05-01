import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/app/**/*.{ts,tsx}", "./src/components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#16201b",
        paper: "#f7f5ef",
        moss: "#45624e",
        signal: "#b5462f",
        slate: "#344156",
      },
    },
  },
  plugins: [],
};

export default config;
