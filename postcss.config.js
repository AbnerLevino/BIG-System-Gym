// PostCSS processa o CSS antes de chegar no navegador; aqui ele roda o Tailwind
// (gera as classes) e o Autoprefixer (adiciona prefixos de navegador automaticamente).
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}