define(['./dealership_cls'], function(Dealership) {
    var Dealergroup = function (config) {
        Dealership.apply(this, arguments);
    };
    Dealergroup.prototype = Object.create(Dealership.prototype);

    $.extend(Dealergroup.prototype, {
        getHtml: function() {
            var data =
                '<label class="control-label">Dealer Group:</label>' +
                '<select class="form-control dealership" style="margin-right: 10px;">' +
                    '<option value="">---</option>' +
                '</select>' +
                '<button class="btn btn-warning btn-sm">Add Filter</button>';

            return data;
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

                data.forEach(function(group) {
                    $(select).append('<option value="' + group.property_value_id + '">' + group.value + '</option>');
                }, this);

                var inList = false;

                if (data.length > 0) {
                    inList = data.filter(function(opt) {
                        return value == opt.property_value_id;
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
        }
    });

    return Dealergroup;
});