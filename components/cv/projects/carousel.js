import { Component } from 'react'
import { Carousel, Glyphicon } from 'react-bootstrap'

const PREVIEW_ICON_SIZE = 52

const Item = (props) => {
	const { item, ...rest } = props
	return (
		<Carousel.Item {...rest}>
			<style jsx>{`
				.thumbnail {
					transition: all .6s ease-in-out;
				}
				.thumbnail .preview {
					display: none;
					position: absolute;
					left: 50%;
					top: 50%;
					width: ${PREVIEW_ICON_SIZE}px;
					height: ${PREVIEW_ICON_SIZE}px;
					line-height: ${PREVIEW_ICON_SIZE}px;
					margin-left: -${PREVIEW_ICON_SIZE / 2}px;
					margin-top: -${PREVIEW_ICON_SIZE / 2}px;
					text-align: center;
					z-index: 10;
					font-size: 150%;
					background: white;
					background: rgba(255, 255, 255, 0.6);
					border-radius: 7px;
				}
				.thumbnail:hover .preview {
					display: block;
				}
				.thumbnail:active {
					width: auto;
					max-width: 600px;
				}
				.thumbnail:active .preview {
					display: none;
				}
			`}</style>

			<a className="thumbnail" href="javascript:void(0)">
				<img className="media-object"
					src={item.img}
					alt={item.alt}
				/>
				<span className="preview">
					<Glyphicon glyph="zoom-in" />
				</span>
			</a>
		</Carousel.Item>
	)
}

export default class CvCarousel extends Component {
	state = {
		activeIndex: 0
	}

	componentDidMount() {
		this.slideInterval = setInterval(() => {
			this.setState(({ activeIndex }, { items }) => {
				return { activeIndex: (activeIndex + 1) % items.length }
			})
		}, 3000)
	}

	componentWillUnmount() {
		clearInterval(this.slideInterval)
	}

	render() {
		const { items } = this.props
		const { activeIndex } = this.state

		return (
			<div className="root">
				<style jsx>{`
					.root :global(.carousel-indicators) {
						background: #333;
						background: rgba(0, 0, 0, 0.4);
						border-radius: 3px;
					}
					.root :global(.carousel-flux).crsl :global(.item) {
						min-height: 320px;
					}
				`}</style>
				<Carousel controls={false} activeIndex={activeIndex}>
					{items.map((item, i) => <Item
						item={item} key={i} />)}
				</Carousel>
			</div>
		)
	}
}