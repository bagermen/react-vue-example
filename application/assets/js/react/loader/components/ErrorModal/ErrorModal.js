import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Modal, Button } from 'react-bootstrap';

class ErrorModal extends Component {
    static propTypes = {
        showWin: PropTypes.bool.isRequired,
        onHide: PropTypes.func.isRequired,
        title: PropTypes.string.isRequired,
        description: PropTypes.string,
    }

    static defaultProps = {
        onHide: () => {},
        showWin: false,
        title: '',
        description: ''
    }

    render() {
        return (
            <Modal show={this.props.showWin}>
                <Modal.Header onHide={this.props.onHide}>
                    <Modal.Title>{this.props.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>{this.props.description ? (<p>{this.props.description}</p>) : null}</Modal.Body>
                <Modal.Footer>
                    <Button bsStyle="primary" onClick={this.props.onHide}>OK</Button>
                </Modal.Footer>
            </Modal>
        )
    }
}

export default ErrorModal;