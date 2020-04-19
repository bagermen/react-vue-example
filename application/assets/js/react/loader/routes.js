import React, { Component } from 'react';
import { Route, Switch, Redirect } from 'react-router';
import { withCookies, Cookies } from 'react-cookie';
import { PropTypes, instanceOf } from 'prop-types';
import { ConnectedRouter } from 'connected-react-router'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as Actions from './actions/index';
import Full from './containers/Full/';
import BrandDash from './views/Brand/';

class Routes extends Component {
      static get propTypes() {
            return {
                  history: PropTypes.any.isRequired,
                  cookies: instanceOf(Cookies).isRequired
            }
      }

      render() {
            return (
<ConnectedRouter history={this.props.history}>
      <div>
            <Route exact path="/" render={() => <Redirect to="/loader" />}/>
            <Full>
                  <Switch>
                        <Route path="/loader" name="Loader" component={BrandDash} />
                  </Switch>
            </Full>
      </div>
</ConnectedRouter>
            )
      }
}

function mapStateToProps(state) {
      return { };
    }

function mapDispatchToProps(dispatch) {
      return {
            actions: bindActionCreators(Actions, dispatch)
      };
}

export default connect(
      mapStateToProps,
      mapDispatchToProps
)(withCookies(Routes));