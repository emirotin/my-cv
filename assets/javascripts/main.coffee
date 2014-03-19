$ = require 'jquery'

$ ->
  $body = $('body')

  if $body.hasClass 'page-circuit'
    LcdView = require './app/lcd-view'
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
        return
      setTimeout typeLine, 1000
      view.type lines[i] + '\n'
      i += 1
    setTimeout typeLine, 200

  if $body.hasClass 'page-cv'
    CvView = require './app/cv-view'
    view = new CvView()
    view.render 'body'
