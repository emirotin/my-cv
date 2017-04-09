const LINKS = [
	[
		"https://github.com/emirotin/lcd-cv",
		'This CV, it has some interesting parts'
	], [
		"https://github.com/emirotin/mongodb-migrations",
		'Migration lib for MongoDB'
	], [
		"https://github.com/emirotin/mimosa-ember",
		'Sample Ember project for Mimosa'
	], [
		"http://emirotin.github.io/hover-dover/",
		'A fun experiment with PNG'
	], [
		"http://emirotin.github.io/loop-machine/",
		'A fun experiment with SoundCloud API'
	]
]

const renderLink = ([ link, title ], i) => (
	<li key={i}><a href={link} target="_blank">{title}</a></li>
)

export default () => (
	<ul className="lead">
		{LINKS.map(renderLink)}
	</ul>
)