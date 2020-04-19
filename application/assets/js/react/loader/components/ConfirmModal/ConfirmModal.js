import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Modal, Button } from 'react-bootstrap';

class ConfirmModal extends Component {
    static get propTypes() {
        return {
            showWin: PropTypes.bool.isRequired,
            onHide: PropTypes.func.isRequired,
            onOK: PropTypes.func.isRequired,
            title: PropTypes.string.isRequired,
            description: PropTypes.string,
        }
    }

    static get defaultProps() {
        return {
            onHide: () => {},
            showWin: false,
            onOK: () => new Promise(),
            title: '',
            description: ''
        }
    }

    constructor(props) {
        super(props);

        this.onConfirm = this.onConfirm.bind(this);
    }

    onConfirm() {
        this.props.onOK().then(() => this.props.onHide());
    }

    render() {
        return (
            <Modal show={this.props.showWin}>
                <Modal.Header onHide={this.props.onHide}>
                    <Modal.Title>{this.props.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>{this.props.description ? (<p>{this.props.description}</p>) : null}</Modal.Body>
                <Modal.Footer>
                    <Button onClick={this.props.onHide}>Close</Button>
                    <Button bsStyle="primary" onClick={this.onConfirm}>OK</Button>
                </Modal.Footer>
            </Modal>
        )
    }
}

export default ConfirmModal;