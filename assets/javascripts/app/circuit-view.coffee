$ = require('jquery')
require('bootstrap')

class CircuitView
  render: (element) ->
    @$el = $el = $ element

    LcdView = require './lcd-view'
    @lcdView = new LcdView()
    @lcdView.render $el.find '#lcd-root'

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
      'Backbone, Ractive, Ember'
      'Mustache, Handlebars'
      'jQuery, jQuery UI, Underscore /\nLodash, Bootstrap'
      'HTML5, CSS3, Sass, Compass'
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
      setTimeout typeLine, 1000
      view.type lines[i] + '\n'
      i += 1
    setTimeout typeLine, 200

module.exports = CircuitView
