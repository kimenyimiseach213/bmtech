import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        navy: "#0B1F3A",
        brand: "#155EEF",
        electric: "#2563EB",
        accent: "#F59E0B",
        mist: "#F4F7FB",
        ink: "#111827",
        slate: "#64748B",
        line: "#E2E8F0",
      },
      boxShadow: { soft: "0 12px 40px rgba(11, 31, 58, .08)" },
      fontFamily: { sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"] },
    },
  },
  plugins: [],
};

export default config;
