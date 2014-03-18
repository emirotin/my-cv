jquery = require 'jquery'
LcdView = require './app/lcd-view'

$ ->
  view = new LcdView()
  view.render '#root'
  view.type('Aa0Bb1Cc2Dd3Ee4Ff5Gg6Hh7Ii8Jj9Kk(L)l[M]m{N}n#O@o?P!p.Q,q-R+rSsTtUuVvWwXxYyZz')
