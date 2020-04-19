import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { FormGroup, FormControl, Button, InputGroup, ListGroup, ListGroupItem } from 'react-bootstrap';
import classNames from 'classnames';
import * as Styles from './ValueEditorModule.scss';

class ValueEditor extends Component {
    static propTypes = {
        selected: PropTypes.object,
        items: PropTypes.array.isRequired,
        loading: PropTypes.bool.isRequired,
        onSelect: PropTypes.func.isRequired,
        onCreate: PropTypes.func.isRequired,
        onUpdate: PropTypes.func.isRequired,
        onDelete: PropTypes.func.isRequired,
        idProp: PropTypes.string.isRequired,
        nameProp: PropTypes.string.isRequired,
        disabledProp: PropTypes.string,
        displayName: PropTypes.func
    }

    static defaultProps = {
        selected: {},
        items: [],
        loading: false,
        onSelect: () => {},
        onCreate: () => {},
        onUpdate: () => {},
        onDelete: () => {},
        idProp: 'id',
        nameProp: 'name',
        disabledProp: ''
    }

    constructor(...props) {
        super(...props);

        this.getItemStyle = this.getItemStyle.bind(this);
        this.isItemExactMatch = this.isItemExactMatch.bind(this);
        this.getItemsList = this.getItemsList.bind(this);
        this.isAllowEdit = this.isAllowEdit.bind(this);
        this.isItemDisabled = this.isItemDisabled.bind(this);
        this.isItemListSelected = this.isItemListSelected.bind(this);
        this.itemName = this.itemName.bind(this);
        this.updateFilterValue = this.updateFilterValue.bind(this);
        this.updateSelectedValueName = this.updateSelectedValueName.bind(this);
        this.onEditItem = this.onEditItem.bind(this);
        this.deleteItem = this.deleteItem.bind(this);
        this.addItem = this.addItem.bind(this);
        this.saveItem = this.saveItem.bind(this);
        this.reset = this.reset.bind(this);

        this.state = {
            addNew: false, // true if "Add" button is pressed
            editMode: false, // true if edit mode
            filterValue: '', // value of filter
            selectedValueName: '' // value of edit
        };
    }

    /**
     * Check if item is shown as disabled item in the list
     * @param {*} item
     * @return {Boolean}
     */
    isItemDisabled(item) {
        if (this.state.editMode) {
            return true;
        }

        if (this.props.disabledProp) {
            return !! item[this.props.disabledProp];
        } else {
            return false;
        }
    }

    /**
     * Do on item select
     * @param {*} item
     * @param {*} e
     */
    onSelectItem(item, e) {
        e.preventDefault();
        if (!this.isItemDisabled(item)) {
            this.props.onSelect(item);
        }
    }

    /**
     * Check if item is selected in the list
     * @param {*} item
     */
    isItemListSelected(item) {
        return this.props.selected && !this.state.editMode
            ? this.props.selected[this.props.idProp] === item[this.props.idProp]
            : false
    }

    /**
     * Check if selected item could be edited
     */
    isAllowEdit() {
        let search;
        if (this.props.selected && this.props.selected[this.props.idProp]) {
            search = this.props.items.filter((item) => item[this.props.idProp] === this.props.selected[this.props.idProp]);

            return search.length == 1;
        } else {
            return false;
        }
    }

    /**
     * Render item name
     * @param {*} item
     */
    itemName(item) {
        if (this.props.displayName) {
            return this.props.displayName(item);
        } else {
            return item[this.props.nameProp];
        }
    }

    /**
     * Change filter value
     * @param {*} e
     */
    updateFilterValue(e) {
        this.setState({
            filterValue: e.target.value
        });
    }

    /**
     * Change item value
     * @param {*} e
     */
    updateSelectedValueName(e) {
        this.setState({
            selectedValueName: e.target.value
        });
    }

    /**
     * Do on item edit
     * @param {*} e
     */
    onEditItem(e) {
        e.preventDefault();
        this.setState({
            editMode: true,
            addNew: false,
            selectedValueName: this.props.selected[this.props.nameProp]
        });
    }

    /**
     * Do on item add
     * @param {*} e
     */
    addItem(e) {
        e.preventDefault();
        this.setState({
            editMode: true,
            addNew: true,
            selectedValueName: ''
        });
    }

    /**
     * Do on item save
     * @param {*} e
     */
    saveItem(e) {
        e.preventDefault();

        if (this.state.addNew) {
            this.props.onCreate(this.state.selectedValueName).then(() => this.reset());
        } else {
            this.props.onUpdate(this.props.selected[this.props.idProp], this.state.selectedValueName).then(() => this.reset());
        }
    }

