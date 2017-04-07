import differenceInYears from 'date-fns/difference_in_years'

const BIRTH_DATE = '1985-10-26'

export default [
	'Hello, World!',
	'Name: Eugene Mirotin',
	'Age: ' + differenceInYears(new Date(), BIRTH_DATE),
	'Location: Minsk, Belarus',
	'Occupation: Web Developer',
	'Tech:',
	'JS, ES6, CoffeeScript, Node.js',
	'React, Redux',
	'Angular, Ractive',
	'Express, Passport, Mongoose',
	'MongoDB, PostgreSQL, Redis',
	'Mustache, Handlebars, Jade',
	'Lodash, Bootstrap, jQuery',
	'HTML5, CSS3',
	'Sass, LESS',
	'Webpack, Babel, Grunt, Mocha',
	'Git, GitHub',
	'',
	'---',
	'Contact: emirotin@gmail.com',
]