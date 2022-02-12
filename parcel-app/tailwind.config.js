module.exports = {
  mode: 'jit',
  corePlugins: {
    preflight: true,
  },
  darkMode:  true, // or 'media' or 'class'
  content: [
    "./src/**/*.{html,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
