/**
 * Heartbeat monitor CORE
 */
define(['../base/observable', './loader', './axis', './customMultiChart'], function(Observable, Loader, Axis, customMultiChart) {
    var Monitor = function (config) {
        Observable.apply(this, arguments);

        this.loader = new Loader({
            root: config.root,
            url: config.request_uri,
            container: config.container
        });
        this.container = config.container;
        this.timezone = config.timezone ? config.timezone: 'America/Los_Angeles';
        this.dateFormat = config.dateFormat ? config.dateFormat: 'MM/DD/YYYY hh:mm';
        this.refUrl = config.ref_uri;

        this.noStatus = config.noStatus;
        this.showLegend = false;

        // IE fix
        if (!NodeList.prototype.forEach && Array.prototype.forEach) {
            NodeList.prototype.forEach = Array.prototype.forEach;
        }
    };

    Monitor.prototype = Object.create(Observable.prototype);

    $.extend(Monitor.prototype, {
        init: function() {
            this.initEvents();
        },
        draw: function(params) {
            this.reset();
            this.getLoader().load(params);
        },

        initEvents: function() {
            this.getLoader().on('load', this.onLoadData, this);
        },

        setTimezone: function(timezone) {
            this.timezone = timezone;
        },

        getColor: function(type) {
            var color;
            switch (type) {
                case 'green':
                    color = '#4AFB67';
                    break;
                case 'yellow':
                    color = '#fffc1a';
                    break;
                case 'red':
                    color = '#ffac26';
                    break;
                    break;
                default:
                    color = '#ffac26';
            }

            return color;
        },

        onLoadData: function(response) {
            var devices = this.devicesByUUID(response.devices);
            var stats = this.statsByUUID(response.stats);
            var range = response.query_dates;
            var step = response.step;
            var rangeRaw = response.filters_json.date_range;

            this.updateHtml(devices, stats, rangeRaw, range.timezone);
            this.renderCharts(stats, range, rangeRaw, step, Math.max(response.max_y_value, this.realMaxPlayingStatus(stats)));

            this.fireEvent('dataloaded', response);
        },

        realMaxPlayingStatus: function(stats) {
            var maxV = 0;
            Object.keys(stats).forEach(function(ts) {
                Object.keys(stats[ts]).forEach(function(uuid) {
                    var statuses = stats[ts][uuid].statuses;
                    if (statuses.hasOwnProperty('playing')) {
                        maxV = Math.max(maxV, statuses.playing);
                    }
                });
            });

            return maxV;
        },

        devicesByUUID: function(devices) {
            var res = {};

            if (devices && devices.forEach) {
                devices.forEach(function(data) {
                    res[data.uuid] = data;
                });
            }

            return res;
        },

        statsByUUID: function(stats) {
            var res = {};

            Object.keys(stats).forEach(function(ts) {
               Object.keys(stats[ts]).forEach(function(uuid) {
                   if (!res.hasOwnProperty(uuid)) {
                       res[uuid] = {};
                   }
                   res[uuid][ts] = $.extend({}, stats[ts][uuid]);
               });
            });

            return res;
        },

        showData: function(stats, uuid, range, rangeRaw, step, maxY) {
            var self = this;
            var keys = ['green', 'yellow', 'playing'];
            var batch = this.buildDataBatch(stats, range, step);
            var data = [];
            var statsTs = [];
            keys.forEach(function(key) {
                if (!batch.hasOwnProperty(key)) {
                    batch[key] = [];
                }
            });

            Object.keys(batch).forEach(function(key) {
                switch (key) {
                    case 'playing':
                        if (!self.noStatus) {
                            data.push({
                                type: "line",
                                name: key,
                                yAxis: 2,
                                key: 'Status: playing',
                                color: '#ED934A',
                                values: batch[key]
                            });
                        }
                        break;
                    case 'green':
                        data.push({
                            type: "bar",
                            name: key,
                            yAxis: 1,
                            key: 'Playing',
                            color: self.getColor('green'),
                            values: batch[key]
                        });
                        break;
                    case 'yellow':
                        data.push({
                            type: "bar",
                            name: key,
                            yAxis: 1,
                            key: 'Partially Playing',
                            color: self.getColor('yellow'),
                            values: batch[key]
                        });
                        break;
                    case 'red':
                        data.push({
                            type: "bar",
                            name: key,
                            yAxis: 1,
                            key: 'Offline',
                            color: self.getColor('red'),
                            values: batch[key]
                        });
                        break;
                    default:
                }
            });

            if (Object.keys(stats).length) {
                statsTs = statsTs.concat(Object.keys(stats));
            }
            
            if (range.end > moment().unix()) {
                statsTs.push(range.end);
            }
            if (statsTs) {
                statsTs = d3.extent(statsTs);
            }
            
            range.start = statsTs[0];
            range.end = statsTs[1];

            this.showChart(uuid, data, batch, range, rangeRaw, step, maxY);
        },

        showChart: function(uuid, data, batch, range, rangeRaw, step, maxY) {
            var self = this;
            var startTime = moment(range.start*1000).tz(self.timezone);
            var endTime = moment(range.end*1000).tz(self.timezone);
            var rawRanrawRangeArr = rangeRaw.split("|");

            rangeRaw = rawRanrawRangeArr[0] + '|' + rawRanrawRangeArr[1];

            nv.addGraph({
                generate: function() {
                    var chart = customMultiChart();
                    var angle = 0;

                    chart.xScale(d3.time.scale());
                    chart.forceX([range.start, range.end]);
                    chart.fixBar1(true);

                    switch (rangeRaw) {
                        case "PT1H|NOW":
                        case "PT1H|P1W":
                            angle = Axis.showHour(chart.xAxis, startTime, endTime, self.timezone);
                            break;
                        case "PT4H|NOW":
                        case "PT4H|P1W":
                            angle = Axis.show4Hour(chart.xAxis, startTime, endTime, self.timezone);
                            break;
                        case "PT12H|NOW":
                            angle = Axis.show12Hour(chart.xAxis, startTime, endTime, self.timezone);
                            break;
                        case "P1D|NOW":
                        case "NOW|NOW":
                            angle = Axis.showDay(chart.xAxis, startTime, endTime, self.timezone);
                            break;
                        case "P1W|NOW":
                        chart.forceX([range.start, range.end - step]); // stretch X axis
                            angle = Axis.showWeek(chart.xAxis, startTime, endTime.subtract(step, 'seconds'), self.timezone);
                            break;
                        default:
                        angle = Axis.showAuto(chart.xAxis, startTime, endTime.subtract(step, 'seconds'), self.timezone);
                    }
                    
                    chart.margin({
                            top: self.showLegend ? 50 : 20,
                            right: 100,
                            bottom: angle!= 0 ? 65 : 20,
                            left: angle!= 0 ? 75 : 20
                        })
                        .showLegend(self.showLegend);

                    if (self.showLegend) {
                        chart.legend.align(false);
                        chart.legend.rightAlign(true);
                        chart.legend.margin({ top:5, right:0, bottom:30, left:0 });
                    }

                    chart.yDomain1( [0, 1] );
                    chart.yAxis1.tickFormat( function( d ) {
                        return '';
                    });

                    chart.bars1.stacked(true);
                    chart.bars1.groupSpacing(0);

                    d3.select( '#'+ self.getChartId(uuid) +' svg' )
                        .datum( data )
                        .transition()
                        .call( chart );

                    nv.utils.windowResize( function() {
                        chart.update();
                    } );

                    return chart;
                },
                callback: function() {

                }
                }
            );
        },

        calcMax: function(batch, keys) {
            var toCalc = [];

            keys.forEach(function(k) {
                toCalc.push(d3.max(batch[k], function(line) {
                    return line.y;
                }));
            }, this);

            return d3.max(toCalc);
        },

        /**
         * convert response to chart lines
         * @param stats
         * @param range
         * @param step
         * @returns {{}}
         */
        buildDataBatch: function(stats, range, step) {
            var dataBatch = {};

            Object.keys(stats).forEach(function(timestamp) {
                var data = stats[timestamp];
                    var edge = parseInt(timestamp) + step;
                var skip = parseInt(timestamp) > range.end || edge > range.end || edge > moment().unix();

                    Object.keys(data).forEach(function(key) {
                        switch (key) {
                            case 'state':
                                if (!dataBatch.hasOwnProperty('green')) { dataBatch['green'] = []; }
                                if (!dataBatch.hasOwnProperty('yellow')) { dataBatch['yellow'] = []; }
                                if (!dataBatch.hasOwnProperty('red')) { dataBatch['red'] = []; }
    
                                var green = { x: parseInt(timestamp), y: 0 };
                                var yellow = { x: parseInt(timestamp), y: 0 };
                                var red = { x: parseInt(timestamp), y: 0 };
    
                                if (!skip) {
                                    var partialVisible = 1 << 1;
                                    var online = 1;

                                    // running stage logic calculation
                                    if ((data[key] & partialVisible)) {
                                        yellow.y = 1;
                                    }  else if ((data[key] & online)) {
                                        green.y = 1;
                                    } else {
                                        red.y = 1;
                                    }
                                }
                                dataBatch['green'].push(green);
                                dataBatch['yellow'].push(yellow);
                                dataBatch['red'].push(red);
    
                                break;
                            case 'statuses':
                                if (!dataBatch.hasOwnProperty('playing')) { dataBatch['playing'] = []; }
                                var playingHeartBeat = { x: parseInt(timestamp), y: 0 };
                                if (!skip) {
                                    if (data[key].hasOwnProperty('playing')) {
                                        playingHeartBeat.y = data[key]['playing'];
                                    }
                                }
    
                                    dataBatch['playing'].push(playingHeartBeat);
    
                                break;
                        }
                    }, this);
            }, this);

            return dataBatch;
        },

        reset: function() {
            var container = this.getContainer();

            while (container.firstChild) {
                container.removeChild(container.firstChild);
            }
        },

        /**
         * Renders html based on response
         * @param {Array} devices
         * @param {Object} stats
         * @param {String} rangeRaw
         * @param {String} timezone
         */
        updateHtml: function(devices, stats, rangeRaw, timezone) {
            var tpl = '';
            var self = this;
            var data = {};
            var statusText = function(type) {
                var status = '';
                switch (type) {
                    case 'green':
                        status += 'Playing';
                        break;
                    case 'yellow':
                        status += 'Partially Playing';
                        break;
                    case 'red':
                        status += 'Offline';
                        break;
                        break;
                    default:
                        status = type;
                }

                return status;
            };

            tpl += '<div class="row">';
            tpl +=      '<div class="col-md-12">';
            tpl +=          '<div class="box box-solid provider-box devices">';
            tpl +=              '<div class="box-body">';
            tpl +=                  '<div class="row">';

            if (Object.keys(devices).length) {
                Object.keys(devices).forEach(function(uuid) {
                    var device = devices[uuid];
                    var url = self.refUrl + '/' + device['uuid'];
                    tpl +=  '<div class="col-lg-4 col-md-6 col-sm-12 chart-box" style="text-align:center;">';
                    tpl +=  '<div class="inner-box">';
    
                    tpl += '<a target="_blank"  data-toggle="tooltip" title="Current Status: ' + statusText(device.current_status) + '" href="' + url + '" class="chart-details"><b>';
                    tpl +=      '<span>Serial Number: ' + self.htmlEncode(device['uuid']) + '</span>';
                    tpl +=    '</b>';
                    tpl +=    '<span style="margin-left:10px">(Current Status:</span>';
                    tpl +=    '<span class="device-status" style="margin-left:5px;color:' + self.getColor(device.current_status) + '">&#9679;</span>';
                    tpl +=    '<span>' + statusText(device.current_status) + ')</span>';
                    tpl += '</a>';
                    tpl += '<div class="device_info_table_wrap"><table class="device_info_table">';
                    tpl +=      '<tr>';
                    tpl +=          '<td>Dealership:</td>';
                    if (device.group && device.group.name) {
                        tpl +=      '<td>' + self.htmlEncode(device.group.name) + '</td>';
                    } else {
                        tpl +=      '<td>--</td>';
                    }
                    tpl +=      '</tr>';
                    tpl +=      '<tr>';
                    tpl +=          '<td>Dealer Group:</td>';
                    if (device.group.properties && device.group.properties["Dealer Group"] && device.group.properties["Dealer Group"].length) {
                        tpl +=      '<td>' + self.htmlEncode(device.group.properties["Dealer Group"][0]) + '</td>';
                    } else {
                        tpl +=      '<td>--</td>';
                    }
                    tpl +=      '</tr>';
                    tpl += '</table></div>';
    
                    if (stats[uuid]) {
                        tpl +=                      '<div id="' + self.getChartId(uuid) + '" class="chart" style="height:200px;"><svg></svg></div>';
                    } else {
                        tpl +=                      '<div  id="' + self.getChartId(uuid) + '" class="chart" style="height:200px;"><p>There is no data to show.</p></div>';
                    }
                    tpl +=                      '</div>';
                    tpl +=                  '</div>';
                });
            } else {
                tpl +=  '<div class="col-sm-12" style="text-align:center;">';
                tpl +=      '<div class="inner-box">';
                tpl +=      '<b>There are no devices matching the selected filters.</b>';
                tpl +=      '</div>';
                tpl +=  '</div>';
            }
            tpl +=                  '</div>';
            tpl +=              '</div>';
            tpl +=          '</div>';
            tpl +=      '</div>';
            tpl += '</div>';

            this.getContainer().innerHTML = tpl;

            // update urls
            var datesStr = $.param({'date_range': rangeRaw});
            var timezoneStr = $.param({'timezone': timezone});

            document.querySelectorAll('a.chart-details').forEach(function(e) {
                var link = e.getAttribute('href');
                var reg = /(^[^\?#]*)\??([^#]*)(#?.*$)/;
                var urlMatch = reg.exec(link);
                e.setAttribute('href', urlMatch[1] + '?' + datesStr  + '&' + timezoneStr + urlMatch[3]);
            });
        },

        /**
         * Fill charts with data
         * @param {Object} stats
         * @param {Object} range
         * @param {String} rangeRaw
         * @param {Number} maxY
         */
        renderCharts: function(stats, range, rangeRaw, step, maxY) {
            var self = this;
            if (stats) {
                Object.keys(stats).forEach(function(uuid) {
                    var deviceStats = stats[uuid];
                    self.showData(self.expandStats(deviceStats, range), uuid, range, rangeRaw, step,maxY);
                });
            }
        },

        /**
         * Add empty range. It's required for correct rendering
         */
        expandStats: function(stats, range) {
            return stats;
        },

        getChartId: function(uuid) {
            return 'chart_' + uuid.toString().replace(/[^A-Za-z_0-9\-:\.]+/, '');
        },

        getContainer: function() {
            return document.getElementById(this.container);
        },

        htmlEncode: function(value) {
            return $('<div/>').text(value).html();
        },

        /**
         * Return loader object
         * @returns {Loader|*}
         */
        getLoader: function() {
            return this.loader;
        }
    });

    return Monitor;
});