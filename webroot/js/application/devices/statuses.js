define(['module', './statuses_cls'], function(module, DeviceStatuses) {
    var config = module.config();

    return new DeviceStatuses(config);
});