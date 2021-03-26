window.Spinner = {
  previousFocus: null,
  focusTrap: null,

  initialize: function () {
    this.createSpinner();
    this.createFocusTrap();
  },

  createSpinner: function () {
    var styles =
      "body.loading {" +
      "  user-select: none;" +
      "}" +
      "body.loading:before {" +
      "  z-index: 9001;" +
      '  content: "";' +
      "  position: absolute;" +
      "  width: 120px;" +
      "  height: 120px;" +
      "  top: calc(50% - 120px/2); /* -1/2 of height */" +
      "  left: calc(50% - 120px/2); /* -1/2 of width */" +
      "  box-sizing: border-box;" +
      "  border: 16px solid black;" +
      "  border-radius: 50%;" +
      "  border-top: 16px solid lime;" +
      "  box-shadow: 0 0 20px 0 #00000050, inset 0 0 20px 0 #00000050;" +
      "  -webkit-animation: spin 2s linear infinite; /* Safari */" +
      "  animation: spin 2s linear infinite;" +
      "  cursor: progress;" +
      "}" +
      "body.loading:after {" +
      "  z-index: 9000;" +
      '  content: "";' +
      "  position: absolute;" +
      "  width: 100vw;" +
      "  height: 100vh;" +
      "  top: 0;" +
      "  left: 0;" +
      "  background: #333;" +
      "  opacity: 0.5;" +
      "  cursor: progress;" +
      "}" +
      "/* Safari */" +
      "@-webkit-keyframes spin {" +
      "  0% { -webkit-transform: rotate(0deg); }" +
      "  100% { -webkit-transform: rotate(360deg); }" +
      "}" +
      "@keyframes spin {" +
      "  0% { transform: rotate(0deg); }" +
      "  100% { transform: rotate(360deg); }" +
      "}";
    var styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.className = "spinner-style-sheet";
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
  },

  show: function () {
    document.body.classList.add("loading");
    this.enableFocusTrap();
  },

  hide: function () {
    document.body.classList.remove("loading");
    this.disableFocusTrap();
  },

  createFocusTrap: function () {
    this.focusTrap = document.createElement("span");
    this.focusTrap.innerText = "Action in progress. Please wait.";
    this.focusTrap.tabIndex = -1;
    this.focusTrap.style.left = "-100vw";
    this.focusTrap.style.top = "-100vh";
    var button = document.createElement("button");
    button.tabIndex = -1;
    this.focusTrap.appendChild(button);
    document.body.appendChild(this.focusTrap);
  },

  enableFocusTrap: function () {
    this.previousFocus = document.activeElement;
    this.focusTrap.autofocus = true;
    this.focusTrap.querySelector("button").tabIndex = 0;
    setUpKeyboardFocusTrap(this.focusTrap);
    this.focusTrap.focus();
    A11y.announce("Action in progress. Please wait.");
  },

  disableFocusTrap: function () {
    this.focusTrap.autofocus = false;
    this.focusTrap.querySelector("button").tabIndex = -1;
    document.activeElement = this.previousFocus;
    document.activeElement.focus();
  },
};
