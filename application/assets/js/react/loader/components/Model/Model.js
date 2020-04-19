import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import * as Actions from '../../actions/index';
import ValueEditor from '../ValueEditor/ValueEditor.js';
import ConfirmModal from '../ConfirmModal/ConfirmModal.js';
import ErrorModal from '../ErrorModal/ErrorModal.js';
import { Modal, Button } from 'react-bootstrap';


class Model extends Component {
    static propTypes = {
        actions: PropTypes.object.isRequired,
        showWin: PropTypes.bool.isRequired,
        onHide: PropTypes.func.isRequired,
        brandId: PropTypes.number.isRequired,
        models: PropTypes.array.isRequired,
    }

    static defaultProps = {
        onHide: () => {},
        showWin: false,
        brandId: 0,
        models: []
    }

    constructor(...props) {
        super(...props);
        this.onDeleteConfirm = this.onDeleteConfirm.bind(this);
        this.onModelDelete = this.onModelDelete.bind(this);
        this.onModelUpdate = this.onModelUpdate.bind(this);
        this.onModelAdd = this.onModelAdd.bind(this);

        this.state = {
            selected: null,
            showDeleteConfirmation: false,
            showErrorDialog: false,
            deleteResolve: null,
            deleteReject: null,
            errorValue: ''
        };
    }

    onModelAdd(name) {
        return new Promise((resolve, reject) => {
            this.props.actions.addModelName(null, name, () => {
                resolve();
            }, (e) => {
                this.setState({
                    errorValue: e.message,
                    showErrorDialog: true
                });
                reject();
            });
        });
    }

    onModelUpdate(id, name) {
        return new Promise((resolve, reject) => {
            this.props.actions.addModelName(id, name, (model) => {
                this.setState({
                    selected: model
                });
                resolve()
            }, (e) => {
                this.setState({
                    errorValue: e.message,
                    showErrorDialog: true
                });
                reject();
            });
        });
    }

    onModelDelete() {
        return new Promise((resolve, reject) => {
            this.setState({
                showDeleteConfirmation: true,
                deleteResolve: resolve,
                deleteReject: reject
            });
        });
    }

    onDeleteConfirm() {
        return new Promise((resolve, reject) => {
            this.props.actions.delModelName(
                this.state.selected.id,
                () => {
                    this.state.deleteResolve();
                    this.setState({
                        selected: null,
                        deleteResolve: null
                    });
                },
                (e) => {
                    this.state.deleteReject(e);
                    this.setState({
                        selected: null,
                        deleteReject: null,
                        errorValue: e.message,
                        showErrorDialog: true
                    });
                });
                resolve();
        });
    }

    render() {
        return [
            (<Modal key="1" show={this.props.showWin}>
                <Modal.Header onHide={this.props.onHide}>
                    <Modal.Title>Edit Model's Names</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <ValueEditor
                        idProp="id"
                        nameProp="name"
                        disabledProp="use"
                        items={this.props.models}
                        selected={this.state.selected}
                        onSelect={(selected) => this.setState({selected})}
                        onCreate={this.onModelAdd}
                        onUpdate={this.onModelUpdate}
                        onDelete={this.onModelDelete}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={this.props.onHide}>Close</Button>
                </Modal.Footer>
            </Modal>),
            (<ConfirmModal
                key="2"
                title="Attention"
                description="Are you sure want to delete selected value?"
                showWin={this.state.showDeleteConfirmation}
                onHide={() => this.setState({showDeleteConfirmation: false})}
                onOK={this.onDeleteConfirm}
            />),
            (<ErrorModal
                key="3"
                title="Error"
                description={this.state.errorValue}
                showWin={this.state.showErrorDialog}
                onHide={() => this.setState({showErrorDialog: false})}
            />)
        ]
    }
}

function mapStateToProps(state) {
    return {
        models: state.Models.ModelList.Data,
        brandId: state.Brand.SelectedBrand.id
    };
  }
  
  function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(Actions, dispatch)
    };
  }
  
  export default connect(
    mapStateToProps,
    mapDispatchToProps
  )(Model);