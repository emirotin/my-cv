import Layout from '../components/layout'
import LCD from '../components/lcd'

export default () => (
	<Layout>
		<style jsx global>{`
			body {
				background-image: url('/static/images/circuit-board.png');
			}
		`}</style>
		<LCD />
	</Layout>
)