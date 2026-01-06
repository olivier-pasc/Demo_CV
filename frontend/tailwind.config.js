/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                randstad: {
                    blue: '#2175D9',
                    dark: '#0E213B',
                    orange: '#FF9900',
                    grey: '#F0F2F6',
                    yellow: '#E5FF00',
                }
            },
            fontFamily: {
                sans: ['Graphik', 'Inter', 'system-ui', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
