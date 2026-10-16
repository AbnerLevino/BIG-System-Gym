// Config do Tailwind (CSS via classes utilitárias, ex: className="bg-slate-900 p-4").
// "content" diz onde o Tailwind deve procurar classes usadas, pra gerar só o CSS necessário.
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Instrument Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        heading: ['"Outfit"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}