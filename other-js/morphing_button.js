// reference: https://github.com/hchiam/morphing_button

var Morphing_button = (function () {
  function setup(button) {
    button.addEventListener("animationend", function () {
      if (button && button.classList) button.classList.remove("reverting");
    });
  }

  function morph(button) {
    var boundingClient = button.getBoundingClientRect();
    button.style.left = boundingClient.left + "px";
    button.style.top = boundingClient.top + "px";
    button.classList.add("morphing");
    button.classList.remove("reverting");
    button.isExpanding = true;
    button.previousContent = button.innerHTML;
    button.disabled = true;
    var children = button.getElementsByClassName("hidden");
    if (children.length) {
      children.map(function (c) {
        if (c && c.classList) c.classList.remove("hidden");
      });
    }
  }

  function revert(button, e) {
    if (e && e.stopPropagation) e.stopPropagation();
    button.classList.remove("morphing");
    button.classList.add("reverting");
    button.isExpanding = false;
    button.disabled = false;
    if (button.previousContent) {
      button.innerHTML = button.previousContent;
      button.previousContent = null;
    }
    var children = button.getElementsByClassName("hidden");
    if (children.length) {
      children.map(function (c) {
        if (c && c.classList) c.classList.add("hidden");
      });
    }
  }

  function _setUpBasicMorphingButtons() {
    var morphing_buttons = Array.from(
      document.querySelectorAll(".morphing_button")
    );

    morphing_buttons.map(function (b) {
      b.addEventListener("click", function (e) {
        // if (this !== e.target) return;
        if (!b) return;
        b.isExpanding = !b.isExpanding;
        b.previousContent = b.innerHTML;
        if (b.isExpanding) {
          morph(this);
          b.disabled = false;
        } else {
          revert(this);
        }
      });
      b.addEventListener("animationend", function () {
        if (b && b.classList) b.classList.remove("reverting");
      });
    });
  }

  _setUpBasicMorphingButtons();

  // var x = document.querySelector("button .x");
  // x.addEventListener("click", revert);
  // x.addEventListener("keyup", function (e) {
  //   if (e.code !== "Space" && e.code !== "Enter") return;
  //   revert(this);
  // });

  var styles =
    "    .morphing_button {" +
    "      transition: 0.2s;" +
    "    }" +
    "    " +
    "    .morphing {" +
    "      animation: morph 1s forwards;" +
    "      margin: 0;" +
    "      outline: none;" +
    "      border: none;" +
    "      overflow: hidden;" +
    "      width: 5ch;" +
    "      height: 5ch;" +
    "    }" +
    "    " +
    "    .morphing.fill-screen {" +
    "      animation: move_to_center 0.3s forwards, morph_to_fill_screen 0.7s 0.3s forwards;" +
    "      position: fixed;" +
    "      z-index: 9001;" +
    "    }" +
    "    " +
    "    .reverting {" +
    "      animation: move_from_center 0.3s forwards, revert_morph 0.3s forwards;" +
    "      border: none;" +
    "    }" +
    "    " +
    "    .morphing *," +
    "    .reverting * {" +
    "      visibility: collapse;" +
    "      height: 0;" +
    "    }" +
    "    " +
    "    .morphing * {" +
    "      animation: show_children_after_morph 1s forwards;" +
    "    }" +
    "    @keyframes move_to_center {" +
    "      0% {" +
    "        position: fixed;" +
    "      }" +
    "      100% {" +
    "        position: fixed;" +
    "        top: calc(50vh - 2.5ch);" +
    "        left: calc(50vw - 2.5ch);" +
    "      }" +
    "    }" +
    "    @keyframes move_from_center {" +
    "      0% {" +
    "        position: fixed;" +
    "        top: calc(50vh - 2.5ch);" +
    "        left: calc(50vw - 2.5ch);" +
    "      }" +
    "      100% {" +
    "        position: fixed;" +
    "      }" +
    "    }" +
    "    " +
    "    @keyframes morph {" +
    "      0% {" +
    "        color: transparent;" +
    "        clip-path: circle(75%);" +
    "      }" +
    "      50% {" +
    "        clip-path: circle(25%);" +
    "        width: 7ch;" +
    "        height: 7ch;" +
    "      }" +
    "      90% {" +
    "        /* defer showing text: */" +
    "        color: transparent;" +
    "      }" +
    "      100% {" +
    "        clip-path: circle(75%);" +
    "        width: 100vw;" +
    "        height: 100vh;" +
    "      }" +
    "    }" +
    "    " +
    "    @keyframes morph_to_fill_screen {" +
    "      0% {" +
    "        color: transparent;" +
    "        clip-path: circle(75%);" +
    "      }" +
    "      50% {" +
    "        clip-path: circle(25%);" +
    "        width: 7ch;" +
    "        height: 7ch;" +
    "        top: calc(50vh - 3.5ch);" +
    "        left: calc(50vw - 3.5ch);" +
    "      }" +
    "      90% {" +
    "        /* defer showing text: */" +
    "        color: transparent;" +
    "        position: fixed;" +
    "      }" +
    "      100% {" +
    "        clip-path: circle(75%);" +
    "        width: 100vw;" +
    "        height: 100vh;" +
    "        top: 0;" +
    "        left: 0;" +
    "      }" +
    "    }" +
    "    " +
    "    @keyframes show_children_after_morph {" +
    "      0% {" +
    "        visibility: collapse;" +
    "        height: 0;" +
    "        display: none;" +
    "      }" +
    "      90% {" +
    "        visibility: collapse;" +
    "        height: 0;" +
    "        display: none;" +
    "      }" +
    "      100% {" +
    "        visibility: visible;" +
    "        height: auto;" +
    "        display: block;" +
    "      }" +
    "    }" +
    "    " +
    "    @keyframes revert_morph {" +
    "      0% {" +
    "        /* copy of 100% of morph: */" +
    "        clip-path: circle(75%);" +
    "        width: 100vw;" +
    "        height: 100vh;" +
    "        color: transparent;" +
    "        top: 0;" +
    "        left: 0;" +
    "      }" +
    "      10% {" +
    "        /* defer showing text: */" +
    "        color: transparent;" +
    "        position: fixed;" +
    "      }" +
    "      50% {" +
    "        clip-path: circle(25%);" +
    "        width: 7ch;" +
    "        height: 7ch;" +
    "        top: calc(50vh - 3.5ch);" +
    "        left: calc(50vw - 3.5ch);" +
    "      }" +
    "    }" +
    "    " +
    "    .collapsed {" +
    "      visibility: collapse;" +
    "    }";

  var styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.className = "morphing_button-style-sheet";
  styleSheet.innerHTML = styles;
  document.head.appendChild(styleSheet);

  return {
    setup: setup,
    morph: morph,
    revert: revert,
  };
})();

window.Morphing_button = Morphing_button;
