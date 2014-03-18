jquery = require 'jquery'
LcdView = require './app/lcd-view'

$ ->
  view = new LcdView()
  view.render '#lcd-root'

  i = 0
  lines = [
    'Hello, World!'
    'Name: Eugene Mirotin'
    'Age: 28'
    'Location: Minsk, Belarus'
    'Occupation: Web Developer'
    'Tech: JS, CoffeeScript, Node.js'
    'HTML5, CSS3, Sass, Compass'
    'MongoDB, PostgreSQL, Redis'
    'Express, Passport, Mongoose'
    'Backbone, Ractive, Ember'
    'Mustache, Handlebars'
    'jQuery, jQuery UI, Underscore /\nLodash, Bootstrap'
    'Grunt, Mocha, Mimosa'
    ''
    '---'
    'Contact: emirotin@gmail.com'
    'Skype: guardante'
  ]
  typeLine = ->
    if i >= lines.length
      return
    setTimeout typeLine, 1000
    view.type lines[i] + '\n'
    i += 1
  setTimeout typeLine, 10
