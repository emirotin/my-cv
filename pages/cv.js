import Head from 'next/head'
import Layout from '../components/layout'
import CV from '../components/cv'

export default () => (
	<Layout>
		<Head>
			<link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootswatch/3.3.7/flatly/bootstrap.min.css" />
		</Head>
		<CV />
	</Layout>
)