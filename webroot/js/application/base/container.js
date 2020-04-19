define(['./component'], function(Component) {
    var Container = function (config) {
        Component.apply(this, arguments);
        this.items = {};
    };
    Container.prototype = Object.create(Component.prototype);

    $.extend(Container.prototype, {
        /**
         * Render component
         * @param element
         */
        renderTo: function(element) {
            if (element) {
                if (!(element instanceof HTMLElement)) {
                    this.container = document.getElementById(element);
                } else {
                    this.container = element;
                }

                this.removeListeners();
                while (this.container.firstChild) {
                    this.container.removeChild(this.container.firstChild);
                }
                this.html = $.parseHTML(this.getHtml());
                this.html.forEach(function(el) {
                    this.container.append(el);
                }, this);

                this.addListeners();
                this.initComponent();

                this.rendered = true;
                var numToRender = 0;
                if (Object.keys(this.items).length > 0) {
                    numToRender = Object.keys(this.items).length;
                    Object.keys(this.items).forEach(function(key) {
                        var item = this.items[key];
                        item.parent = this;
                        item.on('render', function() {
                            --numToRender;
                        });
                        item.renderTo(this.getPasteContainer(key, item));
                    }, this);
                }

                if (numToRender == 0) {
                    this.fireEvent('render', this);
                }
            }
        },

        /**
         * Return paste container
         * @param key
         * @param item
         * @returns {*}
         */
        getPasteContainer:function(key, item) {
            return this.html[0];
        }
    });

    return Container;
});