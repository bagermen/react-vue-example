import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import * as Actions from '../../actions/index';
import moment from 'moment-timezone';

import FineUploaderTraditional from 'fine-uploader-wrappers';
import Gallery from 'react-fine-uploader';
import 'react-fine-uploader/gallery/gallery.css';
import Select from '../ModelSelect/ModelSelect';
import Tags from '../Tags/Tags';
import axios from 'axios';
import qs from 'qs'

import { Modal, FormGroup, ControlLabel, FormControl, HelpBlock, Button } from 'react-bootstrap';
import DatePicker from 'react-bootstrap-date-picker';
import * as Styles from './BrandUploadModule.scss';
import BrandModel from '../Model/Model';

// ...or load this specific CSS file using a <link> tag in your document

class AddBrandVideo extends Component {

    static propTypes = {
        actions: PropTypes.object.isRequired,
        EditBrandListUpload: PropTypes.object.isRequired,
        modelNames: PropTypes.array.isRequired,
        showWin: PropTypes.bool.isRequired,
        onHide: PropTypes.func.isRequired,
        category: PropTypes.number.isRequired
    }

    static defaultProps = {
        EditBrandListUpload: {},
        modelNames: [],
        showWin: false,
        onHide: () => {},
        category: 0
    }

    constructor(...args) {

        super(...args);
        this.getUploader = this.getUploader.bind(this);
        this.toggleModel = this.toggleModel.bind(this);

        this.noValidateHandler = this.noValidateHandler.bind(this);

        this.dispNameChange = this.dispNameChange.bind(this);
        this.startDateChange = this.startDateChange.bind(this);
        this.endDateChange = this.endDateChange.bind(this);
        this.descriptionChange = this.descriptionChange.bind(this);
        this.selectModelChange = this.selectModelChange.bind(this);
        this.yearChange = this.yearChange.bind(this);
        this.seasonalChange = this.seasonalChange.bind(this);
        this.metaDataChange = this.metaDataChange.bind(this);

        this.addBrandVideo = this.addBrandVideo.bind(this);
        this.checkEnabledState = this.checkEnabledState.bind(this);
        this.isDisabled = this.isDisabled.bind(this);
        this.onTagChange = this.onTagChange.bind(this);
        this.createNewTags = this.createNewTags.bind(this);

        this.state = {
            resetUploader: false,
            uploaderParams: {},
            modal: true,
            addModal: false,
            modelVal: [],

            validateValue: false,
            disabledValue: false,

            dispNameHelpBlock: '',
            startDateHelpBlock: '',
            endDateHelpBlock: '',
            descriptionHelpBlock: '',
            selectValHelpBlock: '',
            yearHelpBlock: '',
            seasonalHelpBlock: '',
            metaDataHelpBlock: '',
            fileHelpBlock: '',
            tags: []
        };
    }

    /**
     * Return fine uploader
     */
    getUploader() {
        if (this.uploader) {
            return this.uploader;
        }

        this.uploader = new FineUploaderTraditional({
            options: {
                session: {
                    refreshOnReset: false,
                    endpoint: this.props.host + 'adverts/initialImages',
                    params: this.state.uploaderParams
                },
                chunking: {
                    enabled: true,
                    mandatory: false,
                    concurrent: {
                        enabled: true
                    },
                    success: {
                        endpoint: this.props.host + 'adverts/endUploadVideo'
                    }
                },
                cors: {
                    //all requests are expected to be cross-domain requests
                    expected: false,
                    allowXdr: true,
                    sendCredentials: true
                },
                deleteFile: {
                    enabled: true,
                    endpoint: this.props.host + 'adverts/deleteVideo'
                },
                request: {
                    endpoint: this.props.host + 'adverts/uploadVideo'
                },
                retry: {
                    enableAuto: true
                },
                multiple: false,
                validation: {
                    itemLimit: 1,
                    allowedExtensions: [
                        'webm', 'mkv', 'flv', 'vob', 'avi', 'mov', 'wmv', 'yuv', 'mp4', 'm4p ', 'm4v', 'mpg', 'mpeg',
                        'mp2', 'mpe', 'mpv', 'm2v', 'svi', '3gp', '3g2', 'mxf', 'roq', 'nsv', 'flv', 'f4v', 'f4p', 'f4a', 'f4b'
                    ]
                },
                messages: {
                    typeError: 'Invalid extension detected in file, {file}.'
                },
                callbacks: {
                    onSessionRequestComplete: (initial) => {
                        this.setState({resetUploader: false});
                        setTimeout(() => {
                            this.uploader.options.deleteFile.enabled = !initial.length;
                            initial.forEach((data) => {
                                let file = this.uploader.methods.getUploads({uuid:data.uuid});
                                this.uploader.methods._uploadData.setStatus(file.id, this.uploader.qq.status.UPLOAD_SUCCESSFUL);
                            });
                        }, 200);
                    },
                    onError: function (id, name, errorReason, xhrOrXdr) {
                        alert("Error on file number " + name + " Reason: " + errorReason);
                    },
                    onComplete: (fileId, filename, {uuid}) => {
                        this.props.actions.updateChosenVideo({file_id:uuid});
                        this.fileChange(uuid);
                    },
                    onDelete: () => {
                        this.props.actions.updateChosenVideo({file_id:null});
                        this.fileChange(null);
                    }
                }
            }
        });

        return this.uploader;
    }

