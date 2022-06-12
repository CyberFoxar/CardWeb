module.exports = {
    syntax: require('postcss-lit'),
    plugins: [
      require('tailwindcss/nesting')(),
      require('tailwindcss')(),
      require('autoprefixer')(),
    ]
}