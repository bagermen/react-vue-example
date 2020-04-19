<template>
    <div class="">
        <div class="input-group" v-show="showSearch">
            <input type="text" class="form-control" placeholder="Search..." v-model="filterValue">
            <div class="input-group-btn">
                <button class="fa2 fa-filter btn btn-default" :class="{ active: filterValues }" type="button" @click.prevent="onFilterClick" data-toggle="tooltip" :title="filterTooltip" :data-original-title="filterTooltip"></button>
                <button class="fa2 fa-pencil-square-o btn btn-default" type="button" v-show="isAllowEdit" @click.prevent="onEditItem" data-toggle="tooltip" title="Edit selected value"></button>
                <button class="fa2 fa-trash-o btn btn-default" type="button"  v-show="isAllowEdit" @click.prevent="deleteItem" data-toggle="tooltip" title="Remove selected value"></button>
                <button class="fa2 fa-plus btn btn-default" @click.prevent="addItem"><span style="margin-left: 5px;">New</span></button>
            </div>
        </div>
        <div class="input-group" v-show="!showSearch">
            <input type="text" class="form-control" placeholder="" v-model="selectedValueName">
            <div class="input-group-btn">
                <button class="fa2 fa-floppy-o btn btn-default" type="button" @click.prevent="saveItem"><span style="margin-left: 5px;">Save</span></button>
                <button class="fa2 fa-undo btn btn-default" type="button" @click.prevent="reset"><span style="margin-left: 5px;">Cancel</span></button>
            </div>
        </div>
    </div>
</template>

<script>
import * as mutations from '../store/Mutations';
import { mapGetters, mapActions, mapState } from 'vuex';

export default {
    name: 'value-editor',
    data() {
        return {
            selected: {}
        }
    },
    computed: {
        filterValue: {
            ...mapState({'get': (state) => state.editor.filterValue}),
            set(val) {
                this.$store.commit(mutations.SET_FILTER, val);
            }
        },
        selectedValueName: {
            get() {
                return this.$store.state.selectedValue.name;
            },
            set(val) {
                let selected = {...this.$store.state.selectedValue};
                selected.name = val;
                this.$store.dispatch('onSelectedUpdate', { selected: selected});
            }
        },
        ...mapGetters({'isAllowEdit':'isAllowEdit'}),
        ...mapState({
            'showSearch': (state) => state.editor.showSearch,
            'filterValues': (state) => state.editor.filterValues
        }),
        filterTooltip() {
            return this.filterValues ? "Show all values" : "Filter used values";
        }
    },
    methods: {
        addItem() {
            this.selected = {...this.$store.state.selectedValue};
            this.$store.dispatch('onAddItem');
        },
        onEditItem() {
            this.selected = {...this.$store.state.selectedValue};
            this.$store.dispatch('onEditItem');
        },
        saveItem() {
            this.$store.dispatch('saveValue');
        },
        deleteItem() {
            this.$store.dispatch('deleteValue');
        },
        reset() {
            this.$store.dispatch('onReset', { selected: this.selected });
        },
        onFilterClick() {
            this.$store.dispatch('onFilterValues');
        }
    }
}
</script>

<style scoped>
    .fa2 {
        font-family: FontAwesome;
        font-style: normal;
        font-weight: 400;
        -webkit-font-smoothing: antialiased;
    }
</style>
