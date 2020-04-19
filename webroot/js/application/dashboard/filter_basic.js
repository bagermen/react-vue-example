define(['module', './filter'], function(module, Filter) {

    var config = module.config();
    if (!config.dateFormat) {
        config.dateFormat = 'MM/DD/YYYY HH:mm';
    }

    if (config.date_range) {
        var range = config.date_range.split('|');
        if (range.length == 2) {
            config.startDate = range[0].toString();
            config.endDate = range[1].toString();
        }
    }

    if (!config.startDate || !config.endDate) {
        config.startDate = moment().subtract(1, 'hour').format(config.dateFormat);
        config.endDate = moment().format(config.dateFormat)
    }

    var filter = new Filter(config);
    filter.init();

    return filter;

});