window.onload = function() {
  init();
  registerEvent();
}

function init() {
  console.log('here')
}

function registerEvent() {
  $('button').on('click', function() {
    console.log('click')
  })
}

function shuffleBlock() {
  _.shuffle([1, 2, 3, 4]);
}