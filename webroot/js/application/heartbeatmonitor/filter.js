/**
 * Fires search event when search button is clicked
 */
define(['../base/observable'], function(Observable) {
    var Filter = function (config) {
        Observable.apply(this, arguments);
        this.config = config;
        this.daterangeId = 'reportrange';
        this.timezoneInfoId = "filter_timezone";
        this.daterangeInputId = 'date_range';
        this.formId = 'filter_form';
        this.timezone = config.timezone ? config.timezone: moment.tz.guess();
        this.searchBtnId = 'load_charts';
        this.initFilters = config.filtersJson ? config.filtersJson : '{}';
        this.initSort = config.sortBy ? config.sortBy: 'status';
        this.lastValue = '';
    };

    Filter.prototype = Object.create(Observable.prototype);
    Filter.prototype.constructor = Filter;

    $.extend(Filter.prototype, {
        init: function () {
            this.initTimeZone();
            this.setTimeZone(this.timezone);
            this.initDateRange();
            this.initFiltersOnCase(this.initFilters);
            var radio = document.querySelector('input[value="' + this.initSort + '"]');
            if (radio) {
                radio.checked = true;
                $(radio).iCheck('update');
            }
            var form = document.getElementById(this.formId);

            for (var prop in this.config) {
                if (this.config.hasOwnProperty(prop)) {
                    var el = form.querySelector('[name="' + prop + '"]');
                    if (el && this.config[prop]) {
                        el.value = this.config[prop];
                        $(el).trigger('change');

                        if (el.tagName == 'SELECT' && $(el).hasClass('selectpicker') && $(el).selectpicker) {
                            $(el).selectpicker('val', el.value);
                        }
                    }
                }
            }

            this.resetHandlers();
            this.attachHandlers();
        },

        getTimezone: function() {
            return this.timezone;
        },

        resetHandlers: function() {
            var tz = document.getElementById(this.timezoneInfoId);

            $(document.getElementById(this.searchBtnId)).off('click', this.onSearchClick);

            if (tz.tagName == 'SELECT') {
                $(tz).off('changed.bs.select', this.onTzClick);
            }
        },

        attachHandlers: function() {
            var data = {
                scope: this
            };
            var tz = document.getElementById(this.timezoneInfoId);
            $(document.getElementById(this.searchBtnId)).on('click', data, this.onSearchClick);

            if (tz.tagName == 'SELECT') {
                $(tz).on('changed.bs.select', data, this.onTzClick);
            }
        },

        onTzClick: function(e) {
            var self = e.data.scope;
            var tz = document.getElementById(self.timezoneInfoId);
            self.setTimeZone(tz.value);
            self.fireEvent('tzchange', self, tz.value);
        },

        onSearchClick: function(e) {
            e.preventDefault();
            e.stopPropagation();
            var self = e.data.scope;

            self.fireEvent('search', self, self.getValues());
        },

        initTimeZone: function() {
            d3.selectAll('#'+this.timezoneInfoId +' option')
            .filter(function() {
                return moment.tz.names().indexOf(this.value) == -1;
            })
            .remove();

            d3.selectAll('#'+this.timezoneInfoId +' option')
            .text(function() {
                return this.value + ' (' + moment().tz(this.value).format('Z') +')';
            });
        },

        setTimeZone: function(timezone) {
            moment.tz.setDefault(timezone);

            var el = document.getElementById(this.timezoneInfoId);
            if (el) {
                 if (el.tagName == 'SELECT') {
                    if ($(el).selectpicker) {
                        $(el).selectpicker('val', el.timezone);
                    }
                 } else {
                    el.innerText = timezone;
                }
            }
        },

        initDateRange: function() {
            var self = this;
            var daterange = $(document.getElementById(this.daterangeId));
            var dates = this.updateInitDates(this.config.startDate, this.config.endDate);
            var dateRangeEl = $(document.getElementById(this.daterangeInputId));

            daterange.daterangepicker(
                {
                    autoUpdateInput: false,
                    startDate: dates[0],
                    endDate: dates[1],

                    minDate: moment().subtract(2, 'years'),
                    maxDate: moment().add(1, 'day').startOf('day'),

                    dateLimit: { days: 60 },
                    showDropdowns: true,
                    showWeekNumbers: true,
                    timePicker: true,
                    timePickerIncrement: 15,
                    timePicker24Hour: true,
                    ranges: {
                        'Last hour': [ moment().subtract(1, 'hour'), moment() ],
                        'Last 4 hours': [ moment().subtract(4, 'hour'), moment() ],
                        'Last 12 hours': [ moment().subtract(12, 'hour'), moment() ],
                        'Today': [ moment().startOf('day'), moment().endOf('day') ],
                        'Yesterday': [ moment().subtract(1, 'day').startOf('day'), moment().subtract(1, 'day').endOf('day') ],
                        'Last Week': [ moment().subtract(7, 'days').startOf('week'), moment().subtract(7, 'days').endOf('week') ],
                        'Last Hour 1 Week Ago': [ moment().subtract(7, 'days').subtract(1, 'hour'), moment().subtract(7, 'days') ],
                        'Last 4 Hours 1 Week Ago': [ moment().subtract(7, 'days').subtract(4, 'hour'), moment().subtract(7, 'days') ]
                    },
                    opens: 'right',
                    buttonClasses: ['btn', 'btn-sm'],
                    applyClass: 'btn-primary',
                    cancelClass: 'btn-default',
                    locale: {
                        separator: ' to ',
                        format: this.config.dateFormat,
                        applyLabel: 'Submit',
                        cancelLabel: 'Cancel',
                        fromLabel: 'From',
                        toLabel: 'To',
                        customRangeLabel: 'Custom',
                        daysOfWeek: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr','Sa'],
                        monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
                        firstDay: 1
                    }
                }
            );

            daterange.on('apply.daterangepicker', function(ev, picker) {
                var start = picker.startDate;
                var end = picker.endDate;
                var label = picker.chosenLabel;
                var selectedValue = '';
                switch (label) {
                    case 'Last hour':
                        selectedValue = self.updateDateRange('PT1H', 'NOW', label);
                        break;
                    case 'Last 4 hours':
                        selectedValue = self.updateDateRange('PT4H', 'NOW', label);
                        break;
                    case 'Last 12 hours':
                        selectedValue = self.updateDateRange('PT12H', 'NOW', label);
                        break;
                    case 'Today':
                        selectedValue = self.updateDateRange('NOW', 'NOW', label);
                        break;
                    case 'Yesterday':
                        selectedValue = self.updateDateRange('P1D', 'NOW', label);
                        break;
                    case 'Last Week':
                        selectedValue = self.updateDateRange('P1W', 'NOW', label);
                        break;
                    case 'Last Hour 1 Week Ago':
                        selectedValue = self.updateDateRange('PT1H', 'P1W', label);
                        break;
                    case 'Last 4 Hours 1 Week Ago':
                        selectedValue = self.updateDateRange('PT4H', 'P1W', label);
                        break;
                    default:
                        label = 'Custom';
                        self.updateDateRange(start, end, label);
                }
            });

            dateRangeEl.on('change', function() {
                var rangeRaw = $(this).val();
                var daterange = $(document.getElementById(self.daterangeId));
                var picker = daterange.data('daterangepicker');

                if (picker && rangeRaw && rangeRaw != self.lastValue) {
                    self.lastValue = rangeRaw;

                    var rawData = rangeRaw.split('|');
                    self.updateDateRange(rawData[0], rawData[1]);
                }
            });

            this.updateDateRange(this.config.startDate, this.config.endDate, dates[3]);
        },

        updateDateRange: function(start, end, label) {
            var startStr = start;
            var endStr = end;
            var dateRangeEl = $(document.getElementById(this.daterangeInputId));
            var daterange = $(document.getElementById(this.daterangeId));
            var picker = daterange.data('daterangepicker');

            if (startStr instanceof moment) {
                startStr = start.format('X');
            }
            if (endStr instanceof moment) {
                endStr = end.format('X');
            }
            var val = startStr + '|' + endStr;

            var dates = this.updateInitDates(startStr, endStr);
            startStr = dates[0].format('X');
            endStr = dates[1].format('X');
            if (!label) {
                label = dates[2];
            }

            if (dateRangeEl.val() != val) {
                dateRangeEl.val(val);

                if (picker.ranges.hasOwnProperty(label)) {
                    picker.startDate = picker.ranges[label][0].clone();
                    picker.endDate = picker.ranges[label][1].clone();
                    if (!picker.isShowing) {
                        picker.updateElement();
                    }
                    picker.updateMonthsInView();
                } else {
                    if (picker.startDate.format('X') != startStr && moment.unix(startStr).isValid()) {
                        picker.setStartDate(moment.unix(startStr));
                    }
                    if (picker.endDate.format('X') != endStr && moment.unix(endStr).isValid()) {
                        picker.setEndDate(moment.unix(endStr));
                    }
                }
                picker.calculateChosenLabel();
                if (label != 'Custom') {
                    $('#' + this.daterangeId + ' span').html(label);
                } else {
                    $('#' + this.daterangeId + ' span').html(dates[0].format('MMMM D, YYYY') + ' - ' + dates[1].format('MMMM D, YYYY'));
                }
    
                dateRangeEl.trigger('change');
            }
        },

        getValues: function() {
            var form = document.getElementById(this.formId);
            var self = this;

            var requestData = {};
            var formData = $(form).serializeArray();
            var name, value;
            var fillRequest = function(requestData, formData) {
                for (var i = 0; i < formData.length; i++) {
                    name = formData[i].name;
                    value = formData[i].value;

                    if (name.match(/\[\]$/)) {
                        name = name.replace(/\[\]$/, '');
                        if (!requestData[name]) {
                            requestData[name] = [];
                        }
                        requestData[name].push(value);
                    } else {
                        requestData[name] = value;
                    }
                }
            };
            fillRequest(requestData, formData);

            return requestData;
        },

        updateInitDates: function(start, end) {
            var defStartDate = moment().subtract(1, 'hour');
            var defEndDate = moment();
            var label = 'Custom';
            var startDate, endDate;

            if (end == 'NOW') {
                switch (start) {
                    case 'PT1H':
                        startDate = moment().subtract(1, 'hour');
                        endDate = defEndDate;
                        label = 'Last hour';
                        break;
                    case 'PT4H':
                        startDate = moment().subtract(4, 'hour');
                        endDate = defEndDate;
                        label = 'Last 4 hours';
                        break;
                    case 'PT12H':
                        startDate = moment().subtract(12, 'hour');
                        endDate = defEndDate;
                        label = 'Last 12 hours';
                        break;
                    case 'P1D':
                        startDate = moment().subtract(1, 'day').startOf('day');
                        endDate = moment().subtract(1, 'day').endOf('day');
                        label = 'Yesterday';
                        break;
                    case 'P1W':
                        startDate = moment().subtract(6, 'days');
                        endDate = defEndDate;
                        label = 'Last Week';
                        break;
                    case 'NOW':
                        startDate = moment().startOf('day');
                        endDate = moment().endOf('day');
                        label = 'Today';
                        break;
                    default:
                        startDate = defStartDate;
                        endDate = defEndDate;
                }
            } else if (end == 'P1W') {
                defStartDate = moment().subtract(6, 'days').subtract(1, 'hour');
                defEndDate = moment().subtract(6, 'days');

                switch (start) {
                    case 'PT1H':
                        startDate = moment().subtract(6, 'days').subtract(1, 'hour');
                        endDate = defEndDate;
                        label = 'Last Hour 1 Week Ago';
                        break;
                    case 'PT4H':
                        startDate = moment().subtract(6, 'days').subtract(4, 'hour');
                        endDate = defEndDate;
                        label = 'Last 4 Hours 1 Week Ago';
                        break;
                    default:
                        startDate = defStartDate;
                        endDate = defEndDate;
                }
            } else {
                if (!moment.tz(start, 'X', true, this.getTimezone()).isValid()
                    || !moment.tz(end, 'X', true, this.getTimezone()).isValid()) {
                    startDate = defStartDate;
                    endDate = defEndDate;
                } else {
                    startDate = moment.unix(start);
                    endDate = moment.unix(end);
                }
            }

            return [
                startDate,
                endDate,
                label
            ];
        },

        initFiltersOnCase: function(filterData) {
            if (!document.getElementById('filters_json') && document.getElementById('filter_by')) {
                return;
            }

            $('#filters_json').val(filterData);

            var self = this;
            $("#filter_by").change( filter_by_handler );

            this.updateFilter(filterData);

            $('#filters_json').on('change', function(e, hash) {
                var currentFilterData = $('#filters_json').val();
                if (hash) {
                    if (currentFilterData != filterData) {
                        self.updateFilter(currentFilterData);
                    }
                }
                filterData = currentFilterData;
            });
        },

        updateFilter: function(filter) {
            remove_all_filters();

            var parsed = {};
            if (filter) {
                parsed = JSON.parse(filter);
            }

            function addslashes( str ) {
                return str.replace('/(["\'\])/g', "\\$1").replace('/\0/g', "\\0");
            }

            if (parsed != null && typeof parsed == 'object') {
                Object.keys(parsed).forEach(function(group) {
                    var groupFilters = parsed[group];
                    Object.keys(groupFilters).forEach(function(filterValue) {
                        var filterInfo = groupFilters[filterValue];

                        switch (group) {
                            case 'uuid':
                                add_filter( 'uuid', filterInfo['type'], addslashes(filterValue), addslashes(filterInfo['value_txt']) );
                                break;
                            case 'dealership':
                                add_filter( 'dealership', filterInfo['type'], addslashes(filterValue), addslashes(filterInfo['value_txt']) );
                                break;
                            case 'dealergroup':
                                add_filter( 'dealergroup', filterInfo['type'], addslashes(filterValue), addslashes(filterInfo['value_txt']) );
                                break;
                            case 'status':
                                add_filter( 'status', filterInfo['type'], addslashes(filterValue), addslashes(filterInfo['value_txt']) );
                                break;
                            case 'skip_empty':
                                add_filter( 'skip_empty', filterInfo['type'], addslashes(filterValue), addslashes(filterInfo['value_txt']) );
                                break;
                            case 'inventory_status':
                                add_filter( 'inventory_status', filterInfo['type'], addslashes(filterValue), addslashes(filterInfo['value_txt']) );
                        }
                    }, this);

                }, this);
            }
        }
    });

    return Filter;
});

