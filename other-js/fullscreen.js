var Fullscreen = {
  fullscreenKeysDebounce: null,
  fullscreenButtonFocusTimer: null,

  initialize: function () {
    this.initializeEventListeners();
  },

  initializeEventListeners: function () {
    document.addEventListener(
      "fullscreenchange",
      this.styleFullscreenButton.bind(this)
    );
    document.addEventListener(
      "webkitfullscreenchange",
      this.styleFullscreenButton.bind(this)
    );
    document.addEventListener(
      "mozfullscreenchange",
      this.styleFullscreenButton.bind(this)
    );
    document.addEventListener(
      "MSFullscreenChange",
      this.styleFullscreenButton.bind(this)
    );
    document.addEventListener(
      "keydown",
      this.detectFullscreenKeyboardShortcuts.bind(this)
    );
    document
      .getElementById("fullscreen")
      .addEventListener("click", this.fullscreen.bind(this));
  },

  detectFullscreenKeyboardShortcuts: function (event) {
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
    var isEsc = key === "Escape" || key === 27;
    if (isFOnly || isF11) {
      clearTimeout(Fullscreen.fullscreenKeysDebounce);
      Fullscreen.fullscreenKeysDebounce = setTimeout(function () {
        Fullscreen.fullscreen();
      }, 500);
    } else if (isCmdShiftF) {
      clearTimeout(Fullscreen.fullscreenKeysDebounce);
      Fullscreen.fullscreenKeysDebounce = setTimeout(function () {
        var areControlsToBeShown = false;
        Fullscreen.fullscreen(areControlsToBeShown);
      }, 500);
    } else if (isEsc) {
      this.showControls();
    }
  },

  fullscreen: function (areControlsToBeShown = true) {
    var inFullscreen = window.innerHeight == screen.height;
    if (inFullscreen) {
      this.exitFullscreen();
      this.showControls();
    } else {
      this.enterFullscreen();
      this.showControls(areControlsToBeShown);
    }
  },

  exitFullscreen: function () {
    var requestExitFullscreen =
      document.exitFullscreen ||
      document.webkitExitFullscreen ||
      document.mozExitFullScreen ||
      document.msExitFullscreen;
    if (requestExitFullscreen) {
      requestExitFullscreen.call(document);
      this.styleFullscreenButton();
    }
  },

  enterFullscreen: function () {
    var body = document.body;
    var requestEnterFullscreen =
      body.requestFullScreen ||
      body.webkitRequestFullScreen ||
      body.mozRequestFullScreen ||
      body.msRequestFullScreen;
    if (requestEnterFullscreen) {
      requestEnterFullscreen.call(body);
      this.styleFullscreenButton();
    }
  },

  styleFullscreenButton: function () {
    var fullscreenButton = document.getElementById("fullscreen");
    var inFullscreen = window.innerHeight == screen.height;
    if (inFullscreen) {
      fullscreenButton.getElementsByTagName("i")[0].innerText =
        "fullscreen_exit";
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
      this.showControls();
    }
    this.blurFullscreenButton(3000);
  },

  blurFullscreenButton: function (milliseconds) {
    var fullscreenButton = document.getElementById("fullscreen");
    clearTimeout(Fullscreen.fullscreenButtonFocusTimer);
    Fullscreen.fullscreenButtonFocusTimer = setTimeout(function () {
      fullscreenButton.blur();
    }, milliseconds);
  },

  showControls: function (areControlsToBeShown = true) {
    document.getElementById("controls").style.visibility = areControlsToBeShown
      ? ""
      : "hidden";
  },
};
