define(['../../base/field'], function(Field) {
    var Dealershipandgroup = function (config) {
        Field.apply(this, arguments);

        this.dealershipUrl = config.dealershipUrl;
        this.dealergroupUrl = config.dealergroupUrl;


        this.value = {
            dealership: "",
            dealergroup: ""
        };

        this.addEvents('change', 'addfilter');
    };
    Dealershipandgroup.prototype = Object.create(Field.prototype);

    $.extend(Dealershipandgroup.prototype, {
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
            $(this.getDealershipEl()).off('change', this.onDealershipChange);
            $(this.getGroupDealershipEl()).off('change', this.onGroupDealershipChange);
            $(this.getButtonEl()).off('click', this.onButtonClick);
            this.un('render', this.onRender);
            this.un('addfilter', this.onFilterClick);
        },

        /**
         * Add DOM Listeners if any
         */
        addListeners: function() {
            var data = { scope: this };
            $(this.getDealershipEl()).on('change', data, this.onDealershipChange);
            $(this.getGroupDealershipEl()).on('change', data, this.onGroupDealershipChange);
            $(this.getButtonEl()).on('click', data, this.onButtonClick);
        },

        onButtonClick: function(e) {
            e.preventDefault();
            var self = e.data.scope;
            self.fireEvent('addfilter', self, self.getValue());
        },

        onDealershipChange: function(e) {
            var self = e.data.scope;
            self.value.dealership = self.getDealership();
            self.fireEvent('change', self);
        },

        onGroupDealershipChange: function(e) {
            var self = e.data.scope;
            self.value.dealergroup = self.getGroupDealership();
            self.fireEvent('change', self);
        },

        getHtml: function() {
            var data =
                '<label class="control-label">Dealer Group:</label>' +
                '<select class="form-control dealergroup" style="margin-right: 10px;">' +
                    '<option value="">---</option>' +
                '</select>' +

                '<label class="control-label">Dealership:</label>' +
                '<select class="form-control dealership" style="margin-right: 10px;">' +
                    '<option value="">---</option>' +
                '</select>' +
                '<button class="btn btn-warning btn-sm">Add Filter</button>';

            return data;
        },

        getValue: function() {
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

            this.resetDealership();
            this.resetGroupDealership();
            this.updateDealership().then(function() {
                self.updateGroupDealership().then(function() {
                    self.fireEvent('change', self);
                });
            });
        },

        getName: function() {
            return 'dealerhip_filter';
        },

        /**
         * Reset dealership list
         */
        resetDealership: function() {
            var dealershiplist = this.getDealershipEl();

            while (dealershiplist.firstChild) {
                dealershiplist.removeChild(dealershiplist.firstChild);
            }

            dealershiplist.innerHTML = '<option value="">---</option>';
            dealershiplist.value = "";
            this.value.dealership = "";
        },

        /**
         * Reset dealership group list
         */
        resetGroupDealership: function() {
            var groupdealership = this.getGroupDealershipEl();

            if (groupdealership) {
                while (groupdealership.firstChild) {
                    groupdealership.removeChild(groupdealership.firstChild);
                }

                groupdealership.innerHTML = '<option value="">---</option>';
                groupdealership.value = "";
            }

            this.value.dealergroup = "";
        },

        updateDealership: function() {
            var url = this.dealershipUrl;
            var self = this;
            var defer = $.Deferred();

            var fillDataFunc = function(data) {
                data = data.data;
                var dealershiplist = self.getDealershipEl();
                var value = self.value.dealership;
                self.resetDealership();

                data.forEach(function(dealership) {
                    $(dealershiplist).append('<option value="' + dealership.device_group_id + '">' + dealership.name + '</option>');
                }, this);

                var inList = false;

                if (data.length > 0) {
                    inList = data.filter(function(opt) {
                        return value == opt.device_group_id;
                    }).length > 0;
                }

                if (inList) {
                    self.value.dealership = value;
                    self.setDealershipEl(value);
                } else {
                    self.setDealershipEl("");
                    self.value.dealership = "";
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

        updateGroupDealership: function() {
            var url = this.dealergroupUrl;
            var self = this;
            var defer = $.Deferred();
            var fillDataFunc = function(data, status) {
                data = data.data;
                var dealershipGroupEl = self.getGroupDealershipEl();
                var value = self.value.dealergroup;
                self.resetGroupDealership();

                data.forEach(function(group) {
                    $(dealershipGroupEl).append('<option value="' + group.property_value_id + '">' + group.value + '</option>');
                }, this);
                var inList = false;

                if (data.length > 0) {
                    inList = data.filter(function(opt) {
                        return value == opt.property_value_id;
                    }).length > 0;
                }

                if (inList) {
                    self.value.dealergroup = value;
                    self.setGroupDealershipEl(value);
                } else {
                    self.setGroupDealershipEl("");
                    self.value.dealergroup = "";
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

        getDealership: function() {
            if (this.rendered) {
                this.value.dealership = this.getDealershipEl().value
            }

            return this.value.dealership;
        },

        getGroupDealership: function() {
            if (this.rendered) {
                this.value.dealergroup = this.getGroupDealershipEl().value
            }

            return this.value.dealergroup;
        },

        getDealershipEl: function() {
            return this.container ? this.container.querySelector('select.dealership') : null;
        },

        setDealershipEl: function(value) {
            var dealership = this.getDealershipEl();

            if (dealership) {
                dealership.value = value;
            }
        },

        getGroupDealershipEl: function() {
            return this.container ? this.container.querySelector('select.dealergroup') : null;
        },

        getButtonEl: function() {
            return this.container ? this.container.querySelector('button.btn-sm') : null;
        },

        setGroupDealershipEl: function(value) {
            var group = this.getGroupDealershipEl();

            if (group) {
                group.value = value;
            }
        },

        clear: function() {
            this.setValue({
                dealership: "",
                dealergroup: ""
            });
        }
    });

    return Dealershipandgroup;
});