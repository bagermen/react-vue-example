<template>
    <select class="dropup" v-model="selectedItem" v-selectpicker="selectOptions" @change="onValueChange">
        <option v-for="(item, id) in items" :key="id" :value="item.id">{{ item.name }}</option>
    </select>
</template>

<script>
import * as mutations from '../store/Mutations'
import selectpicker from '@/directives/SelectPicker';
import { mapGetters, mapActions, mapState } from 'vuex';

export default {
    name: 'properties-list',
    directives: {
        selectpicker
    },
    data() {
        return {
            selectOptions: {
                container: "body",
                liveSearch: true,
                title: 'Select property'
            },
            selectedItem: 0
        }
    },
    created () {
        this.$store.dispatch('properties/getAllProperties');
    },

    computed: {
        ...mapGetters({items: 'properties/allProperties'})
    },

    methods: {
        onValueChange() {
            this.$emit('select', this.selectedItem);

        }
    }
}
</script>

<style scoped>
</style>
