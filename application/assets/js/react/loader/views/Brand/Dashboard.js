import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import AsideBrand from '../../components/AsideBrand/AsideBrand';

import Brand from '../../components/Brand/';


import * as DealerActions from '../../actions/index';
import classNames from 'classnames';
import * as Styles from './DashboardModule.scss';

class BrandDash extends Component {
    static get propTypes() {
        return {
            actions: PropTypes.object.isRequired,
            category: PropTypes.number.isRequired,
            SelectedBrand: PropTypes.object.isRequired,
        }
    }

    static get defaultProps() {
        return {
            actions: {},
            category: 0,
            SelectedBrand: {},
        }
    }

    constructor(...props) {
        super(...props);
        this.setActiveList = this.setActiveList.bind(this);
        this.state = {
            activeList: true
        }
    }

    componentDidMount() {
        const root = document.getElementById('root');

        this.props.actions.selectTimezone(root.dataset.timezone ? root.dataset.timezone.toString() : '');
        this.props.actions.selectHost(root.dataset.host ? root.dataset.host.toString() : '');
        this.props.actions.selectCategory(root.dataset.property ? parseInt(root.dataset.property, 10) : 0);
        this.props.actions.BrandList(root.dataset.property, (list) => {
            if (list.length) {
                this.props.actions.OnClickBrand(list[0]);
            }
        });
    }

    setActiveList(state) {
        this.setState({activeList: state});
    }

    render() {
        return (
            <div className="row">
                <div className="col-xs-12">
                    <div className="box box-solid">
                        <div className="box-header">
                            <h3 className="box-title">{this.props.SelectedBrand.name}</h3>
                        </div>
                        <div className={classNames("box-body", Styles.loaderApp)}>
                            <div className={classNames(Styles.brandList, this.state.activeList ? Styles.brandListActive : null )} onClick={() => this.setActiveList(true)}>
                                <Brand expand={this.state.activeList} onTriggerActiveList={this.setActiveList} />
                            </div>
                            <div className={classNames(Styles.advertList, this.state.activeList ? null : Styles.advertListActive)} onClick={() => this.setActiveList(false)}>
                                { this.props.SelectedBrand.id > 0 ? (<AsideBrand/>) : ("") }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        SelectedBrand: state.Brand.SelectedBrand,
        category: state.Category
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(DealerActions, dispatch)
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(BrandDash);