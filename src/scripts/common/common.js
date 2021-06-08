const commonJS = (_ => {
  'use strict';

  const docSelector = ({
    el,
    all: isAll
  }) => {
    if (isAll) {
      return document.querySelectorAll(el);
    } else {
      return document.querySelector(el);
    }
  };

  const createEl = ({tag, attribute}) => {
    const el = document.createElement(tag);
    Object.assign(el, attribute);
    return el;
  };

  const insertEl = ({
    target,
    position: pos = 'beforebegin',
    el
  }) => {
    target.insertAdjacentElement(pos, el);
  };

  const changeHash = ({hash}) => {
    window.location.hash = hash;
  };

  return {
    docSelector,
    createEl,
    insertEl,
    changeHash
  };
})();

const {docSelector, createEl, insertEl, changeHash} = commonJS;