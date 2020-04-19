define(['../../base/field'], function(Field) {
    var Dealership = function (config) {
        Field.apply(this, arguments);

        this.Url = config.Url;

        this.value = "";

        this.addEvents('change', 'addfilter');
    };
    Dealership.prototype = Object.create(Field.prototype);

    $.extend(Dealership.prototype, {
        initComponent: function() {
            Field.prototype.initComponent.call(this);

            this.on('render', this.onRender, this);
            this.on('addfilter', this.onFilterClick, this);
        },

        onRender: function() {
            this.initLists();
        },

        onFilterClick: function() {
            add_filter_handler();
        },

        /**
         * Remove DOM listeners if any
         */
        removeListeners: function() {
            $(this.getSelectEl()).off('change', this.onValueChange);
            $(this.getButtonEl()).off('click', this.onButtonClick);
            this.un('render', this.onRender);
            this.un('addfilter', this.onFilterClick);
        },

        /**
         * Add DOM Listeners if any
         */
        addListeners: function() {
            var data = { scope: this };
            $(this.getSelectEl()).on('change', data, this.onValueChange);
            $(this.getButtonEl()).on('click', data, this.onButtonClick);
        },

        onButtonClick: function(e) {
            e.preventDefault();
            var self = e.data.scope;
            self.fireEvent('addfilter', self, self.getValue());
        },

        onValueChange: function(e) {
            var self = e.data.scope;
            self.value = self.getValue();
            self.fireEvent('change', self);
        },

        getHtml: function() {
            var data =
                '<label class="control-label">Dealership:</label>' +
                '<select class="form-control dealership" style="margin-right: 10px;">' +
                    '<option value="">---</option>' +
                '</select>' +
                '<button class="btn btn-warning btn-sm">Add Filter</button>';

            return data;
        },

        getValue: function() {
            if (this.rendered) {
                this.value = this.getSelectEl().value
            }

            return this.value;
        },

        setValue: function(value) {
            this.value = value;

            if (this.rendered) {
                this.initLists()
            } else {
                this.fireEvent('change', this);
            }
        },

        initLists: function() {
            var self = this;

            this.resetSelect();
            this.updateSelect().then(function() {
                self.fireEvent('change', self);
            });
        },

        getName: function() {
            return 'dealerhip_filter';
        },

        /**
         * Reset select list
         */
        resetSelect: function() {
            var select = this.getSelectEl();

            while (select.firstChild) {
                select.removeChild(select.firstChild);
            }

            select.innerHTML = '<option value="">---</option>';
            select.value = "";
            this.value = "";
        },

        updateSelect: function() {
            var url = this.Url;
            var self = this;
            var defer = $.Deferred();

            var fillDataFunc = function(data) {
                data = data.data;
                var select = self.getSelectEl();
                var value = self.value;
                self.resetSelect();

                data.forEach(function(dealership) {
                    $(select).append('<option value="' + dealership.device_group_id + '">' + dealership.name + '</option>');
                }, this);

                var inList = false;

                if (data.length > 0) {
                    inList = data.filter(function(opt) {
                        return value == opt.device_group_id;
                    }).length > 0;
                }

                if (inList) {
                    self.value = value;
                    self.setValueEl(value);
                } else {
                    self.setValueEl("");
                    self.value = "";
                }

                defer.resolve(data);
            };

            var errorFunc = function() {
                defer.fail();
            };

            $.ajax({
                type: "GET",
                url: url,
                success: fillDataFunc,
                error: errorFunc,
                dataType: 'json'
            });

            return defer.promise();
        },

        setValueEl: function(value) {
            var select = this.getSelectEl();

            if (select) {
                select.value = value;
            }
        },

        getSelectEl: function() {
            return this.container ? this.container.querySelector('select') : null;
        },

        getButtonEl: function() {
            return this.container ? this.container.querySelector('button.btn-sm') : null;
        },

        clear: function() {
            this.setValue("");
        }
    });

    return Dealership;
});