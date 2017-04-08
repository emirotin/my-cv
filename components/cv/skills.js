import { Label } from 'react-bootstrap'

import list from './skills-list'

const flatList = list
	.map(({ type, label, skills }) =>
		skills.map(skill => ({ skill, type, label })))
	.reduce((a, b) => a.concat(b), [])

export default () => flatList.map(({ skill, label }, i) =>
	<Label key={i} bsStyle={label}>{skill}</Label>)