var activityScript = (function() {
  'use strict';

  if (!Function.prototype.bind) {
    Function.prototype.bind = function(oThis) {
      if (typeof this !== 'function') {
        throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
      }
      var aArgs = Array.prototype.slice.call(arguments, 1);
      var fToBind = this;
      var fNOP = function() {};
      var fBound = function() {
        return fToBind.apply(this instanceof fNOP && oThis ? this : oThis, aArgs.concat(Array.prototype.slice.call(arguments)));
      };

      fNOP.prototype = this.prototype;
      fBound.prototype = new fNOP();

      return fBound;
    };
  }

  if (!Array.indexOf) {
    Array.prototype.indexOf = function(obj, start) {
      for (var i = (start || 0); i < this.length; i++) {
        if (this[i] === obj) {
          return i;
        }
      }
    };
  }

  var utils = {};

  utils.LazyLoad = (function() {
    var LazyLoad = function(el) {
      if (!el) {
        return;
      }

      this.lazyClass = el;
      this.el = document.querySelectorAll(this.lazyClass);
      this.toggleClass = 'lazy';
      this.lazyLoad();

      if (document.addEventListener) {
        window.addEventListener('resize', this.lazyLoad.bind(this));
        document.addEventListener('scroll', this.lazyLoad.bind(this));
      } else {
        window.attachEvent('onresize', this.lazyLoad.bind(this));
        window.attachEvent('onscroll', this.lazyLoad.bind(this));
      }
    };

    LazyLoad.prototype.lazyLoadTimeout = function() {
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      var windowHeight = window.innerHeight || document.body.offsetHeight;
      for (var i = 0; i < this.el.length; i++) {
        this.elTop = this.el[i].getBoundingClientRect().top;
        this.elAbsoluteTop = scrollTop + this.elTop;
        if (this.elAbsoluteTop < (windowHeight + scrollTop)) {
          this.el[i].src = this.el[i].getAttribute('data-src');
          this.el[i].setAttribute('src', this.el[i].src);
          this.el[i].setAttribute('class', '');
        }
      }
    };

    LazyLoad.prototype.lazyLoad = function() {
      if (document.querySelectorAll(this.lazyClass).length === 0) {
        if (document.removeEventListener) {
          window.removeEventListener('resize', this.lazyLoad.bind(this));
          document.removeEventListener('scroll', this.lazyLoad.bind(this));
        } else {
          window.detachEvent('onresize', this.lazyLoad.bind(this));
          document.detachEvent('onscroll', this.lazyLoad.bind(this));
        }
        return;
      }

      if (this.lazyLoadTimeout) {
        clearTimeout(this.lazyLoadTimeout.bind(this));
      }

      setTimeout(function() {
        this.lazyLoadTimeout();
      }.bind(this), 20);
    };

    return LazyLoad;
  })();

  utils.Slide = (function() {
    var Slide = function(el, args) {
      if (!el) {
        return;
      }

      var defaults = {
        mode: 'horizontal',
        wrapperClass: null,
        slideMin: 1,
        slideMax: 1,
        slideWidth: 'auto',
        slideMargin: 30,
        slideMove: 1,
        speed: 200,
        auto: 1,
        control: 0,
        pager: 0,
        pagerCustom: null,
        count: null,
        autoHover: 1,
        startSlide: 0
      };

      var options = $.extend({}, defaults, args);

      this.el = $(el);
      this.slide = this.el.children('ul');
      this.slideMode = options.mode;
      this.wrapperClass = options.wrapperClass;
      this.slideMin = options.slideMin;
      this.slideMax = options.slideMax;
      this.slideWidth = options.slideWidth;
      this.slideMargin = options.slideMargin;
      this.slideMove = options.slideMove;
      this.slideSpeed = options.speed;
      this.slideAuto = options.auto;
      this.slideControl = options.control;
      this.slidePager = options.pager;
      this.slidePagerCustom = options.pagerCustom !== null ? $(options.pagerCustom) : null;
      this.count = options.count;
      this.autoHover = options.autoHover;
      this.startSlide = options.startSlide;
      this.countWrap = this.el.find('.slideCount');
      this.allCountWrap = this.countWrap.find('.slideCountAll em');
      this.thisIndex = this.countWrap.find('.slideThisIndex em');
      this.slideLength = this.el.find('.activitySlide').length;

      this.create();

      if (this.slidePagerCustom) {
        this.slidePagerCustom.on('mouseenter mouseover', 'li', function(e) {
          this.getIndex(e);
          this.slide.stopAuto();
        }.bind(this));

        this.slidePagerCustom.on('mouseleave mouseout', 'li', function() {
          this.slide.startAuto();
        }.bind(this));
      }

      if (this.count) {
        this.allCount();
      }
    };

    Slide.prototype.create = function() {
      var slide = this.slide.bxSlider({
        mode: this.slideMode,
        slideWrapper: this.slideWrapper,
        minSlides: this.slideMin,
        maxSlides: this.slideMax,
        slideWidth: this.slideWidth,
        slideMargin: this.slideMargin,
        moveSlides: this.slideMove,
        speed: this.slideSpeed,
        auto: this.slideAuto,
        controls: this.slideControl,
        autoHover: this.autoHover,
        pager: this.slidePager,
        pagerCustom: this.slidePagerCustom,
        startSlide: this.startSlide,
        onSliderLoad: function() {
          this.lazy(this.startSlide, this.slideMax);
        }.bind(this),
        onSlideBefore: function(slide, oldIndex, newIndex) {
          this.lazy(this.slideMax + newIndex, this.slideMax + newIndex);
          if (this.slidePagerCustom) {
            this.move(newIndex);
          }
          if (this.count) {
            this.changeIndex(newIndex);
          }
        }.bind(this),
        onSlideAfter: function() {
          if (this.slideAuto) {
            this.slide.stopAuto();
            this.slide.startAuto();
          }
        }.bind(this)
      });
    };

    Slide.prototype.getIndex = function(e) {
      e.preventDefault();
      this.newIndex = $(e.target).closest('li').data('slide-index');
      this.move(this.newIndex);
    };

    Slide.prototype.move = function(newIndex) {
      this.slidePagerCustom
        .children('li')
        .removeClass('active');
      this.slidePagerCustom
        .find('li[data-slide-index="' + newIndex + '"]')
        .addClass('active');

      this.slide.goToSlide(newIndex);
    };

    Slide.prototype.allCount = function() {
      this.allCountWrap.text(this.slideLength);
    };

    Slide.prototype.changeIndex = function(newIndex) {
      this.thisIndex.text(newIndex + 1);
    };

    Slide.prototype.lazy = function(startSlideIndex, stopSlideIndex) {
      this.realSlide = this.slide.find('li').not('.bx-clone');
      this.lazyImage = this.realSlide.find('.lazy');
      if (this.lazyImage.length === 0) {
        return;
      }
      this.cloneLazy();
      for (var i = 0; i < stopSlideIndex; i++) {
        this.lazyImage.eq(i).attr('src', this.lazyImage.eq(i).data('src'));
        this.lazyImage.eq(i).removeClass('lazy');
      }
    };

    Slide.prototype.cloneLazy = function() {
      this.clone = this.slide.find('.bx-clone .lazy');
      this.cloneLength = this.clone.length;
      for (var i = 0; i < this.cloneLength; i++) {
        this.clone.eq(i).attr('src', this.clone.eq(i).data('src'));
        this.clone.eq(i).removeClass('lazy');
      }
    };

    return Slide;
  })();

  utils.Search = (function() {
    var Search = function(el, expandEl, toggleClass, type) {
      if (!el) {
        return;
      }

      this.el = el;
      this.toggleClass = toggleClass;
      this.type = type ? type : 'default';
      this.label = this.el.parentNode;
      this.wrapper = this.label.parentNode;
      this.elTags = this.wrapper.querySelector('.searchTagsWrapper');
      this.elSearch = this.wrapper.querySelector('.searchTextWrapper');
      this.elSearchValue = this.wrapper.querySelectorAll('.searchValue');
      this.buttonRecentRemove = this.wrapper.querySelector('.buttonRecentRemove');
      this.recent = this.wrapper.querySelector('.searchTagsRecent');
      this.wrapperClassList = this.wrapper.getAttribute('class');
      this.elTagsClassList = this.elTags.getAttribute('class');
      this.elSearchClassList = this.elSearch.getAttribute('class');
      this.expandEl = expandEl;
      this.isOpened = false;

      if (document.addEventListener) {
        if (this.type !== 'typeSub') {
          this.el.addEventListener('click', this.onOpen.bind(this));
          this.buttonRecentRemove.addEventListener('click', this.removeRecent.bind(this));
        }
        this.el.addEventListener('keyup', this.onSearch.bind(this));
        window.addEventListener('click', this.handlerSearch.bind(this));
      } else {
        if (this.type !== 'typeSub') {
          this.el.attachEvent('onclick', this.onOpen.bind(this));
          this.buttonRecentRemove.attachEvent('onclick', this.removeRecent.bind(this));
        }
        this.el.attachEvent('onkeyup', this.onSearch.bind(this));
        document.attachEvent('onclick', this.handlerSearch.bind(this));
      }
    };

    Search.prototype.onOpen = function() {
      if (this.type !== 'typeSub') {
        this.showTags();
      } else {
        this.showSearch();
      }
      this.isOpened = true;
      this.expandEl.setAttribute('aria-expanded', true);
      this.wrapper.setAttribute('class', this.wrapperClassList + ' ' + this.toggleClass);
    };

    Search.prototype.onClose = function() {
      this.isOpened = false;
      this.expandEl.setAttribute('aria-expanded', false);
      this.wrapper.setAttribute('class', this.wrapperClassList.replace(' ' + this.toggleClass, ''));
      this.el.value = '';

      if (this.el.removeEventListener) {
        this.el.removeEventListener('click', this.onOpen);
        this.buttonRecentRemove.removeEventListener('click', this.onOpen);
      } else {
        this.el.detachEvent('onclick', this.onOpen);
        this.buttonRecentRemove.detachEvent('onclick', this.onOpen);
      }
    };

    Search.prototype.handlerSearch = function() {
      if (this.isOpened) {
        this.target = window.event.target || window.event.srcElement;
        while (this.target !== 'undefined' && this.target.parentNode) {
          if (this.target === this.wrapper || this.target === this.buttonRecentRemove) {
            return;
          }
          this.target = this.target.parentNode;
        }
        this.onClose();
      }
    };

    Search.prototype.removeRecent = function() {
      if (this.recent) {
        this.recent.parentNode.removeChild(this.recent);
      }
    };

    Search.prototype.onSearch = function() {
      if (this.showSearch || this.showTags || this.onOpen) {
        clearTimeout(this.onOpen.bind(this));
        clearTimeout(this.showSearch.bind(this));
        clearTimeout(this.showTags.bind(this));
      }

      this.keyCode = (window.event) ? event.keyCode : event.which;
      this.searchValue = this.el.value;
      if (this.keyCode === 8 && !this.searchValue) {
        setTimeout(function() {
          if (this.type === 'typeSub') {
            this.onClose();
          } else {
            this.showTags();
          }
        }.bind(this), 200);
      } else if (this.keyCode === 13) {
        location.reload();
      } else {
        if (this.type === 'typeSub') {
          this.onOpen();
        } else {
          setTimeout(function() {
            this.showSearch();
          }.bind(this), 200);
        }
      }

      this.onSearchChange(this.searchValue);
    };

    Search.prototype.onSearchChange = function(text) {
      for (var t = 0; t < this.elSearchValue.length; t++) {
        this.elSearchValue[t].innerText = text;
      }
    };

    Search.prototype.showSearch = function() {
      this.elSearch.setAttribute('class', this.elSearchClassList + ' ' + this.toggleClass);
      this.elTags.setAttribute('class', this.elTagsClassList.replace(' ' + this.toggleClass, ''));
    };

    Search.prototype.showTags = function() {
      this.elTags.setAttribute('class', this.elTagsClassList + ' ' + this.toggleClass);
      this.elSearch.setAttribute('class', this.elSearchClassList.replace(' ' + this.toggleClass, ''));
    };

    return Search;
  })();

  utils.CheckCustom = (function() {
    var CheckCustom = function(el, trigger, max, filter) {
      if (!el) {
        return;
      }

      this.el = el;
      this.trigger = this.el.querySelectorAll('input[type="' + trigger + '"]');
      this.triggerLength = this.trigger.length;
      this.toggleClass = 'checked';
      this.hiddenClass = 'active';
      this.max = max || null;
      this.currentTrigger = null;
      this.triggerWrapper = null;
      this.triggerWrapperClass = null;
      this.label = null;
      this.isFilter = !!filter;
      this.filter = null;
      this.layerTrigger = this.el.parentNode.querySelector('.buttonMoreLocation');
      this.filterListWrapper = document.querySelector('.listFilter');
      this.filterParent = this.filterListWrapper.parentNode;
      this.isAddFilter = false;

      if (max) {
        // this.hiddenButton();
      }

      for (var i = 0; i < this.triggerLength; i++) {
        if (this.trigger[i].addEventListener) {
          this.target = this.trigger[i].getAttribute('id');
          this.trigger[i].addEventListener('click', this.getCheck.bind(this, this.target));
        } else {
          this.trigger[i].attachEvent('onclick', this.getCheck.bind(this, this.target));
        }
      }
    };

    CheckCustom.prototype.getCheck = function(target) {
      this.currentTrigger = document.getElementById(target);
      this.triggerWrapper = this.currentTrigger.parentNode;
      this.label = this.triggerWrapper.querySelector('label');
      this.triggerWrapperClass = this.triggerWrapper.getAttribute('class');

      this.handlerCheck();
    };

    CheckCustom.prototype.handlerCheck = function() {
      this.event = window.event.target || window.event.srcElement;
      if (this.currentTrigger.checked && this.event.tagName === 'INPUT') {
        this.onCheck();
      } else {
        this.offCheck();
      }
    };

    CheckCustom.prototype.onCheck = function() {
      this.addClass =
        this.triggerWrapperClass === null || this.triggerWrapperClass === ''
          ? this.toggleClass
          : this.triggerWrapperClass + ' ' + this.toggleClass;
      this.triggerWrapper.setAttribute('class', this.addClass);
      this.currentTrigger.checked = true;
      this.currentTrigger.setAttribute('aria-checked', this.currentTrigger.checked);
      if (this.isFilter) {
        this.addFilter();
      }
    };

    CheckCustom.prototype.offCheck = function(target) {
      if (target) {
        this.currentTrigger = document.getElementById(target);
        this.triggerWrapper = this.currentTrigger.parentNode;
        this.triggerWrapperClass = this.triggerWrapper.getAttribute('class');
      }

      this.removeClass =
        this.toggleClass === this.triggerWrapperClass
          ? ''
          : this.triggerWrapperClass.replace(' ' + this.toggleClass, '');
      this.triggerWrapper.setAttribute('class', this.removeClass);
      this.currentTrigger.checked = false;
      this.currentTrigger.setAttribute('aria-checked', this.currentTrigger.checked);
      if (this.isFilter) {
        this.removeFilter(this.currentTrigger.getAttribute('id'));
      }
    };

    CheckCustom.prototype.hiddenButton = function() {
      if (this.triggerLength < this.max) {
        this.layerTrigger.parentNode.removeChild(this.layerTrigger);
      }
    };

    CheckCustom.prototype.setFilter = function() {
      this.filterElement = document.createElement('li');
      this.buttonDeleteFilter = document.createElement('button');
      this.buttonDeleteFilter.setAttribute('type', 'button');
      this.buttonDeleteFilter.setAttribute('class', 'buttonFilterDelete');
      this.buttonDeleteFilter.setAttribute('data-filter', this.currentTrigger.getAttribute('id'));
      this.buttonDeleteFilter.innerText = this.label.innerText.toString();
      this.filterElement.appendChild(this.buttonDeleteFilter);
    };

    CheckCustom.prototype.addFilter = function() {
      this.isAddFilter = true;
      this.setFilter();
      this.filterListWrapper.appendChild(this.filterElement);
      this.handlerFilterList();

      if (this.buttonDeleteFilter.addEventListener) {
        this.buttonDeleteFilter.addEventListener('click', this.getCheck.bind(this, this.buttonDeleteFilter.getAttribute('data-filter')));
      } else {
        this.buttonDeleteFilter.attachEvent('onclick', this.getCheck.bind(this, this.buttonDeleteFilter.getAttribute('data-filter')));
      }
    };

    CheckCustom.prototype.removeFilter = function(target) {
      this.isAddFilter = false;
      this.currentFilter = this.filterListWrapper.querySelector('button[data-filter="' + target + '"]');
      this.filterListWrapper.removeChild(this.currentFilter.parentNode);
      this.handlerFilterList();
    };

    CheckCustom.prototype.handlerFilterList = function() {
      this.filter = this.filterListWrapper.querySelectorAll('li');
      this.filterParentClassList = this.filterParent.getAttribute('class');

      if (this.isAddFilter && this.filter.length === 1) {
        this.showFilter();
      } else if (!this.isAddFilter && this.filter.length === 0) {
        this.hideFilter();
      }
    };

    CheckCustom.prototype.showFilter = function() {
      this.addClass =
        this.filterParentClassList === null || this.filterParentClassList === ''
          ? this.hiddenClass
          : ' ' + this.hiddenClass;
      this.filterParent.setAttribute('class', this.filterParentClassList + this.addClass);
    };

    CheckCustom.prototype.hideFilter = function() {
      this.removeClass =
        this.hiddenClass === this.filterParentClassList
          ? ''
          : this.filterParentClassList.replace(' ' + this.hiddenClass, '');
      this.filterParent.setAttribute('class', this.removeClass);
    };

    return CheckCustom;
  })();

  utils.ToggleExpand = (function() {
    var ToggleExpand = function(el, trigger) {
      if (!el) {
        return;
      }

      this.el = el;
      this.trigger = this.el.querySelector(trigger);
      this.isOpened = true;
      this.toggleClass = 'active';
      if (this.trigger.addEventListener) {
        this.trigger.addEventListener('click', this.handlerToggle.bind(this));
      } else {
        this.trigger.attachEvent('onclick', this.handlerToggle.bind(this));
      }
    };

    ToggleExpand.prototype.handlerToggle = function() {
      this.update();
      if (this.isOpened) {
        this.onClose();
      } else {
        this.onOpen();
      }

      this.el.setAttribute('aria-expanded', this.isOpened);
    };

    ToggleExpand.prototype.update = function() {
      this.elClassList = this.el.getAttribute('class');
      this.triggerText = this.trigger.querySelector('span').innerText;
      this.trigger.querySelector('span').innerText =
        this.isOpened
          ? this.triggerText.replace('닫기', '열기')
          : this.triggerText.replace('열기', '닫기');
    };

    ToggleExpand.prototype.onOpen = function() {
      this.isOpened = true;
      this.addClass =
        this.elClassList === null || this.elClassList === ''
          ? this.toggleClass
          : ' ' + this.toggleClass;
      this.el.setAttribute('class', this.elClassList + this.addClass);
    };

    ToggleExpand.prototype.onClose = function() {
      this.isOpened = false;
      this.removeClass =
        this.toggleClass === this.elClassList
          ? ''
          : this.elClassList.replace(' ' + this.toggleClass, '');
      this.el.setAttribute('class', this.removeClass);
    };

    return ToggleExpand;
  })();

  utils.Tab = (function() {
    var Tab = function(wrapper, trigger, toggleClass, onAfter) {
      if (!wrapper) {
        return;
      }

      this.wrapper = wrapper;
      this.trigger = this.wrapper.querySelectorAll(trigger);
      this.toggleClass = toggleClass;
      this.onAfter = onAfter;

      for (var i = 0; i < this.trigger.length; i++) {
        if (this.trigger[i].addEventListener) {
          this.trigger[i].addEventListener('click', this.handlerClass.bind(this, i));
        } else {
          this.trigger[i].attachEvent('onclick', this.handlerClass.bind(this, i));
        }
      }
    };

    Tab.prototype.handlerClass = function(i) {
      this.removeClass();
      this.addClass(i);
      if (this.onAfter === 'calendar') {
        this.hideCalendar(i);
      }
    };

    Tab.prototype.addClass = function(i) {
      this.trigger[i].setAttribute('class', this.toggleClass);
    };

    Tab.prototype.removeClass = function() {
      for (var i = 0; i < this.trigger.length; i++) {
        this.trigger[i].setAttribute('class', '');
      }
    };

    Tab.prototype.hideCalendar = function(i) {
      if (i === 2) {
        return;
      }
      this.calendar = document.querySelector('.layerCalendar');
      this.calendar.setAttribute('class', 'layerCalendar');
      this.selectDate = document.querySelector('.buttonSelectDate span');
      this.selectDate.innerText = '날짜선택';
      $('.datepicker').datepicker('destroy');
    };

    return Tab;
  })();

  utils.customSelect = (function() {
    var customSelect = function(wrapper, trigger, el, toggleClass) {
      if (!wrapper) {
        return;
      }

      this.wrapper = wrapper;
      this.trigger = this.wrapper.querySelector(trigger);
      this.el = this.wrapper.querySelector(el);
      this.options = this.el.querySelectorAll('li');
      this.toggleClass = toggleClass;
      this.isOpened = false;

      if (document.addEventListener) {
        this.trigger.addEventListener('click', this.toggle.bind(this));
      } else {
        this.trigger.attachEvent('onclick', this.toggle.bind(this));
      }

      for (var i = 0; i < this.options.length; i++) {
        if (document.addEventListener) {
          this.options[i].addEventListener('click', this.setValue.bind(this));
        } else {
          this.options[i].attachEvent('onclick', this.setValue.bind(this));
        }
      }
    };

    customSelect.prototype.toggle = function() {
      this.update();
      if (this.isOpened) {
        this.onClose();
      } else {
        this.onOpen();
      }
    };

    customSelect.prototype.update = function() {
      this.elClassList = this.el.getAttribute('class');
    };

    customSelect.prototype.onOpen = function() {
      this.isOpened = true;
      this.addClass =
        this.elClassList === null || this.elClassList === ''
          ? this.toggleClass
          : ' ' + this.toggleClass;
      this.el.setAttribute('class', this.elClassList + this.addClass);

      if (document.addEventListener) {
        window.addEventListener('click', this.handlerSelect.bind(this));
      } else {
        document.attachEvent('onclick', this.handlerSelect.bind(this));
      }
    };

    customSelect.prototype.onClose = function() {
      this.isOpened = false;
      this.removeClass =
        this.toggleClass === this.elClassList
          ? ''
          : this.elClassList.replace(' ' + this.toggleClass, '');
      this.el.setAttribute('class', this.removeClass);

      if (document.removeEventListener) {
        window.removeEventListener('click', this.handlerSelect);
      } else {
        document.detachEvent('onclick', this.handlerSelect);
      }
    };

    customSelect.prototype.handlerSelect = function() {
      if (this.isOpened) {
        this.event = window.event || window.event;
        this.target = window.event.target || window.event.srcElement;
        while (this.target !== 'undefined' && this.target.parentNode) {
          if (this.target === this.wrapper) {
            return;
          }
          this.target = this.target.parentNode;
        }
        this.onClose();
      }
    };

    customSelect.prototype.setValue = function(e) {
      if (window.event) {
        e.returnValue = false;
      } else {
        e.preventDefault();
      }

      this.target = window.event.target || window.event.srcElement;
      this.changeText(this.target.innerText);
    };


    customSelect.prototype.changeText = function(value) {
      this.trigger.querySelector('.listTitle').innerHTML = value;
      this.onClose();
    };

    return customSelect;
  })();

  utils.Popup = (function() {
    var Popup = function(trigger, el, toggleClass, onAfter) {
      if (!trigger) {
        return;
      }

      this.trigger = trigger;
      this.el = document.querySelector(el);
      this.toggleClass = toggleClass;
      this.isOpened = false;
      this.buttonClose = this.el.querySelector('.buttonCloseLayer');
      this.onAfter = onAfter;

      if (document.addEventListener) {
        this.trigger.addEventListener('click', this.toggle.bind(this));
        if (this.buttonClose) {
          this.buttonClose.addEventListener('click', this.onClose.bind(this));
        }
      } else {
        this.trigger.attachEvent('onclick', this.toggle.bind(this));
        if (this.buttonClose) {
          this.buttonClose.attachEvent('onclick', this.onClose.bind(this));
        }
      }
    };

    Popup.prototype.toggle = function() {
      this.update();
      if (this.isOpened) {
        this.onClose();
      } else {
        this.onOpen();
      }
    };

    Popup.prototype.update = function() {
      this.elClassList = this.el.getAttribute('class');
    };

    Popup.prototype.onOpen = function() {
      this.isOpened = true;
      this.addClass =
        this.elClassList === null || this.elClassList === ''
          ? this.toggleClass
          : ' ' + this.toggleClass;
      this.el.setAttribute('class', this.elClassList + this.addClass);

      if (!this.onAfter) {
        return;
      }

      this.openCalendar();
      this.isOpened = false;
    };

    Popup.prototype.onClose = function() {
      this.isOpened = false;
      this.removeClass =
        this.toggleClass === this.elClassList
          ? ''
          : this.elClassList.replace(' ' + this.toggleClass, '');
      this.el.setAttribute('class', this.removeClass);
    };

    Popup.prototype.openCalendar = function() {
      this.calendar = document.querySelector('.datepicker');
      this.today = this.calendar.querySelector('.pick');
      if (this.today) {
        return;
      }

      this.create();
    };

    Popup.prototype.create = function() {
      var days_ko = ['일', '월', '화', '수', '목', '금', '토'];
      var pickEvent = function(e) {
        var selectedDate = e.date ? new Date(e.date) : new Date();
        this.changeValue(selectedDate);
        if (!e.date) {
          return;
        }

        $('.layerCalendar').removeClass('active');
        this.isOpened = false;
      }.bind(this);

      $('.datepicker').datepicker({
        inline: true,
        yearFirst: true,
        yearSuffix: '.',
        months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        daysMin: days_ko,
        startDate: new Date(),
        highlightedClass: '',
        pick: pickEvent,
        show: pickEvent
      });
    };

    Popup.prototype.changeValue = function(selectedDate) {
      var lengthAddZero = function(d) {
        var stringDate = d.toString();
        if (stringDate.length > 2) {
          stringDate = stringDate.slice(2, 4);
        }
        if (stringDate.length === 1) {
          stringDate = '0' + stringDate;
        }
        return stringDate;
      };

      var dateFormat = [
        lengthAddZero(selectedDate.getFullYear()),
        '.',
        lengthAddZero(selectedDate.getMonth() + 1),
        '.',
        lengthAddZero(selectedDate.getDate())
      ].join('');

      $('.buttonSelectDate span').text(dateFormat);
    };

    return Popup;
  })();

  utils.FilterFixed = (function() {
    var FilterFixed = function(el, list) {
      this.el = $(el);

      if (this.el.length === 0) {
        return;
      }

      this.wrapper = this.el.parent();
      this.elHeight = this.el.innerHeight();
      this.elTop = this.el.offset().top;
      this.scrollTop = $(window).scrollTop();
      this.windowHeight = $(window).innerHeight();
      this.bodyHeight = $('body').innerHeight();
      this.footer = $('#intFooter');
      this.footerHeight = this.footer.length > 0 ? this.footer.innerHeight() : 0;
      this.list = $(list);
      if (this.list.children().hasClass('listProductNoList')) {
        this.el.addClass('relative');
        return;
      }
      $(window).on('load scroll', this.onScroll.bind(this));
    };

    FilterFixed.prototype.onScroll = function() {
      this.scrollingTop = $(window).scrollTop();
      this.fixedPoint = (this.elTop + this.elHeight) - this.windowHeight;
      this.absolutePoint = this.bodyHeight - (this.windowHeight + this.footerHeight);

      if (this.scrollingTop < this.fixedPoint) {
        this.scrollInit();
      } else if (this.scrollingTop < this.absolutePoint) {
        this.scrollFixed();
      } else {
        this.scrollAbsolute();
      }
    };

    FilterFixed.prototype.scrollInit = function() {
      this.el.attr('class', 'activityListLeft');
    };

    FilterFixed.prototype.scrollAbsolute = function() {
      this.el
        .removeClass('fixed')
        .addClass('absoluteBottom');
    };

    FilterFixed.prototype.scrollFixed = function() {
      this.el
        .removeClass('absoluteBottom')
        .addClass('fixed');
    };
    return FilterFixed;
  })();

  utils.Slider = (function() {
    var Slider = function(el, args) {
      if (!el) {
        return;
      }

      var defaults = {
        handles: false,
        gripLeft: '.gripLeft',
        gripRight: '.gripLeft',
        bar: '.filterPriceBar',
        onSliderAfter: function() {}
      };

      var options = $.extend({}, defaults, args);
      this.el = $(el);
      this.handles = options.handles;
      this.gripLeft = options.gripLeft;
      this.gripRight = options.gripRight;
      this.bar = options.bar;
      this.onSliderAfter = options.onSliderAfter;

      this.create();
    };

    Slider.prototype.create = function() {
      this.el.nstSlider({
        'crossable_handles': this.handles,
        'left_grip_selector': this.gripLeft,
        'right_grip_selector': this.gripRight,
        'value_bar_selector': this.bar,
        'value_changed_callback': this.onSliderAfter
      });
    };

    return Slider;
  })();

  return {
    utils: utils
  };
})();
