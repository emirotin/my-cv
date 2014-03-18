exports.config = {
  modules: ["eslint", "copy"],
  watch: {
    sourceDir: "src",
    compiledDir: "lib",
    javascriptDir: null,
    exclude: ["client/handlebars.js"]
  },
  eslint: {
    options: {
      rules: {
        "no-global-strict": 0,
        "no-underscore-dangle": 0
      },
      env: {
        node: true
      }
    }
  }
}
