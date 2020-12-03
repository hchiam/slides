document.addEventListener("fullscreenchange", styleFullscreenButton);
document.addEventListener("webkitfullscreenchange", styleFullscreenButton);
document.addEventListener("mozfullscreenchange", styleFullscreenButton);
document.addEventListener("MSFullscreenChange", styleFullscreenButton);
document.addEventListener("keydown", detectFullscreenKeyboardShortcuts);

var fullscreenKeysDebounce;
function detectFullscreenKeyboardShortcuts(event) {
  var isOnBody = document.activeElement === document.body;
  var isOnButton = document.activeElement.tagName === "BUTTON";
  if (!isOnBody && !isOnButton) return;
  var key = event.code || event.keyCode || event.which || window.event;
  var isFOnly =
    (key === "KeyF" || key === 70) &&
    !event.ctrlKey &&
    !event.metaKey &&
    !event.altKey &&
    !event.shiftKey;
  var isF11 = key === "F11" || key === 122;
  var isCmdShiftF =
    (event.ctrlKey || event.metaKey) &&
    event.shiftKey &&
    (key === "KeyF" || key === 70);
  if (isFOnly || isF11 || isCmdShiftF) {
    clearTimeout(fullscreenKeysDebounce);
    fullscreenKeysDebounce = setTimeout(function () {
      fullscreen();
    }, 500);
  }
}

function fullscreen() {
  var inFullscreen = window.innerHeight == screen.height;
  if (inFullscreen) {
    exitFullscreen();
  } else {
    enterFullscreen();
  }
}

function exitFullscreen() {
  var requestExitFullscreen =
    document.exitFullscreen ||
    document.webkitExitFullscreen ||
    document.mozExitFullScreen ||
    document.msExitFullscreen;
  if (requestExitFullscreen) {
    requestExitFullscreen.call(document);
    styleFullscreenButton();
  }
}

function enterFullscreen() {
  var body = document.body;
  var requestEnterFullscreen =
    body.requestFullScreen ||
    body.webkitRequestFullScreen ||
    body.mozRequestFullScreen ||
    body.msRequestFullScreen;
  if (requestEnterFullscreen) {
    requestEnterFullscreen.call(body);
    styleFullscreenButton();
  }
}

function styleFullscreenButton() {
  var fullscreenButton = document.getElementById("fullscreen");
  var inFullscreen = window.innerHeight == screen.height;
  if (inFullscreen) {
    fullscreenButton.getElementsByTagName("i")[0].innerText = "fullscreen_exit";
    fullscreenButton.nextElementSibling.setAttribute(
      "data-before",
      "Exit fullscreen"
    );
    fullscreenButton.nextElementSibling.style.setProperty("--left", "-5.1em");
  } else {
    var fullscreenButton = document.getElementById("fullscreen");
    fullscreenButton.getElementsByTagName("i")[0].innerText = "fullscreen";
    fullscreenButton.nextElementSibling.setAttribute(
      "data-before",
      "Fullscreen"
    );
    fullscreenButton.nextElementSibling.style.setProperty("--left", "-4.1em");
  }
  blurFullscreenButton(3000);
}

var fullscreenButtonFocusTimer = null;
function blurFullscreenButton(milliseconds) {
  var fullscreenButton = document.getElementById("fullscreen");
  clearTimeout(fullscreenButtonFocusTimer);
  fullscreenButtonFocusTimer = setTimeout(function () {
    fullscreenButton.blur();
  }, milliseconds);
}
