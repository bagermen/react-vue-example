define(['./component'], function(Component) {
    var Field = function (config) {
        Component.apply(this, arguments);
        this.value = null;
        this.name = null;
    };
    Field.prototype = Object.create(Component.prototype);

    $.extend(Field.prototype, {
        initComponent: function() {
            this.on('render', this.initValue, this);
        },

        initValue: function() {
            this.setValue(this.getValue());
        },

        getHtml: function() {
            return this.getName() ? '<input type="hidden" name="' + this.getName() + '">' : '<input type="hidden">';
        },

        getValue: function() {
            return this.rendered ? this.html.value : this.value;
        },

        setValue: function(value) {
            this.value = value;
            if (this.rendered) {
                this.html.value = value;
            }
        },

        getName: function() {
            return this.name;
        },

        clear: function() {
            this.setValue(null);
        }
    });

    return Field;
});