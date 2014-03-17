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
  heightInterval = [0...h]

  state = 0 # 0 = whitespace, 1 = in character
  start = 0
  end = 0
  chars = []
  for end in [0..w]
    allWhite = end == w or not _.any (matrix[i][end] for i in heightInterval)
    if state == 0 and not allWhite
      state = 1
      start = end
    else if state == 1 and allWhite
      state = 0
      chars.push (matrix[i][start...end] for i in heightInterval)
  cb null, chars

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


codeOfUcA = 'A'.charCodeAt(0)
codeOfLcA = 'a'.charCodeAt(0)
codeOfZero = '0'.charCodeAt(0)
charsMap =
  uc: (String.fromCharCode(codeOfUcA + i) for i in [0...26])
  lc: (String.fromCharCode(codeOfLcA + i) for i in [0...26])
  digits: (String.fromCharCode(codeOfZero + i) for i in [0..9])
  special: ''

parseFile 'uc', (err, chars) ->
  print matrix, chars[25]
