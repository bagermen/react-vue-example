define(['module', './dealership_cls'], function(module, Dealership) {
    var config = module.config();

    return new Dealership(config);
});