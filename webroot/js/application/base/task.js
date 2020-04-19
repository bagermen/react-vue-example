/**
 * This was mostly taken from ExtJS v3 which is open-source version
 * Original Ext.util.DelayedTask
 */
define(function(require) {
    function DelayedTask(fn, scope, args) {
        var me = this,
            id,
            call = function() {
                clearInterval(id);
                id = null;
                fn.apply(scope, args || []);
            };

        me.delay = function(delay, newFn, newScope, newArgs) {
            me.cancel();
            fn = newFn || fn;
            scope = newScope || scope;
            args = newArgs || args;
            id = setInterval(call, delay);
        };

        /**
         * Cancel the last queued timeout
         */
        me.cancel = function() {
            if(id) {
                clearInterval(id);
                id = null;
            }
        };
    }

    return DelayedTask;
});