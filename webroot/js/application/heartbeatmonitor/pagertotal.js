/**
 * Pager.
 * It fires pageclick event with data: pager, clicked_page, total pages
 */
define(['../base/observable'], function(Observable) {
    var Pagertotal = function (config) {
        Observable.apply(this, arguments);
        this.container = config.container;
        this.limit = Number(config.limit ? config.limit : 9);
        this.currentLimit = this.limit;
        this.defaultItems = [
            9, 30, 90
        ];

        this.addEvents('selectlimit');
    };

    Pagertotal.prototype = Object.create(Observable.prototype);
    Pagertotal.prototype.constructor = Pagertotal;
    $.extend(Pagertotal.prototype, {
        init: function() {
            this.updateHtml();
        },

        /**
         * Render HTML and bind listeners
         */
        updateHtml: function() {
            var container = this.getContainer();
            var tpl = '';

            tpl +=  '<div class="pagination" style="margin-left: 5px;">';
            tpl +=      '<select class="form-control page-total" style="position:relative;float:left;">';
            this.getOptions().forEach(function(size) {
                tpl +=      '<option value="' + size + '" ' + (size == this.currentLimit ? 'selected="selected"' : '') + '>' + size + '</option>';
            }, this);
            tpl +=      '</select>';
            tpl +=  '</div>';


            if (container.children.length) {
                // remove child nodes
                while (container.firstChild) {
                    container.removeChild(container.firstChild);
                }
            }

            this.unbindHandlers();
            container.innerHTML = tpl;
            this.addHandlers();
        },

        getOptions: function() {
            var sizes = this.defaultItems.slice(0);
            sizes.push(this.currentLimit);
            sizes.sort(function(first, second) {
                return first - second;
            });

            return sizes.filter(function(value, index, self) {
                return self.indexOf(value) === index;
            });
        },

        /**
         * remove DOM click listeners
         */
        unbindHandlers: function() {
            $(this.getContainer()).off('change', 'select.page-total', this.onLimitSelect);
        },
        /**
         * Add DOM click listeners
         */
        addHandlers: function() {
            var scope = {scope: this };
            $(this.getContainer()).on('change', 'select.page-total', scope, this.onLimitSelect);
        },

        onLimitSelect: function(e) {
            var self = e.data.scope;

            self.fireEvent('selectlimit', self.getLimit(), self);
        },

        getLimit: function() {
            var el = this.getContainer().querySelector('select.page-total');
            if (el) {
                this.currentLimit = el.value;
            }

            return this.currentLimit;
        },

        /**
         * Update limit silently
         * @param numOfItems
         */
        setLimit: function(numOfItems) {
            this.limit = Number(numOfItems);
            this.currentLimit = this.limit;
            this.updateHtml();
        },

        /**
         * Pager container
         * @returns {HTMLElement}
         */
        getContainer: function() {
            return document.getElementById(this.container);
        }
    });

    return Pagertotal;
});