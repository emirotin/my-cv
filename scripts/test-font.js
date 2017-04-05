const fontConfig = require('../lcd-font/alphabet.json')

const printChar = (char) => {
	if (char == ' ') {
		console.log()
		return
	}

	char = fontConfig.characterMap[char].char
	char.forEach(line =>
		console.log(line.map(point => point === 1 ? '*' : ' ').join('')))
	console.log()
}

'Next.js is OK!'.split('').forEach(printChar)