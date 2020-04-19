define([
    'module',
    './monitor_filter',
    './monitor_devices'

], function(module, filter, monitor) {
    var lastQuery = {};

    return {
        run: function() {
            this.init();
            this.doRequest(null, filter.getValues());
        },

        doRequest: function(sc, params) {
            lastQuery = $.extend({}, params);
            monitor.draw(params);
        },

        init: function() {
            filter.init();
            monitor.setTimezone(filter.getTimezone());
            monitor.init();

            // bind events
            filter.on('search', this.doRequest);
        }
    };
});