    toggleModel() {
        this.setState({
            addModal: !this.state.addModal
        });
    }

    showModal() {
        this.props.actions.resetEditedModel();
        this.setState({ addModal: true })
    }

    /**
     * Allow validation
     */
    noValidateHandler() {
        this.setState({ validateValue: true });
    }

    checkFieldValid(name) {
        if (this.state.hasOwnProperty(`${name}HelpBlock`)) {
            return this.state[`${name}HelpBlock`] ? 'error' : null;
        }

        return null;
    }

    /**
     * On name change
     * @param {*} event 
     */
    dispNameChange(event) {
        this.props.actions.updateChosenVideo({
            dispName: event.target.value
        });

        this.setState({
            dispNameHelpBlock: this.validateDispName(event.target.value) ? '': 'Name cannot be empty'
        });
    }

    validateDispName(data) {
        return !!data;
    }

    startDateChange(event) {
        let startDate = moment(event).isValid() ? moment(event).startOf('day').unix() : null;
        this.props.actions.updateChosenVideo({
            startDate: startDate
        });
        this.setState({
            startDateHelpBlock: this.validateStartDate(startDate) ? '': 'Date cannot be empty'
        });
    }

    validateStartDate(data) {
        return !!data;
    }

    endDateChange(event) {
        let endDate = moment(event).isValid() ? moment(event).startOf('day').unix() : null;
        this.props.actions.updateChosenVideo({
            endDate: endDate
        });
        this.setState({
            endDateHelpBlock: this.validateEndDate(endDate) ? '': 'Date cannot be empty'
        });
    }

    validateEndDate(data) {
        return !!data;
    }

    descriptionChange(event) {
        this.props.actions.updateChosenVideo({
            description: event.target.value
        });
        this.setState({
            descriptionHelpBlock: this.validateDescription(event.target.value) ? '': 'Desc Name cannot be empty'
        });
    }

    validateDescription(data) {
        return !!data;
    }

    selectModelChange(data) {
        let value =  data ? data.value : 0;
        this.props.actions.updateChosenVideo({
            selectVal: value
        });
        this.setState({
            selectValHelpBlock: this.validateSelectModel(value) ? '': 'Model Name cannot be empty'
        });
    }

    validateSelectModel(data) {
        return !!data || true;
    }

    yearChange(event) {
        this.props.actions.updateChosenVideo({
            year: event.target.value
        });
        this.setState({
            yearHelpBlock: this.validateYear(event.target.value) ? '': 'Year cannot be empty'
        });
    }

    validateYear(data) {
        return !!data || true;
    }

    seasonalChange(event) {
        this.props.actions.updateChosenVideo({
            seasonal: event.target.value
        });
        this.setState({
            seasonalHelpBlock: this.validateSeasonal( event.target.value) ? '': 'Seasonal cannot be empty'
        });
    }

    validateSeasonal(data) {
        return !!data;
    }

    metaDataChange(event) {
        this.props.actions.updateChosenVideo({
            metaData: event.target.value
        });
        this.setState({
            metaDataHelpBlock: this.validateMetaData(event.target.value) ? '': 'metaData cannot be empty'
        });
    }

    validateMetaData(data) {
        return !!data;
    }

    fileChange(uuid) {
        this.setState({
            fileHelpBlock: this.validateFile(uuid) ? '': 'File cannot be empty'
        });
    }

    validateFile(uuid) {
        return !!uuid;
    }

    validateMetaData(data) {
        return !!data;
    }

    /*Function to set the disabled set of the submit button*/

