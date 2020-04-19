<template>
    <popup errorid="error_dialog" confirmid="confirm_dialog" class="container-fluid">
        <div class="row">
            <div class="col-md-6"><properties-list class="form-control" @select="onSelect"></properties-list></div>
        </div>
        <div class="row">
            <div class="col-md-6"><values-list :property="selected"></values-list></div>
        </div>
    </popup>
</template>

<script>
import PropertiesList from './components/PropertiesList.vue'
import ValuesList from './components/ValuesList.vue'
import Popup from './components/Popup.vue'
export default {
    name: 'app',
    components: {
        PropertiesList,
        ValuesList,
        Popup
    },
    data() {
        return {
            selected: null
        }
    },
    methods: {
        onSelect(value) {
            this.selected = value;
        }
    }
}
</script>

<style scoped>
</style>

