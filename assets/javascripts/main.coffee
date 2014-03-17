jquery = require 'jquery'
LcdView = require './app/lcd-view'

$ ->
  view = new LcdView()
  view.render '#root'
  #console.log require('./lcd-font').characterMap['@']
