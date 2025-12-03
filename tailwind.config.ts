import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                handwriting: ['var(--font-handwriting)', 'cursive'],
            },
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                cork: '#D4A574',
                wood: '#8B5A3C',
                'memo-yellow': '#FFEB3B',
                'memo-pink': '#FF80AB',
                'memo-green': '#69F0AE',
                'memo-blue': '#40C4FF',
            },
            boxShadow: {
                'memo': '2px 4px 8px rgba(0, 0, 0, 0.2)',
                'memo-hover': '4px 8px 16px rgba(0, 0, 0, 0.3)',
            },
            backgroundImage: {
                'cork-texture': "url('/textures/cork.webp')",
            }
        },
    },
    plugins: [],
};
export default config;
