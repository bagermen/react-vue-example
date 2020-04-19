define(['../filter'], function(Filter) {
    var FilterDevice = function (config) {
        Filter.apply(this, arguments);
        this.daterangeInputIdHidden = 'filter_timezone_hidden';
    };

    FilterDevice.prototype = Object.create(Filter.prototype);

    $.extend(FilterDevice.prototype, {
        setTimeZone: function(timezone) {
            moment.tz.setDefault(timezone);

            var el = document.getElementById(this.timezoneInfoId);
            var elHidden = document.getElementById(this.daterangeInputIdHidden);
            el.innerText = timezone;
            elHidden.value = timezone;
        },

        initTimeZone: function() {

        }
    });

    return FilterDevice;
});