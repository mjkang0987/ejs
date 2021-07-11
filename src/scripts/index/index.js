;(_ => {
  'use strict';

  const CONSTANTS = {
    ELEMENT: {
      HELLO : docSelector({el: '.helloWorld'}),
      PAGE  : '[data-depth="1"]',
      STATE : '[data-depth="2"]',
      IFRAME: docSelector({el: '#contentFrame'}),
      WIN   : docSelector({el: '.link-new'})
    },
    CLASS  : {
      HIDE  : 'hide',
      TOGGLE: 'on'
    }
  };

  const pages = {
    info   : {
      pages : [],
      length: 0,
      first : null,
      last  : null
    },
    current: {
      hash : '',
      url  : [],
      state: '',
      group: null,
      _this: null
    }
  };

  const {ELEMENT, CLASS} = CONSTANTS;
  const {HELLO, PAGE, STATE, IFRAME, WIN} = ELEMENT;
  const {HIDE, TOGGLE} = CLASS;
  const {info, current} = pages;

  const getInfo = _ => {
    info.pages = docSelector({el: ELEMENT.STATE, all: true});
    info.length = info.pages.length;
    info.first = info.pages[0];
    info.last = info.length < 2 ? info.first : info.pages[info.length - 1];
  };

  const getHash = _ => {
    current.hash = window.location.hash;
  };

  const setHash = _ => {
    current._this = !current.hash
      ? info.first
      : docSelector({el: `[data-token="${current.hash.replace('#', '')}"]`}).parentNode;
    current.url = !current.hash
      ? info.first.querySelector('button')
        .dataset
        .token
        .split('-')
      : current._this.querySelector('button')
        .dataset
        .token
        .split('-');

    const length = current.url.length;
    const arrUrl = length > 3 ? current.url.slice(0, 3) : current.url;
    current.state = length > 3 ? `.${current.url[3]}` : '';
    current.group = docSelector({el: `.${arrUrl.join('-')}`});
  };

  const removePrev = _ => {
    docSelector({
      el: `.${TOGGLE}${PAGE}`
    }).classList.remove(TOGGLE);

    docSelector({
      el: `.${TOGGLE}${STATE}`
    }).classList.remove(TOGGLE);
  };

  const setCurrent = _ => {
    const url = `./${current.url.length > 3 ? current.url.slice(0, 3)
      .join('/') : current.url.join('/')}${current.state}.html`;
    current._this.classList.add(TOGGLE);
    current.group.classList.add(TOGGLE);
    HELLO.classList.add(HIDE);
    IFRAME.setAttribute('src', url);
    WIN.setAttribute('href', url);
  };

  const changeFrame = e => {
    const target = e.target;
    current.hash = target.dataset.token;
    changeHash({hash: current.hash});
    setHash();
    removePrev();
    setCurrent();
  };

  const handlerFrames = _ => {
    const iterPages = [...info.pages];

    iterPages.map(a => {
      a.addEventListener('click', changeFrame);
    });
  };

  const init = _ => {
    getInfo();
    getHash();
    setHash();
    changeHash({hash: current.url.join('-')});
    setCurrent();
    handlerFrames();
    console.log(pages);
  };

  if (document.readyState === 'complete') {
    init();
  } else if (document.addEventListener) {
    document.addEventListener('DOMContentLoaded', init);
  }
})();
