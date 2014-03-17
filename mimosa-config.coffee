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
  ]
  template:
    wrapType: 'common'
    #commonLibPath: 'ractive'
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
      ractive:
        path: 'javascripts/vendor/Ractive'
        exports: 'Ractive'
    aliases:
      templates: 'javascripts/templates'
    noParse: ['jquery', 'ractive']
