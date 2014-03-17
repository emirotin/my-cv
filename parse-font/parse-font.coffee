path = require 'path'
fs = require 'fs'
async = require 'async'
_ = require 'lodash'
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

  d = png.data
  t = 0
  for i in [0...m.height]
    for j in [0...m.width]
      m[i][j] = if (d[t] == 255 and d[t + 1] == 255 and d[t + 2] == 255) then 0 else 1
      t += 4
  cb null, m

separateChars = (matrix, cb) ->
  w = matrix.width
  h = matrix.height

  state = 0 # 0 = whitespace, 1 = in character
  start = 0
  end = 0
  chars = []
  while end <= w
    allWhite = end == w or not _.any (matrix[i][end] for i in [0...h])
    if state == 0 and not allWhite
      state = 1
      start = end
    else if state == 1 and allWhite
      state = 0
      chars.push { start, end: end - 1 }
    end += 1
  cb null, matrix, chars

parseFile = (fileName, cb) ->
  async.waterfall [
    (cb) ->
      cb null, path.normalize path.join __dirname, '..', 'alphabet-src', fileName + '.png'
    readPng
    pngToMatrix
    separateChars
  ], cb


print = (matrix, interval) ->
  for i in [0...matrix.height]
    s = []
    for j in [interval.start..interval.end]
      s.push if matrix[i][j] then '#' else ' '
    console.log s.join('')

parseFile 'uc', (err, matrix, chars) ->
  print matrix, chars[25]
