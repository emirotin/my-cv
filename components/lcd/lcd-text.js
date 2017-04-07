const Row = ({ row }) => (
	<div className="row">
		<style jsx>{`
			.row {
				overflow: hidden;
			}
		`}</style>
		{row.map((bit, j) => <Cell bit={bit} key={j} />)}
	</div>
)

const Cell = ({ bit }) => (
	<span className={`cell${ bit ? " on" : "" }`}>
		<style jsx>{`
			.cell {
				float: left;
				width: 4px;
				height: 4px;
				margin-bottom: 1px;
				margin-right: 1px;
			}
			.cell.on {
				background: #333;
				background: rgba(0, 0, 0, 0.6);
			}
		`}</style>
	</span>
)

export default ({ pixels }) => pixels && (
	<div className="grid">
		<style jsx>{`
			.grid {
				user-select: none;
				pointer-events: none;
			}
		`}</style>
		{pixels.map((row, i) => <Row row={row} key={i} />)}
	</div>
)
