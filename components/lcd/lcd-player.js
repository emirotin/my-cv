import Promise from 'bluebird'
import { Component } from 'react'

import LCDText from './lcd-text'

import lcdFont from '../../lcd-font/alphabet.json'

const LINE_INTERVAL_MS = 900
const COL_COUNT = 20
const ROW_COUNT = 4

const fullColWidth = lcdFont.charWidth + lcdFont.letterSpacing
const fullRowHeight = lcdFont.lineHeight + lcdFont.lineSpacing
const gridWidth = fullColWidth * COL_COUNT
const gridHeight = fullRowHeight * ROW_COUNT
const characterMap = lcdFont.characterMap

const buildRow = (n) => {
	const row = new Array(n)
	for (let i = 0; i < n; i++) {
		row[i] = 0
	}
	return row
}

export default class LCDPlayer extends Component {
	_grid = null
	_currCol = 0
	_currRow = 0
	_i = 0

	state = {
		grid: null
	}

	_addRows(n = 1) {
		const rows = new Array(n)
		for (let i = 0; i < n; i++) {
			rows[i] = buildRow(gridWidth)
		}
		this._grid = [ ...this._grid, ...rows ]
	}

	_setupGrid() {
		this._grid = []
		this._addRows(gridHeight)
	}

	_shiftRows() {
		this._grid = this._grid.slice(fullRowHeight)
		this._addRows(fullRowHeight)
	}

	_addChar(c) {
		c = lcdFont.replace[c] || c
		if (c === ' ') {
			this._currCol += lcdFont.spaceWidth
			return
		}
		if (c === '\n') {
			this._currCol = 0
			this._currRow += fullRowHeight
			return
		}

		const charDef = characterMap[c]
		if (!charDef) return

		const { char } = charDef
		if (this._currCol + char[0].length >= gridWidth) {
			this._currCol = 0
			this._currRow += fullRowHeight
		}

		while (this._currRow >= gridHeight) {
			this._shiftRows()
			this._currRow -= fullRowHeight
		}

		const vOffset = this._currRow + lcdFont.lineHeight - char.length + charDef.vOffset
		char.forEach((row, i) => {
			i += vOffset
			if (i < 0 || i >= gridHeight) return

			row.forEach((bit, j) => {
				this._grid[i][this._currCol + j] = bit
			})
		})

		this._currCol += char[0].length + lcdFont.letterSpacing
	}

	resetGrid() {
		this._setupGrid()
		this._currCol = 0
		this._currRow = 0
		this._renderGrid()
	}

	_renderGrid() {
		this.setState({ grid: this._grid })
	}

	addLine(line) {
		line.split('').forEach(c => this._addChar(c))
		this._renderGrid()
	}

	typeLine() {
		const { lines } = this.props
		const i = this._i

		if (i >= lines.length) return

		return Promise.try(() => {
			this.addLine(lines[i] + '\n')
			this._i = i + 1
		}).delay(LINE_INTERVAL_MS).then(() => this.typeLine())
	}

	play() {
		this.resetGrid()
		return this.typeLine()
	}

	render() {
		return <LCDText pixels={this.state.grid} />
	}
}