import { Component } from 'react'
import { Modal, Button } from 'react-bootstrap'

export default class MapModal extends Component {
	render() {
		const { showModal, closeModal } = this.props

		return (
			<Modal show={showModal} onHide={closeModal}>
				<Modal.Header closeButton>
					<Modal.Title>Wut? Krakozhia?</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					LOREM IPSUM
				</Modal.Body>
				<Modal.Footer>
					<Button onClick={closeModal}>Close</Button>
				</Modal.Footer>
			</Modal>
		)
	}
}