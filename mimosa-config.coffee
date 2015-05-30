exports.config =
  modules: [
    "copy"
    "server"
    "browserify"
    "jshint"
    "csslint"
    "minify-js"
    "minify-css"
    "live-reload"
    "bower"
    "coffeescript"
    "sass"
    "ractive"
    "web-package"
    "mimosa-minify-img"
  ]
  template:
    wrapType: 'common'
    writeLibrary: true
  browserify:
    bundles:
      [
        entries: ['javascripts/main.js']
        outputFile: 'bundle.js'
      ]
    shims:
      jquery:
        path: 'javascripts/vendor/jquery/jquery'
        exports: '$'
      bootstrap:
        path: 'javascripts/vendor/bootstrap/bootstrap'
        exports: null
        depends:
          'jquery': 'jQuery'
      ractive:
        path: 'javascripts/vendor/ractive'
        exports: 'Ractive'
    aliases:
      moment: 'javascripts/vendor/moment/moment'
      templates: 'javascripts/templates'
    noParse: ['jquery', 'ractive']
  webPackage:
    exclude: [
      'images-src', 'alphabet-src', 'parse-font'
      'assets', 'node_modules', 'mimosa-config.coffee'
      '.gitignore', 'README.md', 'package.json'
      'config.rb', 'makefile'
      '.git', '.mimosa'
    ]