    checkEnabledState() {
        return this.validateDispName(this.props.EditBrandListUpload.dispName) &&
            this.validateStartDate(this.props.EditBrandListUpload.startDate) &&
            this.validateEndDate(this.props.EditBrandListUpload.endDate) &&
            this.validateDescription(this.props.EditBrandListUpload.description) &&
            this.validateSelectModel(this.props.EditBrandListUpload.selectVal) &&
            this.validateYear(this.props.EditBrandListUpload.year) &&
            this.validateSeasonal(this.props.EditBrandListUpload.seasonal) &&
            this.validateMetaData(this.props.EditBrandListUpload.metaData) &&
            !!this.props.EditBrandListUpload.file_id
    }

    isDisabled() {
        return this.state.disabledValue || !this.checkEnabledState();
    }

    addBrandVideo(event) {
        event.preventDefault();
        if (!this.checkEnabledState()) {
            return;
        }

        this.setState({disabledValue: true});
        this.props.actions.updateVideoFile(() => {
            this.setState({disabledValue: false});
            this.props.onHide();
        });
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (prevState.uploaderParams.file !== nextProps.EditBrandListUpload.file_id) {
            return {
                resetUploader: !!nextProps.EditBrandListUpload.file_id,
                uploaderParams: {
                    file: nextProps.EditBrandListUpload.file_id
                }
            }
        }

        return null;
    }

    /**
     * Clear memory
     */
    componentWillUnmount() {
        if (this.uploader) {
            delete this.uploader;
        }
    }

    onTagChange(tags) {
        this.props.actions.updateChosenVideo({tags});
    }

    createNewTags(tags) {
        const config = { headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/x-www-form-urlencoded'
        }};
        const tagsData = tags.slice();

        if (!tagsData.length) {
            return Promise.resolve([]);
        }

