path = require 'path'
fs = require 'fs'
async = require 'async'
PNG = require('pngjs').PNG

readPng = (filePath, cb) ->
  fs
    .createReadStream filePath
    .pipe new PNG filterType: 4
    .on 'parsed', ->
      cb null, this
    .on 'error', (err) ->
      cb err

pngToMatrix = (png, cb) ->
  m = []
  m.width = png.width
  m.height = png.height
  for i in [0...m.height]
    m[i] = []
  t = 0
  d = png.data
  for i in [0...m.height]
    for j in [0...m.width]
      m[i][j] = if (d[t] == 255 and d[t + 1] == 255 and d[t + 2] == 255) then 0 else 1
      t += 4
  cb null, m

parseFile = (fileName, cb) ->
  async.waterfall [
    (cb) ->
      cb null, path.normalize path.join __dirname, '..', 'alphabet-src', fileName + '.png'
    readPng
    pngToMatrix
  ], cb


print = (err, matrix) ->
  for i in [0...matrix.height]
    s = []
    for j in [100...260]
      s.push if matrix[i][j] then '#' else ' '
    console.log s.join('')

parseFile 'uc', print
