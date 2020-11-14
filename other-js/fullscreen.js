function fullscreen() {
  var inFullscreen = window.innerHeight == screen.height;
  if (inFullscreen) {
    exitFullscreen();
  } else {
    enterFullscreen();
  }
}

function exitFullscreen() {
  var fullscreenButton = document.getElementById("fullscreen");

  var requestExitFullscreen =
    document.exitFullscreen ||
    document.webkitExitFullscreen ||
    document.mozExitFullScreen ||
    document.msExitFullscreen;
  if (requestExitFullscreen) {
    requestExitFullscreen.call(document);
    fullscreenButton.getElementsByTagName("i")[0].innerText = "fullscreen";
    fullscreenButton.nextElementSibling.setAttribute(
      "data-before",
      "Fullscreen"
    );
    fullscreenButton.nextElementSibling.style.setProperty("--left", "-4.1em");
  }
}

function enterFullscreen() {
  var body = document.body;
  var fullscreenButton = document.getElementById("fullscreen");

  var requestEnterFullscreen =
    body.requestFullScreen ||
    body.webkitRequestFullScreen ||
    body.mozRequestFullScreen ||
    body.msRequestFullScreen;
  if (requestEnterFullscreen) {
    requestEnterFullscreen.call(body);
    fullscreenButton.getElementsByTagName("i")[0].innerText = "fullscreen_exit";
    fullscreenButton.nextElementSibling.setAttribute(
      "data-before",
      "Exit fullscreen"
    );
    fullscreenButton.nextElementSibling.style.setProperty("--left", "-5.1em");
  }
}
