define(['module', './monitor'], function(module, Monitor) {
    var config = module.config();

    return new Monitor(config);
});