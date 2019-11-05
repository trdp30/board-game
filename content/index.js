var currentState = {
  level: 1,
  sequence: [1, 2, 3, 4],
  allSequences:[],
  lastSequence:null,
  currentDuration: 1000,
  life: 3,
  maxLevel:10
};
var blinkTimer=null;
var showBlockButtons = false;
var isPlaying = false;
var isStop = true;
var selectedQueue=[];
var isMessageShowing = false;
var subtrackDurationBy = 250;

window.onload = function() {
  init();
  registerEvent();
};

function resetGame() {
  currentState = {
    level: 1,
    sequence: [1, 2, 3, 4],
    allSequences:[],
    lastSequence:null,
    currentDuration: 1000,
    life: 3,
    maxLevel:10
  };
  resetProperties();
  hideMessageBox();
  setLevel();
}

function resetProperties() {
  if (blinkTimer) {
    clearInterval(blinkTimer);
    blinkTimer = null;
  }
  showBlockButtons = false;
  isPlaying = false;
  isStop = true;
  selectedQueue = [];
  subtrackDurationBy = 250;
  enablePlayButton();
  disableSubmitButton();
  disableTryAgainButton();
  toggleView('blockButtons', 'animationElement', false);
  saveData();
}

function init() {
  currentState = fetchData();
  setLevel(currentState.level);
};

function setLevel() {
  $('.top.header').text(`Level ${currentState.level}`);
};

//registering jquery events
function registerEvent() {
  $('.button.play').on('click', function() {
    currentState.sequence = getSequence()
    start(currentState.sequence)
  });
  $('#blockButtons').on('click', function(event) {
    const target = event.target.id;
    if(event.target.id == "1" || event.target.id == "2" || event.target.id == "3" || event.target.id == "4") {
      // hideMessageBox();
      enableSubmitButton();
      selectedQueue.push(parseInt(target));
    }
  });
  $('.button.submit').on('click', function() {
    hideMessageBox();
    submit();
  });
  $('.button.try-again').on('click', function() {
    if(currentState.life > 0) {
      currentState.life = currentState.life - 1 
      saveData();
      currentState.sequence = getSequence()
      start(currentState.sequence);
    }
  });
  $('.button.reset-game').on('click', function() {
    resetGame()
  })
};

//to save old data if any on refresh
function fetchData() {
  var oldState = localStorage.getItem('color-game');
  if(oldState) {
    currentState = JSON.parse(oldState);
    // currentState.level = currentState.level + 1
  }
  return currentState;
};

//to save data to localstorage
function saveData() {
  let state = JSON.stringify(currentState)
  localStorage.setItem('color-game', state);
};

//for generating number sequence
function getSequence() {
  let seq = _.shuffle(currentState.sequence)
  let oldSeq = [];
  if(currentState.allSequences.length && currentState.allSequences.length != 64) {
    oldSeq = currentState.allSequences.filter((s) => _.isEqual(s, seq))
  } else if(currentState.allSequences.length == 64){
    currentState.allSequences = []
  }
  if(oldSeq.length) {
    return seq = getSequence()
  }
  return seq;
};

//on click play button
function start() {
  setLevel();
  if(showBlockButtons) {
    toggleView('blockButtons', 'animationElement', false)
  }
  hideMessageBox();
  selectedQueue=[];
  disablePlayButton();
  disableSubmitButton();
  disableTryAgainButton();
  disableResetButton();
  currentState.allSequences.push(currentState.sequence);
  //to-do checking for level
  startBlinker(currentState.sequence, currentState.currentDuration)
};

//playing animation
function startBlinker(sequence=[], duration=1000) {
  let length = sequence.length
  let count = 0
  let animationDuration = `${currentState.currentDuration}ms`
  blinkTimer = setInterval(() => {
    if(count < length) {
      $(`#${sequence[count]}`).transition('pulse', animationDuration)
      count++
    } else {
      clearInterval(blinkTimer);
      stop('blinkTimer');
    }
  }, duration)
}

//On stop
function stop() {
  enableResetButton();
  enableTryAgainButton();
  toggleView('blockButtons', 'animationElement', true);
  showMessageBox('visible');
}

