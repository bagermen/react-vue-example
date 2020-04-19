<template>
    <div class="values-list-wrapper">
        <value-editor v-show="valuesCount" class="propertyEditor"></value-editor>
        <div class="list-group list">
            <a href="#" class="list-group-item" :class="isActive(item)" v-for="item in items" :key="item.id" @click.prevent="onSelectItem(item.id)">{{ item.name }}</a>
        </div>
        <div class="values-list-wrapper__loader" v-show="isLoading"></div>
    </div>
</template>

<script>

import ValueEditor from './ValueEditor.vue';
import * as mutations from '../store/Mutations';
import { mapGetters, mapActions, mapState } from 'vuex';
import axios from 'axios';

export default {
    name: 'values-list',
    components: {
        ValueEditor
    },
    props: {
        "property": {
            default: 0,
        }
    },
    data() {
        return { }
    },
    computed: {
        ...mapGetters({
            items: 'values/allValues',
            valuesCount: 'values/valuesCount'
        }),
        ...mapState({
            selectedValue: 'selectedValue',
            isLoading: 'isLoading'
        })
    },
    methods: {
        onSelectItem(id) {
            this.$store.dispatch('selectValue', id);
        },
        isActive(item) {
            let val = this.$store.state.selectedValue;
            return {
                active: val && item.id ? (val.id == item.id) : false,
                disabled: item.used
            }
        }
    },
    watch: {
        property: function(val) {
            this.$store.commit(mutations.SELECT_PROPERTY, val);
            this.$store.dispatch('resetValues');
            this.$store.dispatch('values/getAllValues', {
                propertyId: val
            });
        }
    }
}
</script>

<style scoped>
    .propertyEditor {
        margin-top: 5px;
        margin-bottom: 5px;
    }

    .list-group-item.disabled, .list-group-item.disabled:focus, .list-group-item.disabled:hover {
        cursor: not-allowed;
    }

    .list {
        overflow-y: auto;
        max-height: 400px;
    }

    .values-list-wrapper {
        position: relative;
    }

    .values-list-wrapper__loader {
        position: absolute;
        width: 100%;
        height: 100%;
        background-color: grey;
        background-image: url('/img/loading.gif');
        background-position: center;
        background-repeat: no-repeat;
        opacity: 0.5;
        top: 0;
        z-index: 100;
    }


</style>
