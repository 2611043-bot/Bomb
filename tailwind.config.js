/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"Share Tech Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        bomb: {
          dark: '#121316',
          panel: '#1c1e24',
          metal: '#282b34',
          border: '#383d4a',
          accent: '#e63946',
          warning: '#f4a261',
          ledRed: '#ff2a2a',
          ledGreen: '#00ff66',
          ledYellow: '#ffcc00',
        }
      },
      boxShadow: {
        'led-red': '0 0 10px #ff2a2a, 0 0 20px #ff2a2a',
        'led-green': '0 0 10px #00ff66, 0 0 20px #00ff66',
        'led-yellow': '0 0 10px #ffcc00, 0 0 20px #ffcc00',
      }
    },
  },
  plugins: [],
}