    /**
     * Do on item delete
     * @param {*} e
     */
    deleteItem(e) {
        e.preventDefault();
        this.props.onDelete(this.props.selected[this.props.idProp]).then(() => this.reset());
    }

    /**
     * Do on reset
     * @param {*} e
     */
    reset(e = null) {
        if (e) {
            e.preventDefault();
        }

        this.setState({
            addNew: false,
            editMode: false,
            selectedValueName: ''
        });
    }

    /**
     * Filtered list of items to render
     */
    getItemsList() {
        const matchFunc = (item, value) => item[this.props.nameProp].toLowerCase().indexOf(value.toLowerCase()) > -1;

        return this.props.items.filter((item) => {
            if (this.state.editMode) {
                if (!this.state.addNew && this.props.selected && this.props.selected[this.props.idProp] && this.props.selected[this.props.idProp] === item[this.props.idProp]) {
                    return true;
                }
                return (this.state.selectedValueName.length) ? matchFunc(item, this.state.selectedValueName) : true;
            } else {
                if (this.props.selected && this.props.selected[this.props.idProp] && this.props.selected[this.props.idProp] === item[this.props.idProp]) {
                    return true;
                }
                return (this.state.filterValue.length) ? matchFunc(item, this.state.filterValue) : true;
            }
        });
    }

    /**
     * Check if item name equals to edited item name
     * @param {*} item
     */
    isItemExactMatch(item) {
        return item[this.props.nameProp] === this.state.selectedValueName;
    }

    /**
     * Color items list
     * @param {*} item
     */
    getItemStyle(item) {
        let exact;
        if (this.state.editMode) {
            exact = this.isItemExactMatch(item);
            if (this.state.addNew) {
                return exact ? 'danger' : null;
            } else if (this.props.selected && this.props.selected[this.props.idProp] && this.props.selected[this.props.idProp] === item[this.props.idProp]) {
                return 'info';
            } else {
                return exact ? 'danger' : null;
            }
        } else {
            return null;
        }
    }

    render() {
        const items = this.getItemsList();
        const checkSaveIsDisabled = () => this.state.editMode && this.state.selectedValueName.length > 0
            ? items.filter((item) => this.isItemExactMatch(item)).length > 0
            : true;

        return (
            <div className={Styles.valuesListWrapper}>
                <FormGroup className={classNames(Styles.propertyEditor)}>
                    <InputGroup className={classNames({ hidden: this.state.editMode })}>
                        <FormControl placeholder="Search..." value={this.state.filterValue} onChange={this.updateFilterValue}/>
                        <InputGroup.Button>
                            <Button className={classNames("fa-pencil-square-o", Styles.fa2, { hidden: !this.isAllowEdit() } )} onClick={this.onEditItem} data-toggle="tooltip" title="Edit selected value"></Button>
                            <Button className={classNames("fa-trash-o", Styles.fa2, { hidden: !this.isAllowEdit() } )} onClick={this.deleteItem} data-toggle="tooltip" title="Remove selected value"></Button>
                            <Button className={classNames("fa-plus", Styles.fa2)} onClick={this.addItem}><span className={Styles.buttonLeftMargin}>New</span></Button>
                        </InputGroup.Button>
                    </InputGroup>
                    <InputGroup className={classNames({ hidden: !this.state.editMode } )}>
                        <FormControl placeholder="" value={this.state.selectedValueName} onChange={this.updateSelectedValueName}/>
                        <InputGroup.Button>
                            <Button className={classNames("fa-floppy-o", Styles.fa2, {disabled: checkSaveIsDisabled() })} onClick={this.saveItem}><span className={Styles.buttonLeftMargin}>Save</span></Button>
                            <Button className={classNames("fa-undo", Styles.fa2)} onClick={this.reset}><span className={Styles.buttonLeftMargin}>Cancel</span></Button>
                        </InputGroup.Button>
                    </InputGroup>
                </FormGroup>
                <ListGroup className={classNames(Styles.list, {hidden: items.length === 0})}>
                    { items.map(item =>
                        <ListGroupItem
                            href="#"
                            bsStyle={this.getItemStyle(item)}
                            className={classNames({
                                active: this.isItemListSelected(item),
                                [Styles.notAllowed]: this.isItemDisabled(item)})
                            }
                            disabled={this.isItemDisabled(item) && !this.isItemExactMatch(item) && this.getItemStyle(item) !== 'info'}
                            key={item[this.props.idProp]}
                            onClick={this.onSelectItem.bind(this, item)}
                        >{this.itemName(item)}</ListGroupItem>
                    )}
                </ListGroup>
                <div className={classNames(Styles.valuesListWrapperLoader, { hidden: !this.props.loading })}/>
            </div>
        )
    }
}

export default ValueEditor;