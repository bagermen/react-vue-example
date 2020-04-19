
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as Actions from '../../actions/index';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css'
import overlayFactory from 'react-bootstrap-table2-overlay';

import moment from 'moment';
import { Button } from 'react-bootstrap';
import TableAction from '../TableAction/TableAction.js';

import * as Styles from './VideoListModule.scss';

class VideoList extends Component {
    static propTypes = {
        VideoList: PropTypes.array.isRequired,
        onEdit: PropTypes.func.isRequired,
        onVideo: PropTypes.func.isRequired,
        onTableChange: PropTypes.func.isRequired,
        modelList: PropTypes.array,
        remote: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]).isRequired,
        loading: PropTypes.bool.isRequired,
        page: PropTypes.number.isRequired,
        totalSize: PropTypes.number.isRequired,
        sizePerPage: PropTypes.number.isRequired,
        sortField: PropTypes.string.isRequired,
        sortOrder: PropTypes.string.isRequired,
        ChosenBrandVideo: PropTypes.object,
        category: PropTypes.number.isRequired,
        selected: PropTypes.array.isRequired,
        allSelected: PropTypes.bool.isRequired
    }

    static defaultProps = {
        onEdit: () => {},
        onVideo: () => {},
        onTableChange: () =>{},
        modelList: [],
        remote: false,
        loading: false,
        page: 1,
        totalSize: 0,
        sizePerPage: 10,
        sortField: 'name',
        sortOrder: 'asc',
        ChosenBrandVideo: {},
        category: 0,
        selected: [],
        allSelected: false
    }

    constructor(...args) {
        super(...args);
        this.timeFormatter = this.timeFormatter.bind(this);
        this.nameFormat = this.nameFormat.bind(this);
        this.statusFormatter = this.statusFormatter.bind(this);
        this.actionFormatter = this.actionFormatter.bind(this);
        this.editFormatter = this.editFormatter.bind(this);
        this.onEditClick = this.onEditClick.bind(this);
        this.onVideoClick = this.onVideoClick.bind(this);
        this.modelFormatter = this.modelFormatter.bind(this);
        this.renderTotal = this.renderTotal.bind(this);
        this.onCheckRow = this.onCheckRow.bind(this);
        this.onCheckAll = this.onCheckAll.bind(this);

        this.state = {
            columns: [
                {
                    dataField: 'dispName',
                    text: 'Display Name',
                    formatter: this.nameFormat,
                    sort: true
                },
                {
                    dataField: 'startDate',
                    text: 'Run After',
                    formatter: this.timeFormatter,
                    sort: true
                },
                {
                    dataField: 'endDate',
                    text: 'Run Before',
                    formatter: this.timeFormatter,
                    sort: true
                },
                {
                    dataField: 'selectVal',
                    text: 'Model',
                    hidden: this.props.category === 0,
                    formatter: this.modelFormatter,
                    sort: true
                },
                {
                    dataField: 'active',
                    text: 'Status',
                    formatter: this.statusFormatter,
                    sort: true
                },
                {
                    dataField: 'actions',
                    formatter: this.actionFormatter,
                    text: 'Action',
                    headerStyle: {
                        width: '100px'
                    }
                },
                {
                    dataField: 'edit',
                    text: 'Edit',
                    formatter: this.editFormatter,
                    headerStyle: {
                        width: '50px'
                    }
                }
            ],
            selectRow: {
                mode: 'checkbox',
                clickToSelect: true,
                classes: 'active',
                selected: [],
                onSelect: this.onCheckRow,
                onSelectAll: this.onCheckAll,
                selectionRenderer: ({checked, disabled, mode}) => {
                    return (<input
                        type={mode}
                        disabled={disabled}
                        defaultChecked={checked}
                    />)
                },
                selectionHeaderRenderer: ({ mode, checked, indeterminate }) => {
                    return (<input
                        type={mode}
                        defaultChecked={checked || this.props.allSelected}
                        ref={(input) => { if (input) input.indeterminate = indeterminate && !this.props.allSelected; }}
                    />)
                }
            },
            remote: {
                pagination: true,
                sort: true
            },
            defaultSorted: [{
                dataField: this.props.sortField,
                order: this.props.sortOrder
            }]
        };
    }

    nameFormat(cell, row) {
        return (
            <div>
                <div className={Styles.fontWeight}>{cell}</div>
                <div className={Styles.fontColor}>{row.description}</div>
            </div>
        )
    }

    timeFormatter(cell, row) {
        let date = moment(parseInt(cell, 10) * 1000);
        return (
            <span>{date.isValid() ? date.format('MM/DD/YYYY'):'-/-'}</span>
        )
    }

    modelFormatter(cell, row) {
        let model = this.props.modelList.find((model) => model.id == cell);
        return (
            <span>{model ? model.name : ""}</span>
        )
    }

    statusFormatter(cell, row) {
        return (
            <span>{cell ? "Running" : "Disabled"}</span>
        )
    }

    actionFormatter(cell, row, event) {
        return (
            <Button bsStyle="primary" bsSize="small" onClick={this.onVideoClick.bind(this, row)}>View</Button>
        )
    }

    editFormatter(cell, row) {
        return (
            <TableAction iconClass="fa-pencil-square-o" action={this.onEditClick.bind(this, row)}/>
        )
    }

    onEditClick(row, event) {
        event.stopPropagation();
        this.chooseRow(row);
        this.props.onEdit(row.id, row);
    }

    onVideoClick(row, event) {
        event.stopPropagation();
        this.chooseRow(row);
        this.props.onVideo(row.id, row);
    }

    chooseRow(row) {
        this.props.actions.chooseBrandVideo(row);
    }

    renderTotal(from, to, size) {
        return (
            <div className="react-bootstrap-table-pagination-total">Adverts { from } - { to } of { size }</div>
        )
    }

    onCheckRow(row, isSelect) {
        this.props.actions[isSelect ? 'selectVideo' : 'unSelectVideo'](row.id);
    }

    onCheckAll(isSelect) {
        this.props.actions[isSelect ? 'selectAllVideo' : 'unSelectAllVideo']();
    }

    static getDerivedStateFromProps(props, state) {
        let columns,
            modelIdx,
            result ={};

        if (props.selected.length < state.selectRow.selected.length || props.selected.filter((v) => state.selectRow.selected.indexOf(v) === -1).length) {
            result['selectRow'] = Object.assign({}, state.selectRow, { selected: props.selected.slice() });
        }

        modelIdx = state.columns.findIndex(column => column.dataField === 'selectVal');
        if (modelIdx > -1) {
            columns = state.columns.slice();
            columns[modelIdx].hidden = props.category === 0;
            result['columns'] = columns;
        }

        return  Object.keys(result).length ? result : null;
    }

    /**
     * Dirty hack!!!
     * I have to reset data-toggle because external bootsrap overlap with react-bootsrap here
     */
    componentDidMount() {
        let dropDownBtn = document.querySelector('button[data-toggle="dropdown"]');
        dropDownBtn.dataset.toggle = "";
    }

    render() {
        return (
            <BootstrapTable
                    keyField='id'
                    data={ this.props.VideoList }
                    columns={ this.state.columns }
                    selectRow={ this.state.selectRow }
                    bordered={ false }
                    pagination={ paginationFactory({
                        page: this.props.page,
                        sizePerPage: this.props.sizePerPage,
                        totalSize: this.props.totalSize,
                        onPageChange: this.onPageChange,
                        onSizePerPageChange: this.onSizePerPageChange,
                        showTotal: true,
                        paginationTotalRenderer: this.renderTotal,
                        hidePageListOnlyOnePage: true,
                        sizePerPageList: [
                            { text: '10', value: 10 },
                            { text: '25', value: 25 },
                            { text: '50', value: 50 },
                            { text: '100', value: 100 },
                        ]
                    }) }
                    noDataIndication={ 'no files at selected folder' }
                    onTableChange={ this.props.onTableChange }
                    loading={ this.props.loading }
                    remote={ this.props.remote }
                    overlay={ overlayFactory({ spinner: true, background: 'rgba(192,192,192,0.3)' }) }
                    hover
                />
        )
    }
}

function mapStateToProps(state) {
    return {
        category: state.Category,
        VideoList: state.BrandVideo.BrandVideoList.Data,
        modelList: state.Models.ModelList.Data,
        loading:   state.BrandVideo.BrandVideoList.loading,
        sortField: state.BrandVideo.BrandVideoList.sortField,
        sortOrder: state.BrandVideo.BrandVideoList.sortOrder,
        totalSize: state.BrandVideo.BrandVideoList.totalSize,
        sizePerPage: state.BrandVideo.BrandVideoList.sizePerPage,
        page: state.BrandVideo.BrandVideoList.page,
        ChosenBrandVideo: state.BrandVideo.ChosenBrandVideo,
        selected: state.BrandVideo.SelectBrandVideo.list,
        allSelected: state.BrandVideo.SelectBrandVideo.all
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
)(VideoList);