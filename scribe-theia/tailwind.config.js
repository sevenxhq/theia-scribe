export const darkMode = "class";

const config = {
  content: ["**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        emerald: {},
      },
      fontSize: {
        custom: "8px",
      },
    },
  },
  plugins: [],
};
export default config;
