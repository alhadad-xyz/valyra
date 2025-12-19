import type { Config } from "tailwindcss";

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
                // Base Blue primary
                primary: "#0052FF",
                "primary-light": "#3374FF",
                "primary-dark": "#0041CC",

                // Accent colors
                success: "#10B981",
                warning: "#F59E0B",
                error: "#EF4444",

                // Backgrounds
                "background-light": "#FFFFFF",
                "background-dark": "#111827",
                "background-light-secondary": "#F9FAFB",
                "background-dark-elevated": "#1F2937",

                // Text
                "text-main": "#111827",
                "text-muted": "#6B7280",
            },
            fontFamily: {
                display: ["Spline Sans", "sans-serif"],
                sans: [
                    "Spline Sans",
                    "system-ui",
                    "-apple-system",
                    "BlinkMacSystemFont",
                    "Segoe UI",
                    "Roboto",
                    "sans-serif",
                ],
            },
            borderRadius: {
                DEFAULT: "0.5rem",  // 8px
                lg: "0.75rem",      // 12px
                xl: "1rem",         // 16px
            },
            maxWidth: {
                "8xl": "1440px",
            },
        },
    },
    plugins: [],
};

export default config;
