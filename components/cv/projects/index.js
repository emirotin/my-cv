import ProjectResin from './01-resin'

export default () => (
	<section className="projects">
		<style jsx>{`
			h1 {
				margin-bottom: 20px;
			}
		`}</style>
		<h1>Relevant Experience</h1>
		<ul className="media-list">
			<ProjectResin />
			<hr />
		</ul>
	</section>
)