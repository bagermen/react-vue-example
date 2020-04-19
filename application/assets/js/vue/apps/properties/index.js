import Vue from 'vue'
import store from './store'
import App from './App.vue'
import './scss/properties.scss'

new Vue({
    el: '#properties_app',
    store: store,
    components: {
        App
    }
});
