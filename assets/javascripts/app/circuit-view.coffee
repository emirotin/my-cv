$ = require('jquery')
require('bootstrap')
moment = require('moment')

birthDate = '1985-10-26'

class CircuitView
  render: (element) ->
    @$el = $el = $ element

    LcdView = require './lcd-view'
    @lcdView = new LcdView()
    @lcdView.render $el.find '#lcd-root'

  showButtons: ->
    @$el.find('.buttons').fadeIn()

  type: (done) ->
    view = @lcdView
    i = 0
    lines = [
      'Hello, World!'
      'Name: Eugene Mirotin'
      'Age: ' + moment().diff(birthDate, 'years')
      'Location: Minsk, Belarus'
      'Occupation: Web Developer'
      'Tech:'
      'JS, ES2015+, Node.js'
      'React, Redux, Sagas'
      'Express, Passport'
      'PostgreSQL, Redis, MongoDB'
      'Lodash, Bootstrap'
      'HTML5, CSS3'
      'Sass, LESS'
      'Webpack, Babel, Mocha'
      'Git, GitHub'
      ''
      '---'
      'Contact: emirotin@gmail.com'
    ]
    typeLine = ->
      if i >= lines.length
        return done?()
      setTimeout typeLine, 900
      view.type lines[i] + '\n'
      i += 1

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
