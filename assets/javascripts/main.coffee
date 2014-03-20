$ = require 'jquery'

$ ->
  $body = $('body')

  if $body.hasClass 'page-circuit'
    CircuitView= require './app/circuit-view'
    view = new CircuitView()
    view.render 'body'
    view.type ->
      view.showButtons()

  if $body.hasClass 'page-cv'
    CvView = require './app/cv-view'
    view = new CvView()
    view.render 'body'
