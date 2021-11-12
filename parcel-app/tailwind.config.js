module.exports = {
  mode: 'jit',
  corePlugins: {
      preflight: true,
  },
  purge: ["./src/index.html"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
