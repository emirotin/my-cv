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

codeOfUcA = 'A'.charCodeAt(0)
codeOfLcA = 'a'.charCodeAt(0)
codeOfZero = '0'.charCodeAt(0)
charsMap =
  uc:
    chars: (String.fromCharCode(codeOfUcA + i) for i in [0...26])
    vOffset: 3
  lc:
    chars: (String.fromCharCode(codeOfLcA + i) for i in [0...26])
    vOffset: 7
  digits:
    chars: (String.fromCharCode(codeOfZero + i) for i in [0..9])
    vOffset: 3
  special:
    chars: ".,?!-–—+()[]{}#@$%^&*_=:;'/\\|"
    vOffset: 2

parseFile = (fileName, cb) ->
  filePath = path.normalize path.join __dirname, '..', 'alphabet-src', fileName + '.png'
  async.auto
    png: (cb) ->
      readPng filePath, cb
    matrix: ['png', (cb, results) ->
      pngToMatrix results.png, cb
    ]
    chars: ['matrix', (cb, results) ->
      separateChars results.matrix, cb
    ]
    mapChars: ['chars', (cb, results) ->
      map = charsMap[fileName]
      chars = results.chars
      if not map
        return cb new Error 'Unknown file name: ' + fileName
      if map.chars.length != chars.length
        return cb new Error 'Length mismatch for file ' + fileName
      res = {}
      for char, i in map.chars
        res[char] = char: chars[i], vOffset: map.vOffset
      cb null, res
    ]
  , (err, results) ->
    cb err, results.mapChars

createExport = (charDefs) ->
  exports =
    lineHeight: 13
    charWidth: _.max (charDefs[c].char[0].length for c of charDefs)
    spaceWidth: 3
    lineSpacing: 5
    letterSpacing: 1
    characterMap: charDefs
    replace:
      '"': "'"

  filePath = path.normalize path.join __dirname, '..', 'assets', 'javascripts', 'lcd-font.js'
  fs.writeFileSync filePath, 'module.exports = ' + JSON.stringify(exports) + ';'

async.map _.keys(charsMap), parseFile, (err, maps) ->
  if err
    console.error err
    process.exit 1
  merged = _.reduce maps,
    (a, b) -> _.extend a, b
  , {}
  createExport merged
