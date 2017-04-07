import { Component } from 'react'

import Buttons from './buttons'
import LCDPlayer from './lcd-player'

import lcdTextLines from './lcd-text-lines'

const DISPLAY_WIDTH = 935
const DISPLAY_IMG = '/static/images/display.png'

export default class LCD extends Component {
	state = {
		showButtons: false
	}

	imgPromise = null

	componentWillMount() {
		this.imgPromise = new Promise((resolve) => {
			// implements _once_
			let done = false
			const doResolve = () => {
				if (done) return
				setTimeout(resolve, 50)
				done = true
			}

			const img = new Image()
			img.onload = doResolve
			img.src = DISPLAY_IMG

			// set load timeout, results in degraded UX but kinda OK?
			setTimeout(doResolve, 800)
		})
	}

	componentDidMount() {
		this.imgPromise
		.then(() => this.lcdPlayer.play())
		.then(() => {
			this.setState({ showButtons: true })
		})
	}

	render() {
		const { showButtons } = this.state

		return (
			<div className="lcd">
				<style jsx>{`
					.lcd {
						background: url('${DISPLAY_IMG}') center top no-repeat;
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
					<div className="lcd-inner">
						<LCDPlayer
							lines={lcdTextLines}
							ref={(lcdPlayer => this.lcdPlayer = lcdPlayer)} />
					</div>
				</div>

				<Buttons width={DISPLAY_WIDTH} hidden={!showButtons} />
			</div>
		)
	}
}