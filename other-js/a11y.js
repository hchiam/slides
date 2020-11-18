function announce(message) {
  var ariaAnnouncer = document.getElementById("aria_announcer");
  // editing text will trigger the aria-live setup in html:
  ariaAnnouncer.innerText = message;
}

function announceSlideNumber(slideNumber) {
  announce("Now on slide " + (currentSlideIndex + 1));
}
