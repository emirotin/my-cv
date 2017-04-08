import { Button, Glyphicon, Media, Thumbnail } from 'react-bootstrap'

import getSkills from './skills'

import { getAge } from '../../util'

export default () => (
	<header className="page-header" itemScope itemType="http://schema.org/Person">
		<style jsx>{`
			.my-photo {
				margin-right: 10px;
			}

			:global(.glyphicon) {
				font-size: 80%;
			}

			.skills, .contacts {
				display: block;
			}

			.skills {
				margin-top: 0.8em;
			}

			.skills :global(.label) {
				display: inline-block;
				margin-right: 0.4em;
				margin-bottom: 0.2em;
			}
		`}</style>
		<div className="print pull-right">
			<Button bsSize="small" bsStyle="default" onClick={() => window.print()}>
				<Glyphicon glyph="print" /> Print
			</Button>
		</div>
		<Media>
			<div className="my-photo pull-left thumbnail">
				<img src="/static/images/me.jpg"
					alt="Eugene Mirotin"
					itemProp="image" />
			</div>
			<Media.Body>
				<Media.Heading componentClass="h1">
					<span itemProp="name">Eugene Mirotin</span>
					<small> (left)</small>
				</Media.Heading>
				<p className="lead">
					<span itemProp="jobTitle">Web Developer</span>
					<br />
					Age: {getAge()}.&nbsp;
					<span itemProp="address" itemScope itemType="http://schema.org/PostalAddress">
						Location:&nbsp;
						<a className="location" href="#" data-toggle="modal" data-target="#map-modal">
							<Glyphicon glyph="globe" />
							&nbsp;
							<span itemProp="addressLocality">Minsk</span>
							,&nbsp;
							<span itemProp="addressCountry">Belarus</span>
						</a>.
					</span>
					<span className="contacts">
						<a href="mailto:emirotin@gmail.com">
							<Glyphicon glyph="envelope" />&nbsp;
							<span itemProp="email">emirotin@gmail.com</span>
						</a>.
					</span>
					<span className="skills">
						Core skills:&nbsp;
						{getSkills()}
					</span>
				</p>
			</Media.Body>
		</Media>
	</header>
)