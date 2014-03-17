templates = require 'templates'
Ractive = require 'ractive'
lcdFont = require '../lcd-font.js'

class LcdView

  render: (element) ->
    @app = new Ractive
      el: element
      template: templates.lcd
      data: {}


module.exports = LcdView