//on submit
function submit() {
  disableSubmitButton()
  let isSuccess = _.isEqual(currentState.sequence, selectedQueue);
  if(isSuccess) {
    setLevetUp();
  } else {
    failed();
  }
  selectedQueue = [];
}

function setLevetUp() {
  // save();
  if(currentState.level < currentState.maxLevel) {
    currentState.level = currentState.level + 1;
    currentState.allSequences = [];
    if(currentState.level >=2 && currentState.level <=4) {
      currentState.currentDuration = currentState.currentDuration != 250 ? ( currentState.currentDuration - subtrackDurationBy ) : 250
    } else if(currentState.level >=4 && currentState.level <=6) {
      currentState.currentDuration = 250;
      currentState.sequence.push(_.random(1,4))
    } else if(currentState.level == 7) {
      currentState.currentDuration = 250;
      currentState.sequence.push(_.random(1,4))
      currentState.sequence.push(_.random(1,4))
    } else if(currentState.level > 7 && currentState.level <=10) {
      currentState.currentDuration = 250;
      currentState.sequence.push(_.random(1,4))
    }
    save();
  } else {
    resetGame()
    showMessageBox('complete')
  }
}

function failed() {
  resetGame()
  showMessageBox("negative")
}

//on successfully completed the level
function save() {
  // currentState.allSequences.push(currentState.sequence);
  currentState.lastSequence = currentState.sequence;
  currentState.currentDuration = currentState.currentDuration;
  currentState.level = currentState.level;
  currentState.life = currentState.life;
  saveData(currentState);
  success();
};

function success() {
  showMessageBox("positive");
  resetProperties()
};
//show/hide view
function toggleView(viewOne, viewTwo, value) {
  $(`#${viewOne}`).toggle();
  $(`#${viewTwo}`).toggle()
  showBlockButtons = value
}

//To show message box
function showMessageBox(type) {
  if(type == "positive") {
    $('.messageBox').addClass(type)
    $('.messageBox').toggle()
    $('.messageBox').text(`Congrats! You have completed level ${currentState.level}. Press "Play" button to play next level.`)
  } else if(type == "negative") {
    $('.messageBox').addClass(type);
    $('.messageBox').toggle();
    $('.messageBox').text(`Sorry! You failed to complete this level. Please start over.`);
  } else if(type == "visible") {
    $('.messageBox').addClass(type);
    $('.messageBox').toggle();
    $('.messageBox').text(`Select the coloured boxs in sequence then press the "Submit" button to submit your answer.`);
  } else if(type == "complete"){
    $('.messageBox').addClass('positive');
    $('.messageBox').toggle();
    $('.messageBox').text(`Yoo, congrates! you have successfully completed the game`);
  }
  isMessageShowing = true
}

//To hide message box
function hideMessageBox() {
  if(isMessageShowing) {
    $('.messageBox').toggle();
  }
 if($('.messageBox').hasClass('positive')) {
  $('.messageBox').removeClass('positive')
 } else if($('.messageBox').hasClass('negative')) {
  $('.messageBox').removeClass('negative')
 } else if($('.messageBox').hasClass('visible')) {
  $('.messageBox').removeClass('visible')
 }
  isMessageShowing = false
};

//to disable the play button
function disablePlayButton() {
  $('.button.play').addClass('disabled')
};

//to enable the play button
function enablePlayButton() {
  $('.button.play').removeClass('disabled')
};

//to disable the submit button
function disableSubmitButton() {
  $('.button.submit').addClass('disabled')
};
//to enable the submit button
function enableSubmitButton() {
  $('.button.submit').removeClass('disabled')
};

//to disable the try again button
function disableTryAgainButton() {
  $('.button.try-again').addClass('disabled')

};

//to enable the try again button
function enableTryAgainButton() {
  if(currentState.life > 0) {
    $('.button.try-again').removeClass('disabled')
  }
};

//to disable the try again button
function disableResetButton() {
  $('.button.reset-game').addClass('disabled')
};

//to enable the try again button
function enableResetButton() {
  $('.button.reset-game').removeClass('disabled')
};

