import Carousel from './carousel'

const carouselItems = [
	{
		img: "/static/images/projects/resin-dashboard.jpg",
		alt: "Resin.io, AngularJS, CoffeeScript and Node.js"
	}, {
		img: "/static/images/projects/resin-site.jpg",
		alt: "Resin.io, Wintersmith, CoffeeScript and Node.js"
	}
]

export default () => (
	<li className="media">
		<div className="pull-right">
			<Carousel items={carouselItems} />
		</div>
		<div className="media-body">
			h2.media-heading
				| Resin.io&#32;
				small Git push to your devices
				small &#32;(~2.5 years, current)
			p
				strong Customer and Employer:&#32;
				a(href="https://resin.io", target="_blank") Resin.io
				| .
				br
				| A Seattle-based startup allowing users to deploy code to their
				| IoT devices (Raspberry Pi, Beaglebone Black, Intel Edison, etc.)
				| with simple <code>git push</code>.
			p
				strong Role:&nbsp;
				| Senior Front-end Developer.
				br
				strong Tech:&nbsp;
				| CoffeeScript, Node.js, Express, PostgreSQL, AngularJS,
				| CSS3, LESS, Bootstrap.
			p
				strong What I did:&nbsp;
				ul
					li Supported and evolved the resin.io dashboard – an AngularJS SPA,
					li
						| Implemented several end-to-end features, including Device URLs —
						| ability to give your resin-connected devices individual publicly accessible URLs,
					li
						| Coded the <a href="https://resin.io">resin.io website</a> using Wintersmith static site generator.
						| Featured in <a href="http://expo.getbootstrap.com/2015/02/26/resin/">Bootstrap Expo</a>.
		</div>
	</li>
)

