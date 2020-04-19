define(['module', './pager'], function(module, Pager) {
    var config = module.config();

    return new Pager(config);
});