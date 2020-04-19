
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as Actions from '../../actions/index';
import { FormGroup, ListGroup, ListGroupItem, Button, FormControl, Glyphicon } from 'react-bootstrap';
import classNames from 'classnames';
import * as Styles from './BrandModule.scss';

class Brand extends Component {
  static propTypes = {
    actions: PropTypes.object.isRequired,
    expand: PropTypes.bool.isRequired,
    filter: PropTypes.string.isRequired,
    BrandList: PropTypes.array.isRequired,
    SelectedBrand: PropTypes.object.isRequired,
    onTriggerActiveList: PropTypes.func.isRequired
  }

  static defaultProps = {
    expand: true,
    filter: "",
    BrandList: [],
    SelectedBrand: {}
  }

  constructor(...args) {
    super(...args);
    this.asideToggle = this.asideToggle.bind(this);
    this.OnChangeInputDealerSearch = this.OnChangeInputDealerSearch.bind(this);
    this.onTriggerClick = this.onTriggerClick.bind(this);
    this.state = { };
  }

  asideToggle(data, g) {
    g.preventDefault();
      if (this.props.SelectedBrand.id !== data.id) {
        this.props.actions.OnClickBrand(data);
    }
  }

  OnChangeInputDealerSearch(event) {
    this.props.actions.OnChangeInputDealerSearch(event.target.value);
  }

  onTriggerClick(e) {
    e.preventDefault();
    e.stopPropagation();

    this.props.onTriggerActiveList(!this.props.expand);
  }

  render() {
    return (
      <div className={classNames("box", Styles.main, {[Styles.expandedBox]: this.props.expand})}>
        <div className={classNames(Styles.searchBox)}>
          <FormGroup controlId="selectBrand" className={Styles.inputBox}>
            <FormControl type="text" onChange={this.OnChangeInputDealerSearch} value={this.props.filter} placeholder="Search" ></FormControl>
          </FormGroup>
          <FormGroup controlId="splitter" className={Styles.buttonBox}>
            <Button type="button" onClick={this.onTriggerClick}><Glyphicon glyph="expand"/></Button>
          </FormGroup>
        </div>
        <div>
          <ListGroup className={Styles.brandList}>
            { this.props.BrandList && this.props.BrandList.length > 0
              ? this.props.BrandList.map(BrandList =>
                  (
                    <ListGroupItem href="#"
                      className={Styles.listItem}
                      key={BrandList.id}
                      active={ BrandList.id == this.props.SelectedBrand.id ? true : false }
                      onClick={this.asideToggle.bind(this, BrandList)}>{BrandList.name}</ListGroupItem>
                  )
                )
              : (<div className=" NoDataList"> No data</div>)
          }
          </ListGroup>
        </div>
      </div>
    )
  }
}

const filterBrands = (brandList, value) => {
  return value === ""
    ? brandList
    : brandList.filter(Data => (Data.name.toLowerCase()).match(value.toLowerCase()));
}

function mapStateToProps(state) {
  return {
      filter: state.Brand.filter,
      BrandList: filterBrands(state.Brand.Data, state.Brand.filter),
      SelectedBrand: state.Brand.SelectedBrand
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
)(Brand);