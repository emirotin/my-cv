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
    "handlebars"
  ]
  template:
    wrapType: 'common'
    commonLibPath: 'handlebars'
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
      handlebars:
        path: 'javascripts/vendor/handlebars/handlebars'
        exports: 'Handlebars'
    aliases:
      templates: 'javascripts/templates'
    noParse: ['javascripts/vendor/jquery/jquery']
