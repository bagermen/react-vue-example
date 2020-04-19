define([
    'module',
    './monitor_filter',
    './monitor_devices',
    './monitor_pager',
    './monitor_pagertotal'

], function(module, filter, monitor, pager, total) {
    var config = module.config();

    var limit = config.itemsPerPage > 0 ? Number(config.itemsPerPage) : 10;

    var lastQuery = {};
    var suspendQuery = false;
    var needLoad = false;

    return {
        run: function() {
            this.init();
        },

        doRequest: function(sc, params, notLoadData) {
            lastQuery = $.extend({}, params);
            params.page = Math.max(0, pager.getCurrentPage() - 1);
            params.limit = total.getLimit();

            if (suspendQuery) {
                needLoad = true;
                lastQuery.page = params.page;
            }
            if (!notLoadData && !suspendQuery) {
                suspendQuery = true;
                monitor.draw(params);
            }
        },

        init: function() {
            var self = this;
            if (window.localStorage) {
                var len = parseInt(localStorage.getItem('heartbeatmonitor.page_length'));
                if (len) {
                    limit = Number(len);
                } else {
                    localStorage.setItem('heartbeatmonitor.page_length', limit);
                }
            }

            filter.init();
            pager.init();
            total.setLimit(limit);
            monitor.setTimezone(filter.getTimezone());
            monitor.init();

            // bind events
            filter.on('search', function(sr, params) {
                pager.setPage(0, true, true);
                this.doRequest(sr, params);
            }, this);

            filter.on('tzchange', function(sr, timezone) {
                monitor.setTimezone(timezone);
            }, this);

            monitor.on('dataloaded', function(response) {
                var items = Number(response.total);
                var totalPages = Math.ceil(items/total.getLimit());
                var page = Number(response.page);

                filter.setTimeZone(response.query_dates.timezone);
                if (pager.getTotalPages() != totalPages) {
                    pager.setTotalPages(totalPages);
                }
                pager.setPage(page + 1, true);
                suspendQuery = false;
                if (needLoad) {
                    needLoad = false;
                    pager.setPage(lastQuery.page + 1, true);
                    self.doRequest(filter, lastQuery);
                    delete lastQuery.page;
                }
            });

            total.on('selectlimit', function(size) {
                if (Object.keys(lastQuery).length) {
                    pager.setPage(0, true);
                    this.doRequest(filter, lastQuery);
                }
                if (window.localStorage) {
                    localStorage.setItem('heartbeatmonitor.page_length', size);
                }
            }, this);

            pager.on('pageclick', function(p, page , total, notLoadData) {
                this.doRequest(filter, lastQuery);
            }, this);

            pager.setPage(0, true, true);
            this.doRequest(filter, filter.getValues());
        }
    };
});