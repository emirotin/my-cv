import Head from 'next/head'
import Link from 'next/link'

const EMAIL = 'emirotin@gmail.com'


export default ({ width }) => (
	<div className="buttons" style={{ width }}>
		<Head>
			<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css" />
		</Head>

		<style jsx>{`
			.buttons {
				display: flex;
				flex-direction: row;
				flex-wrap: nowrap;
				justify-content: space-between;
				margin: 20px auto;
			}

			.button {
				display: block;
				padding: 10px;
				box-shadow: inset 0px 1px 0px 0px white;
				background: linear-gradient(to bottom, #ededed 5%, #dfdfdf 100%);
				background-color: #ededed;
				border-radius: 6px;
				text-indent: 0;
				border: 1px solid #dcdcdc;
				color: #777;
				font-family: Tahoma;
				font-size: 16px;
				font-weight: bold;
				font-style: normal;
				text-decoration: none;
				text-align: center;
				text-shadow: 1px 1px 0px white;
			}
			.button:hover {
				linear-gradient(to bottom, #dfdfdf 5%, #ededed 100%);
				background-color: #dfdfdf;
			}
			.button:active {
				position: relative;
				top: 1px;
			}

			.button i {
				margin-right: 5px;
			}

			.button.mailto {
				width: 250px;
			}
			.button.cv {
				width: 450px;
			}
		`}</style>

		<a className="button mailto" href={`mailto:${EMAIL}`}>
			<i className="fa fa-envelope" />
			{EMAIL}
		</a>
		<Link href="/cv">
			<a className="button cv">
				<i className="fa fa-address-card" />
				OK, cool, but... Do you have something more boring?
			</a>
		</Link>
	</div>
)