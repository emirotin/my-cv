import LCD from '../components/lcd'

export default () => (
	<div>
		<style jsx global>{`
			body {
				background-image: url('/static/images/circuit-board.png');
			}
		`}</style>
		<LCD />
	</div>
)