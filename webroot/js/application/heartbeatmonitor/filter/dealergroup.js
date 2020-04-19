define(['module', './dealergroup_cls'], function(module, Dealergroup) {
    var config = module.config();

    return new Dealergroup(config);
});