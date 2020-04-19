define(['module', './chart'], function(module, Chart) {

    var ChartDetails = function() {
        Chart.apply(this, arguments);
        this.showLegend = true;
    };
    ChartDetails.prototype = Object.create(Chart.prototype);
    ChartDetails.prototype.constructor = ChartDetails;
    $.extend(ChartDetails.prototype, {

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

            var list = {};

            var processMap = {};
            processes.forEach(function(process) {
                if (!processMap.hasOwnProperty(process['process_type'])) {
                    processMap[process['process_type']] = [];
                }
                processMap[process['process_type']].push(process);
            }, this);

            Object.keys(processMap).forEach(function(type) {
                var processes = processMap[type];
                var map = this.processMap(processes);
                var subStats = {};

                Object.keys(map).forEach(function(key) {
                    if (stats.hasOwnProperty(key)) {
                        subStats[key] = stats[key];
                    }
                }, this);

                var subList = this.buildData(subStats, processes, map );

                Object.keys(subList).forEach(function(providerId) {
                    if (subList[providerId]['contents']) {
                        subList[providerId]['contents'].forEach(function(content) {
                            content['process_type'] = type;
                        });
                        if (!list.hasOwnProperty(providerId)) {
                            list = subList;
                        } else {
                            list[providerId]['contents'] = list[providerId]['contents'].concat(subList[providerId]['contents']);
                        }

                        list[providerId]['contents'].sort(function(p, n) {
                            var sortMap = {
                                'transcoder': 2,
                                'segmenter': 1,
                                'dpi-ingest': 3
                            };

                            if (sortMap[p['process_type']] == sortMap[n['process_type']]) return 0;

                            return sortMap[p['process_type']] > sortMap[n['process_type']];
                        });
                    }
                }, this);
            }, this);

            return list;
        },

        /**
         * Renders html based on response
         * @param {Array} response
         * @param {Boolean} extra
         * @param {Object} range
         */
        updateHtml: function(response, extra, range) {
            var tpl = '';
            var self = this;


            Object.keys(response).forEach(function(providerId) {
                var providerStats = response[providerId];
                if (self.filter && self.filter.setProviderText) {
                    self.filter.setProviderText(providerStats['provider_name']);
                }
                var setContent = false;
                providerStats['contents'].forEach(function(stats, idx) {
                    if (!setContent) {
                        self.filter.setContentLink(stats['content_id'], self.htmlEncode(stats['content_name']));
                        setContent = true;
                    }
                    tpl += '<div class="row">';
                    tpl +=      '<div class="col-md-12">';
                    tpl +=      '<div class="box box-solid">';
                    tpl +=          '<div class="box-header">';
                    tpl +=              '<h3 class="box-title">Process Type: ' + self.processTypeRenderer(self.htmlEncode(stats['process_type'])) + '</h3>';
                    tpl +=          '</div>';
                    tpl +=          '<div class="box-body">';
                    tpl +=              '<div class="row">';
                    var suffix = self.getSuffix(providerId, idx);
                    tpl +=              '<div class="col-md-8 col-md-offset-2 col-sd-12  col-sm-12" style="text-align:center;">';
                    if (Object.keys(stats['info']).length > 0) {
                        tpl +=              '<div id="' + self.getChartIdBySuffix(suffix) + '" class="chart" style="height:200px"><svg></svg></div>';
                    } else {
                        tpl +=              '<p>There is no data to show.</p>';
                    }
                    tpl +=              '</div>';
                    tpl +=              '</div>';
                    tpl +=          '</div>';
                    tpl +=      '</div>';
                    tpl +=      '</div>';
                    tpl += '</div>';
                });
            });

            this.getContainer().innerHTML = tpl;
        },

        processTypeRenderer: function(type) {
            var str = '';
            switch (type) {
                case 'transcoder':
                    str = 'Transcoder';
                    break;
                case 'segmenter':
                    str = 'Segmenter';
                    break;
                case 'dpi-ingest':
                    str = 'DPI Ingest';
                    break;
            }

            return str;
        },

        /**
         *
         * @param filter
         */
        setFilter: function(filter) {
            this.filter = filter;
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
                if (this.isAllowedLine(stats['process_type'], key)) {
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
                }
            }, this);

            this.showChart(suffix, data, batch, range);
        },

        /**
         * Decides which data to show
         * @param type
         * @param line
         * @returns {boolean}
         */
        isAllowedLine: function(type, line) {
            var allowedData = {
                'transcoder': ['restarts', 'no_signals', 'transcoder-issues', 'runall', 'viewissues'],
                'segmenter': ['restarts', 'runall', 'viewissues'],
                'dpi-ingest': ['restarts', 'no_signals', 'detection-issues', 'runall', 'monissues', 'viewissues']
            };

            return allowedData.hasOwnProperty(type) && allowedData[type].indexOf(line) > -1;
        }
    });

    var config = module.config();

    return new ChartDetails(config);
});