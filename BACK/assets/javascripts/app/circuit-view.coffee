class CircuitView


  showButtons: ->
    @$el.find('.buttons').fadeIn()

  type: (done) ->

    # wait for bg image to load
    $display = @$el.find('.display')
    bgUrl = $display.css('background-image')?.match(/^url\((.*)\)$/)
    if not bgUrl
      # wtf?
      setTimeout typeLine, 250
    else
      img = new Image()
      img.onload = ->
        setTimeout typeLine, 50
      img.src = bgUrl[1].replace(/^['"]|['"]$/, '')

module.exports = CircuitView
