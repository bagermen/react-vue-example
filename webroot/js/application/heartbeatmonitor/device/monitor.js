define(['../monitor'], function(Monitor) {
    var MonitorDevice = function (config) {
        Monitor.apply(this, arguments);
    };

    MonitorDevice.prototype = Object.create(Monitor.prototype);

    $.extend(MonitorDevice.prototype, {
        /**
         * Renders html based on response
         * @param {Array} devices
         * @param {Object} stats
         */
        updateHtml: function(devices, stats) {
            var tpl = '';
            var self = this;
            var data = {};

            tpl += '<div class="row">';
            tpl +=      '<div class="col-md-12">';
            tpl +=          '<div class="box box-solid provider-box">';
            tpl +=              '<div class="box-body">';
            tpl +=                  '<div class="row">';

            Object.keys(devices).forEach(function(uuid) {
                var device = devices[uuid];
                tpl +=                  '<div class="col-md-8 col-md-offset-2 col-sd-12  col-sm-12" style="text-align:center;">';
                //tpl +=                      '<span><b>' + self.htmlEncode(device['uuid']) + '</b></span>';

                if (stats[uuid]) {
                    tpl +=                  '<div id="' + self.getChartId(uuid) + '" class="chart" style="height:200px;"><svg></svg></div>';
                } else {
                    tpl +=                  '<p  id="' + self.getChartId(uuid) + '" class="chart" >There is no data to show.</p>';
                }
                tpl +=                  '</div>';
            });
            tpl +=                  '</div>';
            tpl +=              '</div>';
            tpl +=          '</div>';
            tpl +=      '</div>';
            tpl += '</div>';

            this.getContainer().innerHTML = tpl;
        }
    });

    return MonitorDevice;
});