        return new Promise((resolve, reject) => {
            axios.post( `${this.props.host}tags/queryTag`, qs.stringify({'tags':tagsData}), config)
            .then(function (data) {
                if (data.error) {
                    reject(data.error);
                } else {
                    resolve(data.data);
                }
            })
            .catch(function (error) {
                reject(error.message);
            });
        });
    }

    render() {
        const helpText = (text) => this.state.validateValue && text ? (<HelpBlock>{text}</HelpBlock>) : null;
        const startDate = this.props.EditBrandListUpload.startDate && moment(this.props.EditBrandListUpload.startDate * 1000).isValid()
            ? moment(this.props.EditBrandListUpload.startDate * 1000).format()
            : '';
            const endDate = this.props.EditBrandListUpload.endDate && moment(this.props.EditBrandListUpload.endDate * 1000).isValid()
            ? moment(this.props.EditBrandListUpload.endDate * 1000).format()
            : '';

        if (this.state.resetUploader || !this.props.showWin) {
            delete this.uploader;
        }

        let modelNames = this.props.modelNames.map(modelName => {return { label: modelName.name, value: modelName.id };});
        modelNames.unshift({ label: 'Select Model...', value: 0});

        return (
            <Modal show={this.props.showWin} bsSize="large" >
                <Modal.Header onHide={this.props.onHide} closeButton>
                    <Modal.Title>{this.props.EditBrandListUpload.id > 0 ? "Brand Edit" : "Brand Upload"}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="modelScroll">
                    <form name="loginForm" onSubmit={this.addBrandVideo} noValidate>
                        <div><h5>File Metadata:</h5></div>
                        <div className="row">
                            <div className="col-sm-6">
                                <FormGroup controlId="dispName" validationState={this.checkFieldValid.call(this, "dispName")}>
                                    <ControlLabel>Display Name</ControlLabel>
                                    <FormControl type="text" value={this.props.EditBrandListUpload.dispName} onKeyDown={this.noValidateHandler} onChange={this.dispNameChange} placeholder="Enter Display Name"/>
                                    {helpText(this.state.dispNameHelpBlock)}
                                </FormGroup>
                                <div className="row">
                                    <div className="col-sm-5">
                                        <FormGroup validationState={this.checkFieldValid.call(this, "startDate")}>
                                            <label htmlFor="startDate">Run After</label>
                                            <DatePicker
                                                id="startDate"
                                                dateFormat="MM/DD/YYYY"
                                                value={startDate}
                                                onChange={this.startDateChange}
                                                onClear={this.noValidateHandler}
                                            />
                                            {helpText(this.state.startDateHelpBlock)}
                                        </FormGroup>
                                    </div>

                                    <div className="col-sm-5">
                                        <FormGroup validationState={this.checkFieldValid.call(this, "endDate")}>
                                            <label htmlFor="endDate">Run Before</label>
                                            <DatePicker
                                                id="endDate"
                                                dateFormat="MM/DD/YYYY"
                                                value={endDate}
                                                onChange={this.endDateChange}
                                                onClear={this.noValidateHandler}
                                            />
                                            {helpText(this.state.endDateHelpBlock)}
                                        </FormGroup>
                                    </div>
                                </div>
                                <FormGroup controlId="description" validationState={this.checkFieldValid.call(this, "description")}>
                                    <ControlLabel>Description</ControlLabel>
                                    <FormControl componentClass="textarea" className={Styles.description} value={this.props.EditBrandListUpload.description} onKeyDown={this.noValidateHandler} onChange={this.descriptionChange} placeholder="Enter Description here..."/>
                                    {helpText(this.state.descriptionHelpBlock)}
                                </FormGroup>
                                { this.props.category != 0
                                  ? (<div className={Styles.modelBox}>
                                        <FormGroup controlId="selectModel" className={Styles.selectModel} validationState={this.checkFieldValid.call(this, "selectVal")}>
                                            <ControlLabel>Select Model</ControlLabel>
                                            <Select
                                                id="selectModel"
                                                name="selectVal"
                                                value={this.props.EditBrandListUpload.selectVal}
                                                onChange={this.selectModelChange}
                                                options={modelNames}
                                            />
                                        </FormGroup>
                                        <FormGroup controlId="addModel" className={Styles.addModelBtn}>
                                            <ControlLabel style={{visibility: 'hidden'}}>Add Model</ControlLabel>
                                                <Button bsStyle="primary" onClick={() => { this.showModal() }} type="button"><i className="fa fa-plus-circle"></i>&nbsp; Edit</Button>
                                        </FormGroup>
                                        <FormGroup controlId="modelYear" className={Styles.yearOfModel} validationState={this.checkFieldValid.call(this, "year")}>
                                            <ControlLabel>Model year</ControlLabel>
                                            <FormControl type="number" value={this.props.EditBrandListUpload.year} onKeyDown={this.noValidateHandler} onChange={this.yearChange} placeholder="Enter the Year"/>
                                            {helpText(this.state.yearHelpBlock)}
                                        </FormGroup>
                                    </div>)
                                  : null }

                                <FormGroup controlId="seasonal" validationState={this.checkFieldValid.call(this, "seasonal")}>
                                    <ControlLabel>Seasonal</ControlLabel>
                                    <FormControl type="text" value={this.props.EditBrandListUpload.seasonal} onKeyDown={this.noValidateHandler} onChange={this.seasonalChange} placeholder="Enter Seasonal Name"/>
                                    {helpText(this.state.seasonalHelpBlock)}
                                </FormGroup>
                                <FormGroup controlId="metaData" validationState={this.checkFieldValid.call(this, "metaData")}>
                                    <ControlLabel>Additional Meta Data</ControlLabel>
                                    <FormControl type="text" value={this.props.EditBrandListUpload.metaData} onKeyDown={this.noValidateHandler} onChange={this.metaDataChange} placeholder="Additional Meta Data"/>
                                    {helpText(this.state.metaDataHelpBlock)}
                                </FormGroup>
                                <FormGroup controlId="Tags">
                                    <ControlLabel>Tags</ControlLabel>
                                    <Tags value={this.props.EditBrandListUpload.tags} onChange={this.onTagChange} createTags={this.createNewTags} placeholder={"Enter tags"} id="Tags" name="tags" />
                                </FormGroup>
                            </div>
                            <div className="col-sm-6">
                                <FormGroup validationState={this.checkFieldValid.call(this, "file")}>
                                    <Gallery uploader={this.getUploader()}></Gallery>
                                    {helpText(this.state.fileHelpBlock)}
                                </FormGroup>

                                <FormGroup>
                                    <Button  bsStyle="primary" type="submit" disabled={this.isDisabled()} value="Submit" >
                                        <i className="fa fa-check-square"></i>&nbsp;{this.props.EditBrandListUpload.id > 0 ? "UPDATE" : "Save"}</Button>
                                </FormGroup>
                            </div>
                        </div>
                        <br></br>
                        <Modal.Footer></Modal.Footer>
                    </form>
                </Modal.Body>
                <BrandModel showWin={this.state.addModal} onHide={this.toggleModel}/>
            </Modal>
        )
    }
}

function mapStateToProps(state) {
    return {
        category: state.Category,
        EditBrandListUpload: state.BrandVideo.ChosenBrandVideo,
        modelNames: state.Models.ModelList.Data,
        host: state.Host
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
)(AddBrandVideo);