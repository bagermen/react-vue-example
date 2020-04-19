/**
 * Pager.
 * It fires pageclick event with data: pager, clicked_page, total pages
 */
define(['../base/observable'], function(Observable) {
    var Pager = function (config) {
        Observable.apply(this, arguments);

        this.setCurrentPage(config.currentPage ? config.currentPage : 1);
        this.totalPages = Number(config.totalPages ? config.totalPages : 0);
        this.container = config.container;
        this.maxVisibleItems = Number(config.maxVisibleItems ? config.maxVisibleItems : 0);
        this.useFirstLast = !!config.useFirstLast;

        this.activePageIndex = 0;
        this.usePageInfo = true;

        this.addEvents('pageclick');
    };

    Pager.prototype = Object.create(Observable.prototype);
    Pager.prototype.constructor = Pager;
    $.extend(Pager.prototype, {
        init: function() {
            this.updateHtml();
            this.setPage(this.getCurrentPage());
        },

        /**
         * Render HTML and bind listeners
         */
        updateHtml: function() {
            var container = this.getContainer();
            var visibleItems = this.getVisibleItems();
            var activeIndex = this.getActivePageIndex();
            var page = this.getCurrentPage() - activeIndex;
            var tpl = '';

            tpl +=  '<nav aria-label="page navigation">';
            tpl +=  '<div class="page_info"></div>'
            tpl +=      '<ul class="pagination">';
            tpl +=          '<li class="page-item" ' + (!this.useFirstLast ? 'style="display:none;"' : '') + ' ><a class="page-link" href="#"><span aria-hidden="true">&laquo;</span></a></li>';
            tpl +=          '<li class="page-item"><a class="page-link" href="#"><span aria-hidden="true">&lsaquo;</span></a></li>';
            for (var i = 0; i < visibleItems; i++) {

                tpl +=      '<li class="page-item"><a class="page-link" data-page="' + page +'" href="#">' + page + '</a></li>';
                ++page;
            }
            tpl +=          '<li class="page-item"><a class="page-link" href="#"><span aria-hidden="true">&rsaquo;</span></a></li>';
            tpl +=          '<li class="page-item" ' + (!this.useFirstLast ? 'style="display:none;"' : '') + ' ><a class="page-link" href="#"><span aria-hidden="true">&raquo;</span></a></li>';
            tpl +=      '</ul>';
            tpl +=  '</nav>';


            if (container.children.length) {

                this.unbindHandlers();
                // remove child nodes
                while (container.firstChild) {
                    container.removeChild(container.firstChild);
                }
            }

            container.innerHTML = tpl;

            this.updateClasses();
            this.addHandlers();
            if (this.usePageInfo) {
                this.updatePageInfo();
            }
        },

        /**
         * Set/remove classes 'active' and 'disabled' for the list
         */
        updateClasses: function() {
            this.getPageElByIndex().forEach(function(el, i) {
                var qel = $(el);
                if (i == this.getActivePageIndex()) {
                    qel.addClass('active');
                } else {
                    if (qel.hasClass('active')) {
                        qel.removeClass('active');
                    }
                }
            }, this);

            var disablePrev = (this.getCurrentPage() - this.getActivePageIndex()) == 1;
            var disableNext = (this.getTotalPages() - this.getCurrentPage() + this.getActivePageIndex()) == this.getVisibleItems() - 1;

            if (disablePrev) {
                if (!$(this.getFirstEl()).hasClass('disabled')) {
                    $(this.getFirstEl()).addClass('disabled');
                }
                if (!$(this.getPrevEl()).hasClass('disabled')) {
                    $(this.getPrevEl()).addClass('disabled');
                }
            }
            if (disableNext) {
                if (!$(this.getLastEl()).hasClass('disabled')) {
                    $(this.getLastEl()).addClass('disabled');
                }
                if (!$(this.getNextEl()).hasClass('disabled')) {
                    $(this.getNextEl()).addClass('disabled');
                }
            }
        },

        /**
         * Update page info data
         */
        updatePageInfo: function() {
            var pageInfo = this.getContainer().querySelector('div.page_info'),
                self = this,
                current, total;

            if (!pageInfo) {
                return;
            }

            if (!pageInfo.firstChild) {
                pageInfo.innerHTML = 'Page <input type="number" min="1" pattern="[0-9]*" maxlength="5" class="form-control current_value no-spin" style=""> of <span class="total">25</span>';
                current = pageInfo.querySelector('input.current_value');
                $(current).on('change', function() {
                    var newPage = parseInt(this.value);

                    if (isNaN(this.value) || !isNaN(this.value) && (newPage != this.value)) {
                        this.value = self.getCurrentPage();
                    }
                    if (this.value > self.getTotalPages()) {
                        this.value = self.getTotalPages();
                    }
                    if (this.value < 1) {
                        this.value = 1;
                    }
                    if (this.value != self.getCurrentPage()) {
                        self.setPage(this.value, false, true);
                    }
                });
            } else {
                current = pageInfo.querySelector('input.current_value');
            }

            total = pageInfo.querySelector('span.total');

            total.textContent = this.getTotalPages() > 0 
                ? this.getTotalPages()
                : 1;

            current.value = this.getCurrentPage();
        },

        /**
         * remove DOM click listeners
         */
        unbindHandlers: function() {
            $(this.getFirstEl()).off('click', 'a', this.onFirstClick);
            $(this.getLastEl()).off('click', 'a', this.onLastClick);

            $(this.getPrevEl()).off('click', 'a', this.onPrevClick);
            $(this.getNextEl()).off('click', 'a', this.onNextClick);
            this.getPageElByIndex().forEach(function(el) {
                $(el).off('click', 'a', this.onChildClick);
            }, this);
        },
        /**
         * Add DOM click listeners
         */
        addHandlers: function() {
            var scope = {scope: this };
            $(this.getFirstEl()).on('click', 'a', scope, this.onFirstClick);
            $(this.getLastEl()).on('click', 'a', scope, this.onLastClick);

            $(this.getPrevEl()).on('click', 'a', scope, this.onPrevClick);
            $(this.getNextEl()).on('click', 'a', scope, this.onNextClick);
            this.getPageElByIndex().forEach(function(el) {
                $(el).on('click', 'a', scope, this.onChildClick);
            }, this);
        },

        /**
         * Previous element
         * @returns {Node}
         */
        getPrevEl: function() {
            return this.getContainer().querySelector('ul.pagination li:first-child').nextSibling;
        },

        /**
         * Returns first element
         * @returns {HTMLElement}
         */
        getFirstEl: function() {
            return this.getContainer().querySelector('ul.pagination li:first-child');
        },

        /**
         * /**
         * Next element
         * @returns {Node}
         */
        getNextEl: function() {
            return this.getContainer().querySelector('ul.pagination li:last-child').previousSibling;
        },

        /**
         * Returns last elment
         * @returns {HTMLElement}
         */
        getLastEl: function() {
            return this.getContainer().querySelector('ul.pagination li:last-child');
        },

        /**
         * Return page li by index
         * @param index
         * @returns {*}
         */
        getPageElByIndex: function(index) {
            if (index === 0 || index > 0 && index <= this.getVisibleItems()) {
                index = Number(index);
                return this.getContainer().querySelector('ul.pagination li:nth-child(' + (2 + index) + ')');
            } else {
                var all = this.getContainer().querySelectorAll('ul.pagination li');

                if (all) {
                    var filter = Array.prototype.filter;
                    return filter.call(all, function(el, idx) {
                        return idx > 1 && idx < all.length - 2;
                    });
                } else {
                    return [];
                }

            }
        },

        /**
         * DOM Event listener
         * @param e
         */
        onFirstClick: function(e) {
            var self = e.data.scope;
            self.commonClick(e, this.parentNode, 1);
        },

        /**
         * DOM Event listener
         * @param e
         */
        onLastClick: function(e) {
            var self = e.data.scope;
            self.commonClick(e, this.parentNode, self.getTotalPages());
        },

        /**
         * DOM Event listener
         * @param e
         */
        onPrevClick: function(e) {
            var self = e.data.scope;
            self.commonClick(e, this.parentNode, self.getCurrentPage() - 1);
        },

        /**
         * DOM Event listener
         * @param e
         */
        onNextClick: function(e) {
            var self = e.data.scope;
            self.commonClick(e, this.parentNode, self.getCurrentPage() + 1);
        },

        /**
         * DOM Event listener
         * @param e
         */
        onChildClick: function(e) {
            var self = e.data.scope;
            self.commonClick(e, this.parentNode, $(this).data('page'));
        },

        /**
         * Common Click listener
         * @param e
         * @param target
         * @param nextPage
         */
        commonClick: function(e, target, nextPage) {
            e.stopPropagation();
            e.preventDefault();

            if (!$(target).hasClass('disabled') && !$(this.parentNode).hasClass('active')) {
                if (nextPage < 0) {
                    this.setPage(0);
                } else if (nextPage > this.getTotalPages()) {
                    this.setPage(this.getTotalPages());
                } else {
                    this.setPage(nextPage);
                }
            }
        },

        /**
         * Pager container
         * @returns {HTMLElement}
         */
        getContainer: function() {
            return document.getElementById(this.container);
        },

        /**
         * Return current active index
         * @returns {number}
         */
        getActivePageIndex: function() {
            return this.activePageIndex;
        },

        setActivePageIndex: function(page) {
            this.activePageIndex = Number(page);
        },

        /**
         * Return Number of visible items between Prev and Next Button
         * @returns {number}
         */
        getVisibleItems: function() {
            return this.getTotalPages() > this.maxVisibleItems
                ? this.maxVisibleItems
                : this.getTotalPages();
        },

        /**
         * Set Active Page
         * @param {Number} page
         * @param {Boolean=} silent
         * @param {Boolean=} notLoadData
         */
        setPage: function(page, silent, notLoadData) {
            page = Number(page);
            var delta, newIndex;
            var visibleItems = this.getVisibleItems();
            var index = this.getActivePageIndex();
            var needRefresh = false;

            if (page == this.getCurrentPage()) {
                return;
            }

            // calculate new selected index
            if (page > this.getCurrentPage()) {
                delta = visibleItems - index - 1 - (page - this.getCurrentPage());
                if (delta > 0) {
                    newIndex = index + page - this.getCurrentPage();
                } else {    
                    newIndex = visibleItems - 1;
                    needRefresh = true;
                }
            } else {
                delta = index + 1 - (this.getCurrentPage() - page);
                if (delta > 0) {
                    newIndex = index - this.getCurrentPage() + page;
                } else {
                    newIndex = 0;
                    needRefresh = true;
                }
            }

            this.setActivePageIndex(newIndex);
            this.setCurrentPage(page);
            if (needRefresh) {
                this.updateHtml();
            } else {
                this.updateClasses();
                if (this.usePageInfo) {
                    this.updatePageInfo();
                }
            }

            if (!silent) {
                this.fireEvent('pageclick', this, this.getCurrentPage(), this.getTotalPages(), !!notLoadData);
            }
        },

        setTotalPages: function(total) {
            this.totalPages = Number(total);
            this.updateHtml();
        },

        setCurrentPage: function(page) {
            this.currentPage = Math.max(Number(page), 1);
        },

        getCurrentPage: function() {
            return this.currentPage;
        },

        getTotalPages: function() {
            return this.totalPages;
        }
    });

    return Pager;
});