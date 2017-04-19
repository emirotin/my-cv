import Document, { Head, Main, NextScript } from 'next/document'
import flushStyyles from 'styled-jsx/server'

export default class MyDocument extends Document {
	static getInitialProps({ renderPage }) {
		const { html, head
		} = renderPage()
		const styles = flushStyyles()
		return { html, head, styles }
	}

	// TODO: move google verification to config

	render() {
		return (
			<html>
				<Head>
					<meta httpEquiv="X-UA-Compatible" content="IE=edge" />
					<meta name='viewport' content='initial-scale=1.0, width=device-width' />

					<meta name="description" content="A CV of Eugene Mirotin, front-end and Node.js developer" />
					<meta property="og:image" content="/static/images/me.jpg" />

					<meta name="google-site-verification" content="ydP1PthqJ33poe4JASwB7LX-ADx3Zak_81ouWwUVsV8" />

					<link rel="shortcut icon" href="/static/fav.ico" type="image/x-icon" />
					<link rel="icon" href="/static/fav.ico" type="image/x-icon" />
				</Head>
				<body>
					<Main />
					<NextScript />
				</body>
			</html>
		)
	}
}