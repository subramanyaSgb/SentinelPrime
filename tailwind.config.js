/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"Share Tech Mono"', 'monospace'],
      },
      colors: {
        void: '#020802',
        deep: '#030C03',
        panel: '#051005',
        card: '#071407',
        phosphor: {
          DEFAULT: '#00FF41',
          dim: '#00AA2B',
          faint: 'rgba(0,255,65,0.15)',
          glow: 'rgba(0,255,65,0.4)',
        },
        amber: {
          DEFAULT: '#FFB700',
          dim: 'rgba(255,183,0,0.6)',
        },
        'red-critical': {
          DEFAULT: '#FF2020',
          dim: 'rgba(255,32,32,0.5)',
        },
        'white-data': 'rgba(200,255,200,0.9)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'blink': 'blink 1s step-end infinite',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}
