jquery = require 'jquery'
LcdView = require './app/lcd-view'

$ ->
  view = new LcdView()
  view.render '#root'

  i = 0
  lines = [
    'Aa0Bb1Cc2Dd3Ee4Ff5Gg6Hh7'
    'Ii8Jj9Kk(L)l[M]m{N}n#O@o?P!'
    'p.Q,q-R+r–S—s$'
    'T%t^U&u*V_v=Ww:X;x\'Y/y\\Z|z'
    'Hello, World!'
  ]
  typeLine = ->
    if i >= lines.length
      return
    setTimeout typeLine, 500
    view.type lines[i] + '\n'
    i += 1
  setTimeout typeLine, 400
