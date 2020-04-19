import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as Actions from '../../actions/index';
import { FormGroup, FormControl, Button } from 'react-bootstrap';
import BrandUpload from '../BrandUpload/BrandUpload';
import VideoPlayer from '../VideoPlayer/VideoPlayer';
import VideoFilter from '../VideoFilter/VideoFilter';
import VideoList from '../VideoList/VideoList';
import classNames from 'classnames';
import * as Styles from './AsideBrandModule.scss';

class AsideBrand extends Component {

  static propTypes = {
      SelectedBrand: PropTypes.object.isRequired,
      actions: PropTypes.any.isRequired,
      BrandVideoList: PropTypes.array.isRequired,
      host: PropTypes.string.isRequired,
      category: PropTypes.number.isRequired,
      selected: PropTypes.array.isRequired
  }

  static defaultProps = {
      selected: []
  }

  constructor(...props) {
    super(...props);

    this.onActionSelect = this.onActionSelect.bind(this);
    this.adsAction = this.adsAction.bind(this);

    this.triggerVideo = this.triggerVideo.bind(this);
    this.triggerEdit = this.triggerEdit.bind(this);
    this.onUploadNewClick = this.onUploadNewClick.bind(this);
    this.onTableChange = this.onTableChange.bind(this);
    this.onResetFilter = this.onResetFilter.bind(this);
    this.onFilterSearch = this.onFilterSearch.bind(this);

    this.state = {
      inAction: false,
      showVideo: false,
      showEdit: false,
      actionVal: 0
    };
  }

  triggerVideo() {
    this.setState({
      showVideo: !this.state.showVideo
    });
  }

  triggerEdit() {
    this.setState({
      showEdit: !this.state.showEdit
    });
  }

  onUploadNewClick() {
    this.props.actions.clearChosenVideo();
    this.triggerEdit();
  }

  onTableChange(type, page) {
    if (type == 'sort') {
      this.props.actions.videoListSortChange(page.sortField, page.sortOrder);
    } else if (type == 'pagination') {
      this.props.actions.videoListPageChange(page.page);
      this.props.actions.videoListPageSizeChange(page.sizePerPage);
    }

    this.props.actions.BrandVideoList(this.props.SelectedBrand.id, true);
  }

  onFilterSearch() {
    this.props.actions.videoListPageChange(0);
    this.props.actions.BrandVideoList(this.props.SelectedBrand.id, false);
  }

  onResetFilter(event) {
    event.preventDefault();
    this.props.actions.clearVideoFilter();
  }

  onActionSelect(event) {
    this.setState({
      actionVal: event.target.value
    });
  }

  adsAction(event) {
    this.setState({inAction: true});
    this.props.actions.adsAction(
      this.state.actionVal,
      this.state.actionVal != 3,
      (data) => {
        this.setState({inAction: false});
      }
    );
  }

  render() {
    return (
      <div>
        <div className={Styles.asideLayout}>
          <div className={classNames("box", Styles.header)}>
            <div className={Styles.headerName}>
            </div>
            <div className={Styles.headerSelect}>
              <FormGroup controlId="changeStatus">
                  <FormControl componentClass="select" onChange={this.onActionSelect} disabled={!this.props.selected.length} value={this.state.actionVal}>
                      <option value="0" disabled>Select Action</option>
                      <option value="1">Enable</option>
                      <option value="2">Disable</option>
                      <option value="3">Delete Permanently</option>
                  </FormControl>
              </FormGroup>
            </div>
            <div className={Styles.headerButton}>
              <Button bsStyle="primary" type="button" onClick={this.adsAction} disabled={!this.props.selected.length || this.state.actionVal == 0 || this.state.inAction} ><i className="fa fa-check-square"></i>&nbsp; Submit </Button>
            </div>
            <div className={Styles.headerButton}>
              <Button bsStyle="success" onClick={this.onUploadNewClick} type="button"><i className="fa fa-cloud-upload"></i>&nbsp; Upload</Button>
            </div>
          </div>
          <div className={classNames("box", Styles.filter)}>
            <div className={Styles.filters}>
              <Button  className={Styles.filterSearchBtn} bsStyle="primary" type="button" onClick={this.onFilterSearch} ><i className="fa fa-search"></i>&nbsp; Search </Button>
              <VideoFilter/>
              <div className="text-right"><a href="#" onClick={this.onResetFilter}><i className={"fa fa-fw fa-refresh"}/>Reset Filter</a></div>
            </div>
          </div>
          <div className={Styles.main}>
            <VideoList
              onTableChange={this.onTableChange}
              onVideo={this.triggerVideo}
              onEdit={this.triggerEdit}
              remote={{sort: true, pagination: true}}
            />
          </div>
        </div>
        { this.state.showVideo ? (<VideoPlayer showWin={this.state.showVideo} onHide={this.triggerVideo}/>) : null }
        { this.state.showEdit ? (<BrandUpload showWin={this.state.showEdit} onHide={this.triggerEdit}/>) : null }
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
      SelectedBrand: state.Brand.SelectedBrand,
      BrandVideoList: state.BrandVideo.BrandVideoList.Data,
      ChosenBrandVideo: state.BrandVideo.ChosenBrandVideo,
      category: state.Category,
      host: state.Host,
      selected: state.BrandVideo.SelectBrandVideo.list
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
)(AsideBrand);
