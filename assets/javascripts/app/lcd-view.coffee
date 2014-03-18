templates = require 'templates'
Ractive = require 'ractive'
lcdFont = require '../lcd-font.js'

COL_COUNT = 20
ROW_COUNT = 4

###
lineHeight: 13
charWidth: _.max (charDefs[c].char[0].length for c of charDefs)
spaceWidth: 3
lineSpacing: 5
letterSpacing: 1
characterMap: charDefs
replace:
  '"': "'"
###

fullColWidth = lcdFont.charWidth + lcdFont.letterSpacing
fullRowHeight = lcdFont.lineHeight + lcdFont.lineSpacing
gridWidth = fullColWidth * COL_COUNT
gridHeight = fullRowHeight * ROW_COUNT
characterMap = lcdFont.characterMap

class LcdView

  render: (element) ->
    @app = new Ractive
      el: element
      template: templates.lcd
      data:
        gridWidth: gridWidth
        gridHeight: gridHeight
        intervalWidth: [0...gridWidth]
        intervalHeight: [0...gridHeight]
        grid: null
    @reset()

  type: (str) ->
    for c in str
      @_addChar c
    @_renderGrid()

  _addChar: (c) ->
    c = lcdFont.replace[c] or c
    if c == ' '
      @_currCol += lcdFont.spaceWidth
      return
    if c == '\n'
      @_currCol = 0
      @_currRow += fullRowHeight
      return

    charDef = characterMap[c]
    if not charDef
      return
    char = charDef.char
    if @_currCol + char[0].length >= gridWidth
      @_currCol = 0
      @_currRow += fullRowHeight

    while @_currRow >= gridHeight
      @_shiftRows()
      @_currRow -= fullRowHeight

    for row, i in char
      i += @_currRow + charDef.vOffset
      if i < 0 or i >= gridHeight
        continue
      for bit, j in row
        @grid[i][@_currCol + j] = bit
    @_currCol += char[0].length + lcdFont.letterSpacing


  _renderGrid: ->
    @app.set 'grid', @grid

  _shiftRows: ->
    @grid.splice 0, fullRowHeight
    for i in [0...fullRowHeight]
      @_addRow()

  _addRow: ->
    row = []
    row.length = gridWidth
    @grid.push row

  _setupGrid: ->
    @grid = []
    for i in [0...gridHeight]
      @_addRow()

  reset: ->
    @_setupGrid()
    @_currCol = 0
    @_currRow = 0
    @_renderGrid()


module.exports = LcdView
