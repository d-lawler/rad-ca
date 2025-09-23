/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./storyblok/**/*.vue",
    "./app.vue",
    "./error.vue"
  ],
  theme: {
    container: {
      center: true,
      padding: '20px',
      screens: {}
    },
    extend: {
      fontFamily: {
        'primary': ['FH Oscar', 'system-ui', '-apple-system', 'sans-serif'],
        'heading': ['FH Oscar', 'system-ui', '-apple-system', 'sans-serif'],
        'mono': ['GT America Mono', 'Monaco', 'Consolas', 'Liberation Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}