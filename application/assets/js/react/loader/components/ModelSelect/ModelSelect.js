import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import styles from './Style.js';

/**
 * Wrapper over react-select with Bootstrap syling
 */
class ModelSelect extends Component {
    static propTypes = {
        value: PropTypes.number,
        onChange: PropTypes.func.isRequired,
        isSearchable: PropTypes.bool.isRequired,
        isClearable: PropTypes.bool.isRequired,
        id: PropTypes.string,
        name: PropTypes.string
    }

    static defaultProps = {
        value: null,
        onChange: () => {},
        isSearchable: true,
        isClearable: true,
        id: null,
        name: null
    }

    constructor(...props) {
        super(...props);
        this.onValueChange = this.onValueChange.bind(this);
        this.state = {
            value: null
        }
    }

    onValueChange(value) {
        this.props.onChange(value);
    }

    static getDerivedStateFromProps(props, state) {
        let selected,
            result ={};
        if (props.value) {
            selected = props.options.findIndex(option => option.value == props.value);
        }
        result['value'] = selected > -1 ? props.options[selected] : null;

        return Object.keys(result).length ? result : null;
    }

    render() {
        return (
            <Select
                id={this.props.id}
                name={this.props.name}
                isSearchable={this.props.isSearchable}
                isClearable={this.props.isClearable}
                clearValue={this.onValueChange}
                value={this.state.value}
                onChange={this.onValueChange}
                options={this.props.options}
                styles={styles}
            />
        );
    }
}


export default ModelSelect;