$ = require 'jquery'

$ ->
  $body = $('body')

  if $body.hasClass 'page-circuit'
    CircuitView= require './app/circuit-view'
    view = new CircuitView()
    view.render 'body'
    view.type ->
      console.log 111

  if $body.hasClass 'page-cv'
    CvView = require './app/cv-view'
    view = new CvView()
    view.render 'body'
