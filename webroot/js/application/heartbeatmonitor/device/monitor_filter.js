define(['module', './filter'], function(module, Filter) {

    var config = module.config();
    if (!config.dateFormat) {
        config.dateFormat = 'MM/DD/YYYY HH:mm';
    }

    if (config.dateRange) {
        var range = config.dateRange.split('|');
        if (range.length == 2) {
            config.startDate = range[0].toString();
            config.endDate = range[1].toString();
        }
    }

    if (config.device_uuid) {
        document.getElementById('device_uuid').value = config.device_uuid;
    }

    if (!config.startDate || !config.endDate) {
        // Today by default
        config.startDate = 'NOW';
        config.endDate = 'NOW';
    }

    config.timezone = config.timezone ? config.timezone: moment.tz.guess();

    return new Filter(config);
});