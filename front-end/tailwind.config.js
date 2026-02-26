/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
      },
      colors: {
        gate: {
          primary: '#00C6FF',
          glow: '#00F5A0',
        },
      },
      backgroundImage: {
        aurora:
          'radial-gradient(circle at 20% 20%, rgba(14,165,233,0.3), transparent 45%), radial-gradient(circle at 80% 0%, rgba(16,185,129,0.35), transparent 40%), linear-gradient(135deg, #020617 0%, #020617 45%, #0f172a 100%)',
      },
      boxShadow: {
        card: '0 35px 60px -15px rgba(15,23,42,0.65)',
      },
    },
  },
  plugins: [],
}

