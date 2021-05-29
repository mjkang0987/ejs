;(function() {
  'use strict';

  var domReady = function() {
    new activityScript.utils.Slide('.activitySlideEvent', {
      slideWidth: 782,
      slideMargin: 0,
      pagerCustom: '.activitySlideEventIndicator ul'
    });

    new activityScript.utils.Slide('.activitySlideRecommend', {
      slideMin: 4,
      slideMax: 4,
      slideWidth: 297,
      control: 1
    });

    new activityScript.utils.Slide('.activitySlidePopular', {
      slideMin: 5,
      slideMax: 5,
      slideMargin: 24,
      slideWidth: 232,
      control: 1
    });

    new activityScript.utils.Slide('.MD1', {
      slideMin: 2,
      slideMax: 2,
      slideWidth: 297,
      control: 1,
      count: true,
      auto: 0
    });

    new activityScript.utils.Slide('.MD2', {
      slideMin: 2,
      slideMax: 2,
      slideWidth: 297,
      control: 1,
      count: true,
      auto: 0
    });

    new activityScript.utils.Slide('.theme1', {
      slideMin: 5,
      slideMax: 5,
      slideWidth: 188,
      control: 1,
      count: true,
      auto: 0
    });

    new activityScript.utils.Slide('.theme2', {
      slideMin: 5,
      slideMax: 5,
      slideWidth: 188,
      control: 1,
      count: true,
      auto: 0
    });

    new activityScript.utils.Search(
      document.querySelector('.inputSearch'),
      document.querySelector('.activitySearchExpand'),
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