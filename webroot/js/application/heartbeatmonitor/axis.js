/**
 * Axis render
 */
define(function(require) {
    return {
        showAuto: function(axis, startTime, endTime, timezone) {
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

            axis.rotateLabels(angle).tickFormat(function( timestamp ) {
                var mtime = moment(timestamp*1000).tz(timezone);

                return mtime.format(format);
            });
            axis.showMaxMin(false);

            return angle;
        },

        showHour: function(axis, startTime, endTime, timezone) {
            var angle = 0;
            var range = [];
            var startTimeCloned = startTime.clone().seconds(0).milliseconds(0);
            var endTimeCloned = endTime.clone().seconds(0).milliseconds(0);
            var tickFormat = "%H:%M";
            var dateFormatter = d3.time.format(tickFormat);
            var adjustMinutes = function(minute) {
                var diff = (minute % 10);

                return diff > 0 ? minute + 10 - diff : minute;
            };

            startTimeCloned.minutes(adjustMinutes(startTimeCloned.minutes()));
            endTimeCloned.minutes(adjustMinutes(endTimeCloned.minutes()));

            while (startTimeCloned.valueOf() < endTimeCloned.valueOf()) {
                range.push(startTimeCloned.unix());
                startTimeCloned.add(10, 'minutes');
            }

            axis.tickValues(range).tickFormat(function(value) {
                var m = moment.unix(value).tz(timezone);
                var d = new Date(m.year(), m.month(), m.date(), m.hour(), m.minute(), m.second()
                );

                return dateFormatter(d);
            });
            axis.showMaxMin(true);

            return angle;
        },

        show4Hour: function(axis, startTime, endTime, timezone) {
            var angle = 0;
            var range = [];
            var startTimeCloned = startTime.clone().seconds(0).milliseconds(0);
            var endTimeCloned = endTime.clone().seconds(0).milliseconds(0);
            var tickFormat = "%H:%M";
            var dateFormatter = d3.time.format(tickFormat);
            var adjustMinutes = function(minute) {
                var diff = (minute % 30);

                return diff > 0 ? minute + 30 - diff : minute;
            };

            startTimeCloned.minutes(adjustMinutes(startTimeCloned.minutes()));
            while (startTimeCloned.valueOf() <= endTimeCloned.valueOf()) {
                range.push(startTimeCloned.unix());
                startTimeCloned.add(30, 'minutes');
            }

            axis.tickValues(range).tickFormat(function(value) {
                var m = moment.unix(value).tz(timezone);
                var d = new Date(m.year(), m.month(), m.date(), m.hour(), m.minute(), m.second()
                );

                return dateFormatter(d);
            });
            axis.showMaxMin(true);

            return angle;
        },

        show12Hour: function(axis, startTime, endTime, timezone) {
            var angle = 0;
            var range = [];
            var startTimeCloned = startTime.clone().seconds(0).milliseconds(0);
            var endTimeCloned = endTime.clone().seconds(0).milliseconds(0);
            var tickFormat = "%H:%M";
            var dateFormatter = d3.time.format(tickFormat);
            var adjustMinutes = function(minute) {
                var diff = (minute % 120);

                return diff > 0 ? minute + 120 - diff : minute;
            };

            startTimeCloned.minutes(adjustMinutes(startTimeCloned.minutes()));
            while (startTimeCloned.valueOf() <= endTimeCloned.valueOf()) {
                range.push(startTimeCloned.unix());
                startTimeCloned.add(120, 'minutes');
            }

            axis.tickValues(range).tickFormat(function(value) {
                var m = moment.unix(value).tz(timezone);
                var d = new Date(m.year(), m.month(), m.date(), m.hour(), m.minute(), m.second()
                );

                return dateFormatter(d);
            });
            axis.showMaxMin(true);

            return angle;
        },

        showDay: function(axis, startTime, endTime, timezone) {
            var angle = 0;
            var range = [];
            var startTimeCloned = startTime.clone().seconds(0).milliseconds(0);
            var endTimeCloned = endTime.clone().seconds(0).milliseconds(0);
            var tickFormat = "%H:%M";
            var dateFormatter = d3.time.format(tickFormat);
            var adjustMinutes = function(minute) {
                var diff = (minute % 180);

                return diff > 0 ? minute + 180 - diff : minute;
            };

            startTimeCloned.minutes(adjustMinutes(startTimeCloned.minutes()));
            while (startTimeCloned.valueOf() <= endTimeCloned.valueOf()) {
                range.push(startTimeCloned.unix());
                startTimeCloned.add(3, 'hours');
            }

            axis.tickValues(range).tickFormat(function(value) {
                var m = moment.unix(value).tz(timezone);
                var d = new Date(m.year(), m.month(), m.date(), m.hour(), m.minute(), m.second()
                );

                return dateFormatter(d);
            });
            axis.showMaxMin(true);

            return angle;
        },

        showWeek: function(axis, startTime, endTime, timezone) {
            var angle = 0;
            var range = [];
            var startTimeCloned = startTime.clone().minutes(0).seconds(0).milliseconds(0);
            var endTimeCloned = endTime.clone();
            var tickFormat = "%a";
            var tickFormatWithTime = "%m/%d/%Y (%a)";
            var dateFormatter = d3.time.format(tickFormat);
            var dateTimeFormatter = d3.time.format(tickFormatWithTime);

            if (startTimeCloned.hours() > 1) {
                startTimeCloned.hours(0).add(1, 'day');
            }
            while (startTimeCloned.valueOf() <= endTimeCloned.valueOf()) {
                range.push(startTimeCloned.unix());
                startTimeCloned.add(1, 'day');
            }

            axis.tickValues(range).tickFormat(function(value, v) {
                var m = moment.unix(value).tz(timezone);
                var d = new Date(m.year(), m.month(), m.date(), m.hour(), m.minute(), m.second()
                );

                return typeof v == 'undefined' ? dateTimeFormatter(d) : dateFormatter(d);
            });
            axis.showMaxMin(false);

            return angle;
        }
    }
});