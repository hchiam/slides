document.addEventListener("fullscreenchange", styleFullscreenButton);
document.addEventListener("webkitfullscreenchange", styleFullscreenButton);
document.addEventListener("mozfullscreenchange", styleFullscreenButton);
document.addEventListener("MSFullscreenChange", styleFullscreenButton);

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
}
