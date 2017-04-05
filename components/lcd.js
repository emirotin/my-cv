import { Component } from 'react'

import Buttons from './buttons'

const DISPLAY_WIDTH = 935

export default class LCD extends Component {
	state = {
		showButtons: true
	}

	render() {
		const { showButtons } = this.state

		return (
			<div className="lcd">
				<style jsx>{`
					.lcd {
						background: url('/static/images/display.png') center top no-repeat;
						width: 1072px;
						margin: 20px auto;
					}
					.lcd-wrap {
						height: 407px;
					}
					.lcd-inner {
						display: inline-block;
						box-sizing: border-box;
						height: 315px;
						width: ${DISPLAY_WIDTH}px;
						margin-left: 72px;
						margin-top: 46px;
						padding: 27px 0 0 28px;
						border-radius: 15px;
						box-shadow:
							inset 12px 9px 20px -1px rgba(0, 0, 0, 0.8),
							inset -7px -4px 40px rgba(0, 0, 0, 0.7);
					}
				`}</style>

				<div className="lcd-wrap">
					<div className="lcd-inner">LCD</div>
				</div>

				{ showButtons && <Buttons width={DISPLAY_WIDTH} /> }
			</div>
		)
	}
}