import type { Config } from "tailwindcss";
import { tokens } from "ui/styles/tokens";

const config: Config = {
    darkMode: "class",
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
        // Include UI package components
        "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                ...tokens.colors,
                // Custom aliases if needed to match legacy usage, though tokens.colors should cover most
                "background-light": tokens.colors.background.light,
                "background-dark": tokens.colors.background.dark,
                "background-light-secondary": tokens.colors.background["light-secondary"],
                "background-dark-elevated": tokens.colors.background["dark-elevated"],
                "text-main": tokens.colors.text.main,
                "text-muted": tokens.colors.text.muted,
            },
            fontFamily: tokens.typography.fontFamily as any,
            borderRadius: tokens.borderRadius,
            maxWidth: {
                "8xl": "1440px",
            },
        },
    },
    plugins: [],
};

export default config;
