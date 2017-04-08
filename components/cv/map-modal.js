import { Component } from 'react'
import { Modal, Button, ProgressBar } from 'react-bootstrap'
import { GoogleMap, Marker, withGoogleMap } from 'react-google-maps'
import withScriptjs from 'react-google-maps/lib/async/withScriptjs';

import config from '../../config'

const Map = withScriptjs(withGoogleMap(props => {
	const marker = {
		position: {
			lat: props.lat,
			lng: props.lng,
		},
		key: props.markerName,
		defaultAnimation: 2,
	}
	return (
		<GoogleMap
			defaultZoom={props.zoom}
			defaultCenter={{ lat: props.lat, lng: props.lng }}>
			<Marker {...marker} />
		</GoogleMap>
	)
}))

export default class MapModal extends Component {
	render() {
		const { showModal, closeModal } = this.props

		return (
			<Modal show={showModal} onHide={closeModal}>
				<style jsx>{`
					:global(.map) {
						height: 400px;
					}
				`}</style>
				<Modal.Header closeButton>
					<Modal.Title>Wut? Krakozhia?</Modal.Title>
				</Modal.Header>
				<Modal.Body className="map">
					<Map
						containerElement={
							<div style={{ height: `100%` }} />
						}
						mapElement={
							<div style={{ height: `100%` }} />
						}
						googleMapURL={`https://maps.googleapis.com/maps/api/js?v=3.exp&key=${config.MAPS_API_KEY}`}
						loadingElement={
							<div style={{ height: `100%` }}>
								<ProgressBar active striped bsStyle="info" now={100} />
							</div>
						}
						zoom={config.MAP_CONFIG.zoom}
						lat={config.MAP_CONFIG.lat}
						lng={config.MAP_CONFIG.lng}
						markerName="Minsk" />
				</Modal.Body>
				<Modal.Footer>
					<Button onClick={closeModal}>Close</Button>
				</Modal.Footer>
			</Modal>
		)
	}
}