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

const init = _ => {
  console.log('dom ready');
};

if (document.readyState === 'complete') {
  init();
} else if (document.addEventListener) {
  document.addEventListener('DOMContentLoaded', init);
}
