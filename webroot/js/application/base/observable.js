/**
 * This was mostly taken from ExtJS v3 which is open-source version
 * Original: EXTUTIL.Observable
 */
define(['./event' ], function(Event) {

    var Observable = function() {
        var me = this, e = me.events;
        if(me.listeners) {
            me.on(me.listeners);
            delete me.listeners;
        }
        me.events = e || {};
    };

    Observable.prototype = Object.create({
        // private
        filterOptRe : /^(?:scope|delay|buffer|single)$/,

        fireEvent : function(){
            var a = Array.prototype.slice.call(arguments, 0),
                ename = a[0].toLowerCase(),
                me = this,
                ret = true,
                ce = me.events[ename],
                cc,
                q,
                c;
            if (me.eventsSuspended === true) {
                if (q = me.eventQueue) {
                    q.push(a);
                }
            }
            else if(typeof ce == 'object') {
                if (ce.bubble){
                    if(ce.fire.apply(ce, a.slice(1)) === false) {
                        return false;
                    }
                    c = me.getBubbleTarget && me.getBubbleTarget();
                    if(c && c.enableBubble) {
                        cc = c.events[ename];
                        if(!cc || typeof cc != 'object' || !cc.bubble) {
                            c.enableBubble(ename);
                        }
                        return c.fireEvent.apply(c, a);
                    }
                }
                else {
                    a.shift();
                    ret = ce.fire.apply(ce, a);
                }
            }
            return ret;
        },

        addListener : function(eventName, fn, scope, o){
            var me = this,
                e,
                oe,
                ce;

            if (typeof eventName == 'object') {
                o = eventName;
                Object.keys(o).forEach(function(e) {
                    oe = o[e];
                    if (!me.filterOptRe.test(e)) {
                        me.addListener(e, oe.fn || oe, oe.scope || o.scope, oe.fn ? oe : o);
                    }
                });
            } else {
                eventName = eventName.toLowerCase();
                ce = me.events[eventName] || true;
                if (typeof ce == 'boolean') {
                    me.events[eventName] = ce = new Event(me, eventName);
                }
                ce.addListener(fn, scope, typeof o == 'object' ? o : {});
            }
        },

        /**
         * Removes an event handler.
         * @param {String}   eventName The type of event the handler was associated with.
         * @param {Function} handler   The handler to remove. <b>This must be a reference to the function passed into the {@link #addListener} call.</b>
         * @param {Object}   scope     (optional) The scope originally specified for the handler.
         */
        removeListener : function(eventName, fn, scope){
            var ce = this.events[eventName.toLowerCase()];
            if (typeof ce == 'object') {
                ce.removeListener(fn, scope);
            }
        },

        /**
         * Removes all listeners for this object
         */
        purgeListeners : function(){
            var events = this.events,
                evt,
                key;

            Object.keys(events).forEach(function(key) {
                evt = events[key];
                if(typeof evt == 'object'){
                    evt.clearListeners();
                }
            });
        },

        /**
         * Adds the specified events to the list of events which this Observable may fire.
         * @param {Object|String} o Either an object with event names as properties with a value of <code>true</code>
         * or the first event name string if multiple event names are being passed as separate parameters.
         * @param {string} Optional. Event name if multiple event names are being passed as separate parameters.
         * Usage:<pre><code>
         this.addEvents('storeloaded', 'storecleared');
         </code></pre>
         */
        addEvents : function(o) {
            var me = this;
            me.events = me.events || {};
            if (typeof o == 'string') {
                var a = arguments,
                    i = a.length;
                while(i--) {
                    me.events[a[i]] = me.events[a[i]] || true;
                }
            } else {
                $.extend(me.events, o, $.extend({}, me.events));
            }
        },

        /**
         * Checks to see if this object has any listeners for a specified event
         * @param {String} eventName The name of the event to check for
         * @return {Boolean} true if the event is being listened for, else false
         */
        hasListener : function(eventName) {
            var e = this.events[eventName.toLowerCase()];
            return typeof e == 'object' && e.listeners.length > 0;
        },

        /**
         * Suspend the firing of all events. (see {@link #resumeEvents})
         * @param {Boolean} queueSuspended Pass as true to queue up suspended events to be fired
         * after the {@link #resumeEvents} call instead of discarding all suspended events;
         */
        suspendEvents : function(queueSuspended) {
            this.eventsSuspended = true;
            if(queueSuspended && !this.eventQueue){
                this.eventQueue = [];
            }
        },

        /**
         * Resume firing events. (see {@link #suspendEvents})
         * If events were suspended using the <tt><b>queueSuspended</b></tt> parameter, then all
         * events fired during event suspension will be sent to any listeners now.
         */
        resumeEvents : function() {
            var me = this,
                queued = me.eventQueue || [];
            me.eventsSuspended = false;
            delete me.eventQueue;
            queued.forEach(function(e) {
                me.fireEvent.apply(me, e);
            });
        }
    });

    Observable.prototype.on = Observable.prototype.addListener;
    Observable.prototype.un = Observable.prototype.removeListener;

    return Observable;
});