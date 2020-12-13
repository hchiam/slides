function announce(message) {
  var ariaAnnouncer = document.getElementById("aria_announcer");
  // editing text will trigger the aria-live setup in html:
  ariaAnnouncer.innerText = message;
}

function announceSlideNumber(slideNumber) {
  announce("Now on slide " + (currentSlideIndex + 1));
}

_2DNote.setAs2DArea(document.documentElement, callbackUponUpdate);

function callbackUponUpdate(e) {
  var tagName = document.activeElement.tagName;
  var isText = tagName === "P";
  var isImage = tagName === "IMG";
  console.log(isText || isImage);
  if (!isText && !isImage) _2DNote.stop();
}
