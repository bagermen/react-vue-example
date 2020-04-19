
define(['module', './filter'], function(module, Filter) {

    var FilterDetails = function() {
        Filter.apply(this, arguments);
        this.providerId = 'provider_name_id';
        this.contentId = 'content_name_id';
    };

    FilterDetails.prototype = Object.create(Filter.prototype);
    FilterDetails.prototype.constructor = FilterDetails;
    $.extend(FilterDetails.prototype, {
        updateDateRange: function(start, end, label) {
            Filter.prototype.updateDateRange.apply(this, arguments);

            //var datesStr = $.param({'date_range': document.getElementById('date_range').value});
            //history.pushState({}, "", window.location.pathname + '?' + datesStr);
        },
        setProviderText: function(provider) {
            var p = this.getProvederEl();
            if (p.innerText != provider) {
                p.innerText = provider;
            }
        },

        setContentLink: function(id, contentName) {
            var c = this.getContentEl();
            c.innerHTML = '<a target="_blank" href="' + this.config.content_uri + '/' + id + '">' + contentName + '</a>';
        },

        getProvederEl: function() {
            if (!this.providerEl) {
                this.providerEl = document.getElementById(this.providerId);
            }

            return this.providerEl;
        },

        getContentEl: function() {
            if (!this.contentEl) {
                this.contentEl = document.getElementById(this.contentId);
            }

            return this.contentEl;
        }
    });

    var config = module.config();
    if (!config.dateFormat) {
        config.dateFormat = 'MM/DD/YYYY HH:mm';
    }

    if (!config.content_uri) {
        config.content_uri = '';
    }

    if (config.date_range) {
        var range = config.date_range.split('|');
        if (range.length == 2) {
            config.startDate = range[0].toString();
            config.endDate = range[1].toString();
        }
    }

    if (!config.startDate || !config.endDate) {
        config.startDate = moment().subtract(1, 'hour').format(config.dateFormat);
        config.endDate = moment().format(config.dateFormat)
    }

    var filter = new FilterDetails(config);
    filter.init();

    return filter;
});