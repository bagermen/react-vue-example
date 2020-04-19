/**
 * DPI dashboard
 */
define(function(require) {
    var Chart = function (config) {
        this.url = config.request_uri;
        this.requestUrl = config.request_details_uri;
        this.rootUrl = config.root;
        this.formId = 'charts';
        this.timezone = config.timezone ? config.timezone: 'America/Los_Angeles';
        this.dateFormat = config.dateFormat ? config.dateFormat: 'MM/DD/YYYY hh:mm';
        this.showLegend = false;
        this.sort = config.sort ? config.sort : 'score';
        this.dir = config.dir ? config.dir : 'desc';
        this.setSort(config.sort);
    };

    Chart.prototype = Object.create({
        draw: function(params) {
            var self = this;
            this.showLoader();

            $.post( this.url, params ).done(function( response ) {
                // redirect functional
                if (typeof response == 'string') {
                    var reg = /window\..+;/;
                    var match = response.match(reg);

                    if (match && match.length > 0) {
                        eval(match[0]);
                    }
                }

                var data = response.process_data ? response.process_data : [];
                var types = response.query_types ? response.query_types : [];
                var range = response.query_dates ? response.query_dates : [];

                data = self.prepareData(data);
                self.updateHtml(data, types, range);
                Object.keys(data).forEach(function(providerId) {
                    var providerStats = data[providerId];
                    providerStats['contents'].forEach(function(stats, idx) {
                        self.showData(stats, self.getSuffix(providerId, idx), types, range);
                    });
                });
            });
        },

        prepareData: function(data) {
            var processes, stats;

            if (!data.processes || !(data.processes instanceof Array)) {
                processes = [];
            } else {
                processes = data.processes;
            }

            if (!data.stats || !(data.stats instanceof Object)) {
                stats = {};
            } else {
                stats = data.stats;
            }

            var map = this.processMap(processes);

            return this.buildData(stats, processes, map);
        },

        buildData: function(stats, processes, map) {
            var self = this;
            var list = {};

            processes.forEach(function(info) {
                if (!list.hasOwnProperty(info['provider_id'])) {
                    list[info['provider_id']] = {};
                    list[info['provider_id']]['provider_name'] = info['provider_name'];
                    list[info['provider_id']]['contents']      = {};
                }
                if (!list[info['provider_id']]['contents'].hasOwnProperty(info['content_id'])) {
                    list[info['provider_id']]['contents'][info['content_id']] = {};
                    list[info['provider_id']]['contents'][info['content_id']]['content_name'] = info['content_name'];
                    list[info['provider_id']]['contents'][info['content_id']]['content_id'] = info['content_id'];
                    list[info['provider_id']]['contents'][info['content_id']]['score'] = 0;
                    list[info['provider_id']]['contents'][info['content_id']]['info'] = {};
                    list[info['provider_id']]['contents'][info['content_id']]['processes'] = [];
                }
            });

            Object.keys(stats).forEach(function(depId) {
                var providerId = map[depId]['provider_id'];
                var contentId = map[depId]['content_id'];
                var processType = map[depId]['process_type'];
                var timeline = stats[depId];

                if (Object.keys(list[providerId]['contents'][contentId]['info']).length == 0) {
                    list[providerId]['contents'][contentId]['info'] = timeline;
                } else {
                    var timelineCurrent = list[providerId]['contents'][contentId]['info'];
                    Object.keys(timeline).forEach(function(key) {
                        var stats = timeline[key];

                        if (!timelineCurrent.hasOwnProperty(key)) {
                            timelineCurrent[key] = stats;
                        } else {
                            timelineCurrent[key]['running'] = self.calcState(timelineCurrent[key]['running'], stats['running']);
                            timelineCurrent[key]['restarts'] += stats['restarts'];
                            timelineCurrent[key]['no_signals'] += stats['no_signals'];
                            timelineCurrent[key]['transcoder-issues'] += stats['transcoder-issues'];
                            timelineCurrent[key]['detection-issues'] += stats['detection-issues'];
                        }
                    });
                }
                list[providerId]['contents'][contentId]['processes'].push(processType);

                var score = 0;
                Object.keys(timeline).forEach(function(key) {
                    score += timeline[key]['restarts'];
                    score += timeline[key]['no_signals'];
                    score += timeline[key]['transcoder-issues'];
                    score += timeline[key]['detection-issues'];
                });
                list[providerId]['contents'][contentId]['score'] += score;
            });

            Object.keys(list).forEach(function(provId) {
                var toArray = list[provId]['contents'];
                list[provId]['contents'] = Object.keys(toArray).map(function(key) {
                    return toArray[key];
                });
            });

            this.sortBy(list, this.sort, this.dir);

            return list;
        },

        calcState: function(oldState, newState) {
            var result = oldState | newState;
            var monetizationIssue = 1 << 2;
            var viewIssue = 1 << 1;
            var runningIssue = 1;

            // turn off running stage bit if we have some problems
            if ((result & viewIssue) || (result & monetizationIssue)) {
                result = result & ~runningIssue;
            }

            return result;
        },

        sortBy: function(list, field, dir) {
            Object.keys(list).forEach(function(provId) {
                list[provId]['contents'].sort(function(cont1, cont2) {
                    if (cont1[field] == cont2[field]) {
                        return 0;
                    }
                    var direction = dir == 'asc' ? 1 : -1;

                    return cont1[field] < cont2[field] ? -1 * direction : direction;
                });
            }, this);
        },

        processMap: function(processes) {
            var map = {};
            processes.forEach(function(process) {
                var depId = process['process_id'] + '-' + process['server_id'];
                map[depId] = {
                    'provider_id': process['provider_id'],
                    'content_id': process['content_id'],
                    'process_type': process['process_type']
                };
            });

            return map;
        },

        showData: function(stats, suffix, types, range) {
            var self = this;
            var keys = ['restarts', 'no_signals', 'transcoder-issues', 'detection-issues', 'runall', 'viewissues', 'monissues'];
            var batch = this.buildDataBatch(stats, types);
            var data = [];
            keys.forEach(function(key) {
                if (!batch.hasOwnProperty(key)) {
                    batch[key] = [];
                }
            });

            Object.keys(batch).forEach(function(key) {
                switch (key) {
                    case 'restarts':
                        data.push({
                            type: "line",
                            name: key,
                            yAxis: 2,
                            key: 'Restarts',
                            color: '#ED934A',
                            values: batch[key]
                        });
                        break;
                    case 'no_signals':
                        data.push({
                            type: "line",
                            name: key,
                            yAxis: 2,
                            key: 'No signals',
                            color: '#58b6ec',
                            values: batch[key]
                        });
                        break;
                    case 'transcoder-issues':
                        data.push({
                            type: "line",
                            name: key,
                            yAxis: 2,
                            key: 'Transcoding issues',
                            color: '#b1798f',
                            values: batch[key]
                        });
                        break;
                    case 'detection-issues':
                        data.push({
                            type: "line",
                            name: key,
                            yAxis: 2,
                            key: 'Detection issues',
                            color: '#b179ff',
                            values: batch[key]
                        });
                        break;
                    case 'runall':
                        data.push({
                            type: "bar",
                            name: key,
                            yAxis: 1,
                            key: 'Running',
                            color: '#4AFB67',
                            values: batch[key]
                        });
                        break;
                    case 'monissues':
                        data.push({
                            type: "bar",
                            name: key,
                            yAxis: 1,
                            key: 'Monetization issues',
                            color: '#fff04e',
                            values: batch[key]
                        });
                        break;
                    case 'viewissues':
                        data.push({
                            type: "bar",
                            name: key,
                            yAxis: 1,
                            key: 'Viewability problems',
                            color: '#ffc64d',
                            values: batch[key]
                        });
                        break;
                    default:
                }
            });

            this.showChart(suffix, data, batch, range);
        },

        showChart: function(suffix, data, batch, range) {
            var self = this;
            var startTime = moment(range.start*1000).tz(self.timezone);
            var endTime = moment(range.end*1000).tz(self.timezone);
            var format;
            var angle = 0;

            if (startTime.year() != endTime.year() || startTime.dayOfYear() != endTime.dayOfYear()) {
                format = "MM/DD/YYYY HH:mm";
                angle = -30
            } else if (startTime.hour() != endTime.hour()) {
                format = "HH:mm:ss";
            } else {
                format = "mm:ss";
            }

            nv.addGraph(function() {
                    var chart = nv.models.multiChart()
                        .margin({
                            top: self.showLegend ? 50 : 20,
                            right: 100,
                            bottom: angle!= 0 ? 65 : 20,
                            left: angle!= 0 ? 75 : 20
                        })
                        .color(d3.scale.category10().range())
                        .showLegend(self.showLegend);

                    if (self.showLegend) {
                        chart.legend.align(false);
                        chart.legend.rightAlign(true);
                        chart.legend.margin({ top:5, right:0, bottom:30, left:0 });
                    }


                    chart.xAxis.rotateLabels(angle).tickFormat(function( timestamp ) {
                        var mtime = moment(timestamp*1000).tz(self.timezone);

                        return mtime.format(format);
                    });
                    chart.xAxis.showMaxMin(false);
                    chart.yDomain1( [0, 1] );
                    chart.yAxis1.tickFormat( function( d ) {
                        return '';
                    });

                    chart.yAxis2.axisLabelDistance(25);
                    chart.yAxis2.tickFormat( d3.format(',d') );
                    chart.yDomain2( [0, d3.max([2, self.calcMax(batch, ['detection-issues', 'transcoder-issues', 'no_signals', 'restarts'])])] );

                    chart.bars1.stacked(true);
                    chart.bars1.groupSpacing(0);
                    chart.bars2.stacked(false);

                    d3.select( '#'+ self.getChartIdBySuffix(suffix) +' svg' )
                        .datum( data )
                        .transition()
                        .duration(250)
                        .call( chart );

                    nv.utils.windowResize( chart.update );

                    return chart;
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
         * @param types
         * @returns {{}}
         */
        buildDataBatch: function(stats, types) {
            var dataBatch = {};

            Object.keys(stats['info']).forEach(function(timestamp) {
                var data = stats['info'][timestamp];
                Object.keys(data).forEach(function(key) {
                    switch (key) {
                        case 'running':
                            if (!dataBatch.hasOwnProperty('runall')) { dataBatch['runall'] = []; }
                            if (!dataBatch.hasOwnProperty('viewissues')) { dataBatch['viewissues'] = []; }
                            if (!dataBatch.hasOwnProperty('monissues')) { dataBatch['monissues'] = []; }

                            var runall = { x: parseInt(timestamp), y: 0 };
                            var viewissues = { x: parseInt(timestamp), y: 0 };
                            var monissues = { x: parseInt(timestamp), y: 0 };

                            var monetizationIssue = 1 << 2;
                            var viewIssue = 1 << 1;
                            var noRunningIssues = 1;

                            // running stage logic calculation
                            if ((data[key] & viewIssue)) {
                                viewissues.y = 1;
                            }  else if ((data[key] & monetizationIssue)) {
                                monissues.y = 1;
                            } else if ((data[key] & noRunningIssues)) {
                                runall.y = 1;
                            }

                            dataBatch['runall'].push(runall);
                            dataBatch['viewissues'].push(viewissues);
                            dataBatch['monissues'].push(monissues);
                            break;
                        default:
                            if (!dataBatch.hasOwnProperty(key)) { dataBatch[key] = []; }
                            dataBatch[key].push({
                                x: parseInt(timestamp),
                                y: parseInt(data[key])
                            });
                    }
                }, this);

            }, this);

            return dataBatch;
        },

        showLoader: function() {
            var loading_html = '';
            loading_html += '<div style="text-align: center" >';
            loading_html +=     '<img src="' + this.rootUrl + 'img/ring-alt.gif" />';
            loading_html +=     '<p>Loading Info</p>';
            loading_html += '</div>';

            this.getContainer().innerHTML = loading_html;
        },

        /**
         * Renders html based on response
         * @param {Array} response
         * @param {Array} types
         * @param {Object} range
         */
        updateHtml: function(response, types, range) {
            var tpl = '';
            var self = this;
            var extra = types && types.length > 1;
            var data = {};

            var keys = Object.keys(response).sort(function(pId, nId) {
                if (response[pId]['provider_name'] == response[nId]['provider_name']) return 0;

                return response[pId]['provider_name'] > response[nId]['provider_name'];
            });

            tpl += '<div class="row">';
            tpl +=      '<div class="col-md-12">';
            keys.forEach(function(providerId) {
                var providerStats = response[providerId];

                tpl +=      '<div class="box box-solid provider-box">';
                tpl +=          '<div class="box-header">';
                tpl +=              '<h3 class="box-title">Provider: ' + self.htmlEncode(providerStats['provider_name']) + '</h3>';
                tpl +=          '</div>';
                tpl +=          '<div class="box-body">';
                tpl +=              '<div class="row">';
                providerStats['contents'].forEach(function(stats, idx) {
                    var suffix = self.getSuffix(providerId, idx);
                    data[suffix] = stats;
                    tpl +=              '<div class="col-lg-4 col-md-6 col-sm-12 chart-box" style="text-align:center;">';

                    if (extra) {
                        var url = self.requestUrl + '/' + stats['content_id'];
                        tpl +=              '<a target="_blank" href="' + url + '" class="chart-details" title="Show by Process Type"><b>' + self.htmlEncode(stats['content_name']) + '</b></a>';
                    } else {
                        tpl +=              '<span><b>' + self.htmlEncode(stats['content_name']) + '</b></span>';
                    }


                    if (Object.keys(stats['info']).length > 0) {
                        tpl +=              '<div id="' + self.getChartIdBySuffix(suffix) + '" class="chart" style="height:200px;"><svg></svg></div>';
                    } else {
                        tpl +=              '<p  id="' + self.getChartIdBySuffix(suffix) + '" class="chart" >There is no data to show.</p>';
                    }
                    tpl +=              '</div>';
                });
                tpl +=              '</div>';
                tpl +=          '</div>';
                tpl +=      '</div>';
            });

            tpl +=      '</div>';
            tpl += '</div>';

            this.getContainer().innerHTML = tpl;

            // bind data
            d3.selectAll('.provider-box .chart-box').datum(function() {
                var chartWrap = this.querySelector('.chart');
                if (chartWrap) {
                    var key = chartWrap.id.replace(self.getChartIdBySuffix(''), '');
                    return data[key];
                } else {
                    return null;
                }
            });

            if (extra && range) {
                // update urls
                var start = moment(range.start * 1000).tz(self.timezone).format(this.dateFormat);
                var end = moment(range.end * 1000).tz(self.timezone).format(this.dateFormat);
                var datesStr = $.param({'date_range': start + '|' + end});

                document.querySelectorAll('a.chart-details').forEach(function(e) {
                    var link = e.getAttribute('href');
                    var reg = /(^[^\?#]*)\??([^#]*)(#?.*$)/;
                    var urlMatch = reg.exec(link);
                    e.setAttribute('href', urlMatch[1] + '?' + datesStr + urlMatch[3]);
                });
            }
        },

        getSuffix: function(providerId, contentId) {
            var suffix = providerId  + '_' + contentId;

            return suffix.replace('-', '_');
        },

        getChartIdBySuffix: function(suffix) {
            return 'chart_' + suffix;
        },

        getContainer: function() {
            return document.getElementById(this.formId);
        },

        htmlEncode: function(value) {
            return $('<div/>').text(value).html();
        },

        setSort: function(sort) {
            if (sort == 'by_errors') {
                this.sort = 'score';
                this.dir = 'desc';
            } else if (sort == 'by_content') {
                this.sort = 'content_name';
                this.dir = 'asc';
            }
        },

        /**
         * Sort charts by set sort params
         */
        applySort: function() {
            var self = this;
            var boxes = d3.selectAll('.provider-box');

            boxes.selectAll('.chart-box').sort(function(a, b) {
                var l = a[self.sort] === undefined ? 0 : a[self.sort];
                var r = b[self.sort] === undefined ? 0 : b[self.sort];
                var method = self.dir == 'asc' ? 'ascending' : 'descending';

                return d3[method](l, r);
            });
        }
    });

    return Chart;
});