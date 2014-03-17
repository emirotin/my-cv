templates = require 'templates'
Ractive = require 'ractive'

class ExampleView

  render: (element) ->
    @app = new Ractive
      el: element
      template: templates.example
      data:
        name: 'Handlebars', css: 'sass'

module.exports = ExampleView
