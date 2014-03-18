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
  chars = []

  w = matrix.width
  h = matrix.height
  heightInterval = [0...h]
  widthInterval = [0...w]

  # vertical trim
  imin = 0
  while not _.any (matrix[imin][j] for j in widthInterval)
    imin += 1
  imax = h - 1
  while not _.any (matrix[imax][j] for j in widthInterval)
    imax -= 1
  imax += 1

  # vertical slice
  slices = []
  state = 0 # 0 = whitespace, 1 = in character
  sliceStart = imin
  for i in [imin..imax]
    allWhite = i == imax or not _.any (matrix[i][j] for j in widthInterval)
    if state == 0 and not allWhite
      state = 1
      sliceStart = i
    else if state == 1 and allWhite
      state = 0
      slices.push { sliceStart, sliceEnd: i - 1}

  # horizontal slice
  for { sliceStart, sliceEnd } in slices
    sliceHeightInterval = [sliceStart..sliceEnd]
    # horizontal trim
    jmin = 0
    while not _.any (matrix[i][jmin] for i in sliceHeightInterval)
      jmin += 1
    jmax = w - 1
    while not _.any (matrix[i][jmax] for i in sliceHeightInterval)
      jmax -= 1
    jmax += 1

    state = 0 # 0 = whitespace, 1 = in character

    charStart = jmin
    for j in [jmin..jmax]
      allWhite = j == jmax or not _.any (matrix[i][j] for i in sliceHeightInterval)
      if state == 0 and not allWhite
        state = 1
        charStart = j
      else if state == 1 and allWhite
        state = 0
        chars.push (matrix[i][charStart...j] for i in [sliceStart..sliceEnd])
  cb null, chars

charsMap = [
    {
      chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
      vOffset: 0
    }
    {
      chars: "abcdefghijklmnopqrstuvwxyz"
      vOffset: 0
    }
    {
      chars: "0123456789"
      vOffset: 0
    }
    {
      chars: ".,?!-–—+()[]{}#@$%^&*_=:;'/\\|"
      vOffset: 0
    }
]

mapChars = (chars, cb) ->
  res = {}
  parsedMap = []
  for def in charsMap
    for c in def.chars.split('')
      parsedMap.push char: c, vOffset: def.vOffset
  if parsedMap.length != chars.length
    return cb new Error 'Length mismatch between configured chars and detected'
  for def, i in parsedMap
    res[def.char] = char: chars[i], vOffset: def.vOffset
  cb null, res

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
      mapChars results.chars, cb
    ]
  , (err, results) ->
    cb err, results.mapChars

createExport = (charDefs) ->
  exports =
    lineHeight: 13
    charWidth: 15
    spaceWidth: 3
    lineSpacing: 5
    letterSpacing: 1
    characterMap: charDefs
    replace:
      '"': "'"

  filePath = path.normalize path.join __dirname, '..', 'assets', 'javascripts', 'lcd-font.js'
  fs.writeFileSync filePath, 'module.exports = ' + JSON.stringify(exports) + ';'

parseFile 'alphabet', (err, map) ->
  if err
    console.error err
    process.exit 1
  createExport map
  console.log 'Done, OK'
