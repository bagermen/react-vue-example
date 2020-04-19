define(['./observable'], function(Observable) {
    var Component = function (config) {
        Observable.apply(this, arguments);
        this.container = null;
        this.parent = null;
        this.html = null;
        this.rendered = false;
        this.visible = true;
        this.addEvents('render', 'show', 'hide');
    };
    Component.prototype = Object.create(Observable.prototype);

    $.extend(Component.prototype, {
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
                this.setVisible(this.visible);
                this.fireEvent('render', this);
            }
        },

        /**
         * Remove DOM listeners if any
         */
        removeListeners: function() {

        },

        /**
         * Add DOM Listeners if any
         */
        addListeners: function() {

        },

        /**
         * Return html for this component
         */
        getHtml: function() {

            return '<div></div>';
        },

        /**
         * Do some initialization
         */
        initComponent: function() {

        },

        /**
         * Container
         * @returns {null|*}
         */
        getContainer: function() {
            return this.container;
        },

        /**
         * Returns parent
         * @returns {null|Object}
         */
        getParent: function() {
            return this.parent;
        },

        setVisible: function(visible) {
            if (this.visible != visible) {
                this.visible = !!visible;
                if (this.html) {
                    var style = this.container.style;
                    if (visible) {
                        style.removeProperty('display');
                    } else {
                        style.setProperty('display', 'none');
                    }
                }

                this.fireEvent(this.visible ? 'show' : 'hide', this);
            }
        }
    });

    return Component;
});