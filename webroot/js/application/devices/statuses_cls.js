/**
 * This was mostly taken from ExtJS v3 which is open-source version
 * Original Ext.util.DelayedTask
 */
define(function(require) {
    var DeviceStatuses = function(config) {
        this.tableId = config.tableId;
        this.url = config.url;
        this.siteRoot = config.siteRoot;
        this.updateInterval = 5 * 60 * 1000; // update every 5 minutes if 'refresh' parameter is TRUE
        this.intervalId = null;
    };

    DeviceStatuses.prototype = Object.create({
        /**
         * Main function
         * @param refresh update statuses ever 5 minutes
         */
        refreshStatuses: function(refresh) {
            var self = this;
            this.updateStatuses();
            if (refresh) {
                this.intervalId = setInterval(function() {
                    self.queryStatuses(self.getDevices());
                }, this.updateInterval);
            }
        },

        /**
         * Stop status update
         */
        stopUpdate: function() {
            if (this.intervalId) {
                clearInterval(this.intervalId);
            }
        },

        /**
         * Collect deviceIds from current table
         * @returns {Array}
         */
        getDevices: function() {
            var devices = [];
            this.getTable().rows().iterator('row', function(c, i) {
                var node = this.row(i).node();
                devices.push(node.getAttribute('data-uid'));
            });

            return devices;
        },

        /**
         * Query statuses from server and send results to status updater function
         * @param devices
         */
        queryStatuses: function(devices) {
            var self = this;
            var table = this.getTable();
            table.rows().iterator('row', function(c, i) {
                var node = this.row(i).node();
                var td = $(node).find('td.heartbeat').first();
                var cell = table.cell(td);
                if (cell) {
                    cell.data('<img src="' + self.siteRoot + 'img/loading.gif">');
                }
            });

            $.post( this.url, { devices: JSON.stringify(devices) } ).done(function( response ) {
                // redirect functional
                if (typeof response == 'string') {
                    var reg = /window\..+;/;
                    var match = response.match(reg);

                    if (match && match.length > 0) {
                        eval(match[0]);
                    }
                }

                if (response && response.statuses) {
                    table.rows().iterator('row', function(c, i) {
                        var node = this.row(i).node();
                        var uid = $(node).data('uid');
                        var td = $(node).find('td.heartbeat').first();
                        if (response.statuses.hasOwnProperty(uid)) {
                            td.data('time', response.statuses[uid].time);
                            td.data('status', response.statuses[uid].status);
                        }
                    });
                    self.updateStatuses();
                }
            });
        },

        /**
         * Return DataTable API
         * @returns {Object}
         */
        getTable: function() {
            return $(document.getElementById(this.tableId)).DataTable();
        },

        updateStatuses: function() {
            var table = this.getTable();
            var self = this;
            table.rows().iterator('row', function(c, i) {
                var node = this.row(i).node();
                var td = $(node).find('td.heartbeat').first();
                self.updateStatus(table.cell(td), {
                    status: td.data('status'),
                    time: td.data('time')
                });
            });
        },

        /**
         * Update particular cell
         * @param {Object} cell
         * @param {Object} data
         */
        updateStatus: function(cell, data) {
            var cellData = '';
            var m;
            var timestamp = data.time;
            var visible = 'Offline';

            if (timestamp) {
                m = moment.unix(timestamp);
                visible = m.format('YY-MM-DD HH:mm');
            }

            switch (data.status) {
                case 'red':
                    if (timestamp) {
                        cellData = '<small class="badge bg-red heartbeat">' + visible + '</small>';
                    } else {
                        cellData = '<small class="badge bg-red">Never</small>';
                    }
                    break;
                case 'yellow':
                    cellData = '<small class="badge bg-yellow heartbeat">' + visible + '</small>';
                    break;
                case 'green':
                    cellData = '<small class="badge bg-green">Online</small>';
                    break;
                default:
                    cellData = '<small class="badge bg-gray">NOT FOUND</small>';
            }

            cell.data(cellData);
        }
    });

    return DeviceStatuses;
});