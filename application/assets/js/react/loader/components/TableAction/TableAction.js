
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

/**
 * Table action link
 */
class TableAction extends Component {
    static propTypes = {
        href: PropTypes.string.isRequired,
        iconClass: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        action: PropTypes.func,
        preventDefault: PropTypes.bool.isRequired,
        stopPropagation: PropTypes.bool.isRequired
    }

    static defaultProps = {
        href: '#',
        iconClass: '',
        title: '',
        preventDefault: true,
        stopPropagation: true
    }

    constructor(...args) {
        super(...args);
        this.onActionClick = this.onActionClick.bind(this);
    }

    onActionClick(event, ...args) {
        if (this.props.preventDefault) {
            event.preventDefault();
        }

        if (this.props.stopPropagation) {
            event.stopPropagation();
        }

        if (this.props.action) {
            this.props.action(event, ...args);
        }
    }

    render() {
        return (
            <a href={this.props.href} title={this.props.title ? this.props.title : null} onClick={this.onActionClick}><i className={classNames("fa fa-fw", this.props.iconClass)}></i></a>
        )
    }
}

export default TableAction;