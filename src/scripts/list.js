;(function() {
  'use strict';

  var domReady = function() {
    new activityScript.utils.LazyLoad('.lazy');

    new activityScript.utils.FilterFixed('.activityListLeft', '.listProductWrap');

    new activityScript.utils.Search(
      document.querySelector('.inputSearch'),
      document.querySelector('.activitySearchExpand'),
      'active',
      'typeSub'
    );

    new activityScript.utils.Slider('.filterSlider', {
      handles: false,
      gripLeft: '.gripLeft',
      gripRight: '.gripRight',
      bar: '.filterSliderBar',
      onSliderAfter: function(cause, minPrice, maxPrice) {
        var priceSetting = function(price) {
          price = Math.floor(price * 0.0001) * 10000;
          price = price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
          return price;
        };
        var leftPrice = priceSetting(minPrice);
        var rightPrice = priceSetting(maxPrice);
        $('.priceMin').text(leftPrice + '원');
        $('.priceMax').text(rightPrice + '원');
      }
    });

    new activityScript.utils.CheckCustom(
      document.querySelector('.filterLocationList'),
      'checkbox',
      10,
      'filter'
    );

    new activityScript.utils.CheckCustom(
      document.querySelector('.layerLocation'),
      'checkbox',
      10
    );

    new activityScript.utils.CheckCustom(
      document.querySelector('.filterCategoryList'),
      'checkbox',
      null,
      'filter'
    );

    new activityScript.utils.CheckCustom(
      document.querySelector('.filterDirect'),
      'checkbox'
    );

    new activityScript.utils.CheckCustom(
      document.querySelector('.listProduct'),
      'checkbox'
    );

    new activityScript.utils.ToggleExpand(
      document.querySelector('.filterLocation'),
      '.buttonToggle'
    );

    new activityScript.utils.ToggleExpand(
      document.querySelector('.filterCategory'),
      '.buttonToggle'
    );

    new activityScript.utils.Tab(
      document.querySelector('.listSortWrap'),
      'li',
      'active'
    );

    new activityScript.utils.Tab(
      document.querySelector('.dateList'),
      'li',
      'active',
      'calendar'
    );

    new activityScript.utils.customSelect(
      document.querySelector('.listSelectWrap'),
      '.buttonCategoryChange',
      '.listTitleCategoryExpand',
      'active'
    );

    new activityScript.utils.Popup(
      document.querySelector('.buttonSelectDate'),
      '.layerCalendar',
      'active',
      'calendar'
    );

    new activityScript.utils.Popup(
      document.querySelector('.buttonMoreLocation'),
      '.layerLocation',
      'active'
    );
  };

  if (document.readyState === 'complete') {
    domReady();
  } else if (document.addEventListener) {
    document.addEventListener('DOMContentLoaded', domReady);
  } else {
    document.attachEvent('onreadystatechange', function() {
      if (document.readyState === 'complete') {
        domReady();
      }
    });
  }
})();