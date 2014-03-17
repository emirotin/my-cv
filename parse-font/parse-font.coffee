path = require 'path'
fs = require('fs')
PNG = require('pngjs').PNG

imgPath = path.normalize path.join __dirname, '..', 'alphabet-src', 'lc.png'

parse = (filePath, fn) ->
  fs
    .createReadStream filePath
    .pipe new PNG filterType: 4
    .on 'parsed', fn

print = (matrix) ->
  for i in [0...matrix.height]
    s = []
    for j in [100...260]
      s.push matrix[i][j]
    console.log s.join('')

parse imgPath, ->
  matrix = []
  matrix.width = this.width
  matrix.height = this.height
  for i in [0...matrix.height]
    matrix.push []

  t = 0
  pixelData = this.data
  for i in [0...matrix.height]
    for j in [0...matrix.width]
      matrix[i][j] = if (pixelData[t] == 255 and pixelData[t + 1] == 255 and pixelData[t + 2] == 255) then 0 else 1
      t += 4
  print matrix
