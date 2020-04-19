define(function(require) {
    var Filter = function (config) {
        this.config = config;
        this.daterangeId = 'reportrange';
        this.daterangeInputId = 'date_range';
        this.formId = 'filter_form';
        this.timezone = config.timezone ? config.timezone: 'America/Los_Angeles';
    };

    Filter.prototype = Object.create({
        init: function () {
            this.initDateRange();
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
        },

        initDateRange: function() {
            var self = this;
            var daterange = $(document.getElementById(this.daterangeId));

            this.updateInitDates();

            daterange.daterangepicker(
                {
                    autoUpdateInput: false,
                    startDate: this.config.startDate,
                    endDate: this.config.endDate,

                    minDate: moment().subtract(2, 'years').format(this.config.dateFormat),
                    maxDate: moment().format(this.config.dateFormat),

                    dateLimit: { days: 60 },
                    showDropdowns: true,
                    showWeekNumbers: true,
                    timePicker: true,
                    timePickerIncrement: 15,
                    timePicker24Hour: true,
                    ranges: {
                        'Last hour': [ moment().subtract(1, 'hour').format(this.config.dateFormat), moment().format(this.config.dateFormat) ],
                        'Last 4 hours': [ moment().subtract(4, 'hour').format(this.config.dateFormat), moment().format(this.config.dateFormat) ],
                        'Last 12 hours': [ moment().subtract(12, 'hour').format(this.config.dateFormat), moment().format(this.config.dateFormat) ],
                        'Last Day': [ moment().subtract(1, 'day').startOf('day').format(this.config.dateFormat), moment().subtract(1, 'day').endOf('day').format(this.config.dateFormat) ],
                        'Last Week': [ moment().subtract(6, 'days').format(this.config.dateFormat), moment().format(this.config.dateFormat) ],
                        'Last Hour 1 Week Ago': [ moment().subtract(6, 'days').subtract(1, 'hour').format(this.config.dateFormat), moment().subtract(6, 'days').format(this.config.dateFormat) ],
                        'Last 4 Hours 1 Week Ago': [ moment().subtract(6, 'days').subtract(4, 'hour').format(this.config.dateFormat), moment().subtract(6, 'days').format(this.config.dateFormat) ]
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
                },
                function(start, end, label) {
                    self.updateDateRange(start, end, label);
                }
            );

            var cmp = daterange.data('daterangepicker');
            cmp.calculateChosenLabel();
            this.updateDateRange(cmp.startDate, cmp.endDate, cmp.chosenLabel);
        },

        updateDateRange: function(start, end, label) {
            var startStr = start;
            var endStr = end;

            if (startStr instanceof moment) {
                startStr = start.format(this.config.dateFormat);
            }
            if (endStr instanceof moment) {
                endStr = end.format(this.config.dateFormat);
            }

            $(document.getElementById(this.daterangeInputId)).val(startStr + '|' + endStr);
            if (label != 'Custom') {
                $('#' + this.daterangeId + ' span').html(label);
            } else {
                $('#' + this.daterangeId + ' span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
            }
        },

        getValues: function() {
            var form = document.getElementById(this.formId);
            var self = this;

            var updateDateRangeIfNeed = function() {
                var daterange = $(document.getElementById(self.daterangeId));
                var cmp = daterange.data('daterangepicker');

                switch (cmp.chosenLabel) {
                    case 'Last hour':
                        self.updateDateRange('PT1H', 'now', self.chosenLabel);
                        break;
                    case 'Last 4 hours':
                        self.updateDateRange('PT4H', 'now', self.chosenLabel);
                        break;
                    case 'Last 12 hours':
                        self.updateDateRange('PT12H', 'now', self.chosenLabel);
                        break;
                    case 'Last Day':
                        self.updateDateRange('P1D', 'now', self.chosenLabel);
                        break;
                    case 'Last Week':
                        self.updateDateRange('P1W', 'now', self.chosenLabel);
                        break;
                    case 'Last Hour 1 Week Ago':
                        self.updateDateRange('PT1H', 'P1W', self.chosenLabel);
                        break;
                    case 'Last 4 Hours 1 Week Ago':
                        self.updateDateRange('PT4H', 'P1W', self.chosenLabel);
                        break;
                    default:
                        return;
                }
            };

            updateDateRangeIfNeed();

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

        updateInitDates: function() {
            var defStartDate = moment().subtract(1, 'hour').format(this.config.dateFormat);
            var defEndDate = moment().format(this.config.dateFormat);

            if (this.config.endDate == 'now') {
                switch (this.config.startDate) {
                    case 'PT1H':
                        this.config.startDate = moment().subtract(1, 'hour').format(this.config.dateFormat);
                        this.config.endDate = defEndDate;
                        break;
                    case 'PT4H':
                        this.config.startDate = moment().subtract(4, 'hour').format(this.config.dateFormat);
                        this.config.endDate = defEndDate;
                        break;
                    case 'PT12H':
                        this.config.startDate = moment().subtract(12, 'hour').format(this.config.dateFormat);
                        this.config.endDate = defEndDate;
                        break;
                    case 'P1D':
                        this.config.startDate = moment().subtract(1, 'day').startOf('day').format(this.config.dateFormat);
                        this.config.endDate = moment().subtract(1, 'day').endOf('day').format(this.config.dateFormat);
                        break;
                    case 'P1W':
                        this.config.startDate = moment().subtract(6, 'days').format(this.config.dateFormat);
                        this.config.endDate = defEndDate;
                        break;
                    default:
                        this.config.startDate = defStartDate;
                        this.config.endDate = defEndDate;
                }
            } else if (this.config.endDate == 'P1W') {
                defStartDate = moment().subtract(6, 'days').subtract(1, 'hour').format(this.config.dateFormat);
                defEndDate = moment().subtract(6, 'days').format(this.config.dateFormat);

                switch (this.config.startDate) {
                    case 'PT1H':
                        this.config.startDate = moment().subtract(6, 'days').subtract(1, 'hour').format(this.config.dateFormat);
                        this.config.endDate = defEndDate;
                        break;
                    case 'PT4H':
                        this.config.startDate = moment().subtract(6, 'days').subtract(4, 'hour').format(this.config.dateFormat);
                        this.config.endDate = defEndDate;
                        break;
                    default:
                        this.config.startDate = defStartDate;
                        this.config.endDate = defEndDate;
                }
            } else {
                if (!moment(this.config.startDate, this.config.dateFormat, true).isValid()
                    || !moment(this.config.startDate, this.config.dateFormat, true).isValid()) {
                    this.config.startDate = defStartDate;
                    this.config.endDate = defEndDate;
                }
            }
        }
    });

    return Filter;
});

