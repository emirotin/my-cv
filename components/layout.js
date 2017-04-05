import Head from 'next/head'

export default ({ children, title = "Eugene Mirotin's CV" }) => (
	<div>
		<Head>
			<title>{title}</title>
		</Head>

		{children}
	</div>
)