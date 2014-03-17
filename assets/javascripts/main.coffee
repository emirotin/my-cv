jquery = require 'jquery'
ExampleView = require './app/example-view'

$ ->
  view = new ExampleView()
  view.render '#root'
  #console.log require('./lcd-font').characterMap['@']
