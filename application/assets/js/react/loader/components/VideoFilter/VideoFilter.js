
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as Actions from '../../actions/index';

import DatePicker from 'react-bootstrap-date-picker';
import moment from 'moment';
import { FormGroup, ControlLabel, FormControl } from 'react-bootstrap';
import Select from '../ModelSelect/ModelSelect';
import Tags from '../Tags/Tags';
import * as Styles from './VideoFilterModule.scss';

class VideoFilter extends Component {
    static propTypes = {
        dispName: PropTypes.string.isRequired,
        selectVal: PropTypes.number.isRequired,
        startDate: PropTypes.number,
        endDate: PropTypes.number,
        active: PropTypes.bool.isRequired,
        modelList: PropTypes.array,
        category: PropTypes.number.isRequired
    }

    static defaultProps = {
        dispName: "",
        selectVal: 0,
        startDate: 0,
        endDate: 0,
        active: true,
        modelList: [],
        category: 0
    }

    constructor(...props) {
        super(...props);

        this.nameChange = this.nameChange.bind(this);
        this.selectModelChange = this.selectModelChange.bind(this);
        this.startDateChange = this.startDateChange.bind(this);
        this.endDateChange = this.endDateChange.bind(this);
        this.onActionChange = this.onActionChange.bind(this);
        this.onTagChange = this.onTagChange.bind(this);
    }

    /**
     * On name change
     * @param {*} event
     */
    nameChange(event) {
        this.props.actions.updateVideoFilter({
            dispName: event.target.value
        });
    }

    /**
     * On model change
     * @param {*} event
     */
    selectModelChange(data) {
        this.props.actions.updateVideoFilter({
            selectVal: data? data.value: 0
        });
    }

    startDateChange(event) {
        let startDate = moment(event).isValid() ? moment(event).startOf('day').unix() : null;
        this.props.actions.updateVideoFilter({
            startDate: startDate
        });
    }

    endDateChange(event) {
        let endDate = moment(event).isValid() ? moment(event).startOf('day').unix() : null;
        this.props.actions.updateVideoFilter({
            endDate: endDate
        });
    }

    onActionChange(event) {
        this.props.actions.updateVideoFilter({
            active: !!event.target.checked
        });
    }

    onTagChange(tags) {
        this.props.actions.updateVideoFilter({tags});
    }

    render() {
        const startDate = this.props.startDate && moment(this.props.startDate * 1000).isValid() ? moment(this.props.startDate * 1000).format() : '';
        const endDate = this.props.endDate && moment(this.props.endDate * 1000).isValid() ? moment(this.props.endDate * 1000).format() : '';
        let modelNames = this.props.modelList.map(modelName => {return { label: modelName.name, value: modelName.id };});
        modelNames.unshift({ label: 'All models', value: 0});

        return (
            <div className={Styles.filters}>
                <FormGroup controlId="dispName">
                    <ControlLabel>Name</ControlLabel>
                    <FormControl type="text" placeholder="Enter Name" value={this.props.dispName} onChange={this.nameChange}/>
                </FormGroup>
                {
                    this.props.category != 0
                ? (<FormGroup controlId="selectModel">
                        <ControlLabel>Select Model</ControlLabel>
                        <Select id="selectModel" value={this.props.selectVal} onChange={this.selectModelChange} options={modelNames} />
                    </FormGroup>)
                : null
                }

                <FormGroup >
                    <label htmlFor="startDate">Running After</label>
                    <DatePicker
                        id="startDate"
                        dateFormat="MM/DD/YYYY"
                        value={startDate}
                        onChange={this.startDateChange}
                        placeholder="Click to date"
                    />
                </FormGroup>
                <FormGroup>
                    <label htmlFor="endDate">Runnig Before</label>
                    <DatePicker
                        id="endDate"
                        dateFormat="MM/DD/YYYY"
                        value={endDate}
                        onChange={this.endDateChange}
                        placeholder="Click to date"
                    />
                </FormGroup>
                <FormGroup controlId="Tags Filter">
                    <ControlLabel>Tags</ControlLabel>
                    <Tags value={this.props.tags} onChange={this.onTagChange} placeholder={"Enter tags"} id="Tags" name="tags" />
                </FormGroup>
                <FormGroup controlId="isActive">
                    <label className="checkbox-inline"><input type="checkbox" checked={this.props.active} onChange={this.onActionChange}/><b>Active Only</b></label>
                </FormGroup>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        category: state.Category,
        dispName: state.BrandVideo.VideoFilter.dispName,
        selectVal: state.BrandVideo.VideoFilter.selectVal,
        startDate: state.BrandVideo.VideoFilter.startDate,
        endDate: state.BrandVideo.VideoFilter.endDate,
        active: state.BrandVideo.VideoFilter.active,
        modelList: state.Models.ModelList.Data,
        tags: state.BrandVideo.VideoFilter.tags,
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
)(VideoFilter);