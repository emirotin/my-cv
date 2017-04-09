import Header from './header'
import Links from './links'
import GithubCard from './github-card'

export default () => (
	<div className="container">
		<Header />

		<section className="links">
			<div className="pull-right">
				<GithubCard username="emirotin" />
			</div>
			<div className="code-links">
				<h2>Sample Code</h2>
				<Links />
			</div>
			<div class="clearfix"></div>
		</section>
		<hr />

	</div>
)