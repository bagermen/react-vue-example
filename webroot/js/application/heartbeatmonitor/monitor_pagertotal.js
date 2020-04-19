define(['module', './pagertotal'], function(module, Pagertotal) {
    var config = module.config();

    return new Pagertotal(config);
});