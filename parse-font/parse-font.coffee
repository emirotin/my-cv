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
        # extra vertical trim
        charVertStart = sliceStart
        while not _.any matrix[charVertStart][charStart...j]
          charVertStart += 1
        charVertEnd = sliceEnd
        while not _.any matrix[charVertEnd][charStart...j]
          charVertEnd -= 1
        chars.push (matrix[i][charStart...j] for i in [charVertStart..charVertEnd])
  cb null, chars

charsMap = [
  "ABCDEFGHIJKLMNOP"
  { chars: "Q", vOffset: 2 }
  "RSTUVWXYZ"
  "abcdef"
  { chars: "g", vOffset: 2 }
  "hi"
  { chars: "j", vOffset: 2 }
  "klmno"
  { chars: "pq", vOffset: 2 }
  "rstuvwx"
  { chars: "y", vOffset: 2 }
  "z"
  "0123456789"
  "."
  { chars: ",", vOffset: 2 }
  "?!"
  { chars: "-–—", vOffset: -4 }
  { chars: "+", vOffset: -1 }
  { chars: "()[]{}", vOffset: 1 }
  "#"
  { chars: "@$", vOffset: 2 }
  "%"
  { chars: "^", vOffset: -5 }
  "&"
  { chars: "*", vOffset: -2 }
  "_"
  { chars: "=", vOffset: -3 }
  ":"
  { chars: ";", vOffset: 2 }
  { chars: "'", vOffset: -6 }
  { chars: "/\\|", vOffset: 2 }
]

printChar = (char) ->
  for row in char
    console.log (if bit then '*' else '' for bit in row).join ''


mapChars = (chars, cb) ->
  res = {}
  parsedMap = []
  for def in charsMap
    if typeof def == 'string'
      vOffset = 0
      cs = def
    else
      { vOffset, chars: cs } = def
    for c in cs.split('')
      parsedMap.push { char: c, vOffset }
  if parsedMap.length != chars.length
    return cb new Error 'Length mismatch between configured chars and detected'
  for def, i in parsedMap
    char = chars[i]
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
    lineHeight: 10
    charWidth: 8
    spaceWidth: 2
    lineSpacing: 3
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
