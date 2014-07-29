$ = require('jquery')
require('bootstrap')

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
      'Age: 28'
      'Location: Minsk, Belarus'
      'Occupation: Web Developer'
      'Tech: JS, CoffeeScript, Node.js'
      'Express, Passport, Mongoose'
      'MongoDB, PostgreSQL, Redis'
      'Angular, Ractive'
      'Backbone, Ember'
      'Mustache, Handlebars, Jade'
      'jQuery, jQuery UI'
      'Underscore / Lodash, Bootstrap'
      'HTML5, CSS3'
      'Sass, Compass, LESS'
      'Grunt, Mocha, Mimosa'
      'Git, Git Flow, GitHub'
      ''
      '---'
      'Contact: emirotin@gmail.com'
      'Skype: guardante'
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
