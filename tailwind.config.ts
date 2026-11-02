import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0b0e14",
        panel: "#12151d",
      },
    },
  },
  plugins: [],
};
export default config;
