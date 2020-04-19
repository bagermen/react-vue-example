define(['../base/observable'], function(Observable) {
    var Loader = function (config) {
        Observable.apply(this, arguments);
        this.container = config.container;
        this.rootUrl = config.root;
        this.url = config.url;
    };

    Loader.prototype = Object.create(Observable.prototype);

    $.extend(Loader.prototype, {
        init: function() {
            
        },
        
        updateHtml: function() {
            var tpl = '';
            tpl += '<div style="text-align: center" >';
            tpl +=     '<img src="' + this.rootUrl + 'img/ring-alt.gif" />';
            tpl +=     '<p>Loading Info</p>';
            tpl += '</div>';

            this.getContainer().innerHTML = tpl;
        },

        /**
         * Perform loading
         * @param {Object} params
         * @param {Function=}callback
         * @param {Object=} scope
         */
        load: function(params, callback, scope) {
            var self = this;
            this.reset();
            this.updateHtml();
            $.post( this.url, params ).done(function( response ) {
                if (typeof response == 'string') {
                    var reg = /window\..+;/;
                    var match = response.match(reg);

                    if (match && match.length > 0) {
                        eval(match[0]);
                    }
                }
                self.reset();

                var scope = (typeof scope == 'object' && scope !== null) ? scope : this;
                if (typeof callback == 'function') {
                    callback.call(scope, response);
                }

                self.fireEvent('load', response);
            });
        },
        
        getContainer: function() {
            return document.getElementById(this.container);
        },

        reset: function() {
            var container = this.getContainer();

            while (container.firstChild) {
                container.removeChild(container.firstChild);
            }
        }
    });

    return Loader;
});