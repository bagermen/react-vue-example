import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { AsyncCreatable, components } from 'react-select';
import styles from './Style.js';

/**
 * Tags component
 */
class Tags extends Component {
    static propTypes = {
        id: PropTypes.string,
        name: PropTypes.string,
        value: PropTypes.any.isRequired,
        placeholder: PropTypes.string,
        delimiter: PropTypes.string.isRequired,
        minTagLength: PropTypes.number.isRequired,

        isClearable: PropTypes.bool.isRequired,
        isDisabled: PropTypes.bool.isRequired,

        onChange: PropTypes.func.isRequired,
        getOptionLabel: PropTypes.func.isRequired,
        getOptionValue: PropTypes.func.isRequired,
        getNewOptionData: PropTypes.func.isRequired,
        createTags: PropTypes.func
    }

    static defaultProps = {
        id: null,
        name: null,
        placeholder: null,
        minTagLength: 3,
        delimiter: "|",
        isDisabled: false,
        value: [],
        onChange: () => {},
        getOptionLabel: (option) => option.name,
        getOptionValue: (option) => option.id,
        createTags: null,
        isClearable: false,
        getNewOptionData: (inputValue=null, optionLabel) => ({
            id: inputValue,
            name: optionLabel.toString()
        })
    }

    constructor(...props) {
        super(...props);
        this.onChange = this.onChange.bind(this);
        this.isValidNewOption = this.isValidNewOption.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.multiValueRemove = this.multiValueRemove.bind(this);

        this.state = {
            inputValue: '',
            id: 0
        }
    }

    handleInputChange(inputValue) {
        this.setState({ inputValue });
    }

    async handleKeyDown(event) {
        const { inputValue } = this.state;
        const value = this.props.value;
        let newTags;
        if (!inputValue || inputValue && inputValue.length < this.props.minTagLength) {
            return;
        };

        switch (event.key) {
            case 'Enter':
            case 'Tab':
                if (value.findIndex(tag => this.props.getOptionLabel(tag).toLowerCase().trim() === inputValue.toLowerCase().trim()) === -1) {
                    newTags = await this.createNewTags([this.props.getNewOptionData(null, inputValue)]);
                    await this.setState({ inputValue: '' });
                    this.props.onChange(value.slice().concat(newTags));
                }
                break;
        }
    }

    async onChange(newValue, { action }) {
        switch (action) {
            case "remove-value":
                this.props.onChange(newValue);
                break;
        }
    }

    async createNewTags(tags = []) {
        let id = this.state.id;
        if (typeof this.props.createTags === 'function') {
            return this.props.createTags(tags);
        }

        tags.map(tag => Object.assign(tag, this.props.getNewOptionData(++id, this.props.getOptionLabel(tag))));
        await this.setState({id});

        return tags;
    }

    isValidNewOption(inputValue, selectValue, selectOptions) {
        const compareOption = (inputValue, option) => {
            const candidate = inputValue.toLowerCase().trim();
            const label = this.props.getOptionLabel(option).toString().toLowerCase().trim();
            const value = this.props.getOptionValue(option).toString().toLowerCase().trim();

            return label === candidate || value === candidate;
        };

        return !(
            !inputValue ||
            selectValue.some(option => compareOption(inputValue, option)) ||
            selectOptions.some(option => compareOption(inputValue, option))
        );
    }

    multiValueRemove(props) {
        return !this.props.isDisabled ? (<components.MultiValueRemove {...props}/>) : null;
    }

    render() {
        return (
            <AsyncCreatable
                id={this.props.id}
                name={this.props.name}
                value={this.props.value}
                delimiter={this.props.delimiter}
                isDisabled={this.props.isDisabled}
                placeholder={this.props.placeholder}
                isClearable={this.props.isClearable}
                getOptionLabel={this.props.getOptionLabel}
                getOptionValue={this.props.getOptionValue}
                getNewOptionData={this.props.getNewOptionData}
                isMulti
                cacheOptions
                inputValue={this.state.inputValue}
                defaultOptions={false}
                menuIsOpen={false}
                styles={styles}
                components={{
                    DropdownIndicator: null,
                    MultiValueRemove: this.multiValueRemove
                }}
                isValidNewOption={this.isValidNewOption}
                onChange={this.onChange}
                onInputChange={this.handleInputChange}
                onKeyDown={this.handleKeyDown}
            />
        );
    }
}

export default Tags;