function announce(message) {
  var ariaAnnouncer = document.getElementById("aria_announcer");
  // editing text will trigger the aria-live setup in html:
  ariaAnnouncer.innerText = message;
}

function announceSlideNumber(slideNumber) {
  announce("Now on slide " + (currentSlideIndex + 1));
}

document.addEventListener("mousedown", function (event) {
  var element = event.target;
  if (element.tagName == "P" || element.tagName == "IMG") {
    _2DNote.play(element, false);
  }
});

document.addEventListener("mouseup", function (event) {
  var element = event.target;
  if (element.tagName == "P" || element.tagName == "IMG") {
    _2DNote.stop(element);
  }
});

var timerToPreventAccidentalForeverNote;
document.addEventListener("mousemove", function (event) {
  var element = event.target;
  if (element.tagName == "P" || element.tagName == "IMG") {
    clearTimeout(timerToPreventAccidentalForeverNote);
    _2DNote.update(element);
    timerToPreventAccidentalForeverNote = setTimeout(function () {
      _2DNote.stop(element);
    }, 500);
  }
});
