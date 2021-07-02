var enableDebugging = true;

function debugMemory() {
  if (!enableDebugging) return;
  console.log(
    JSON.stringify(memory, null, 2),
    "and memory.slides.length: ",
    memory.slides.length
  );
}

function getEventsOnElement(selector) {
  var haveJQuery = typeof jQuery !== "undefined";
  if (haveJQuery) {
    var element = $(selector);
    if (element) {
      var eventsObject = $._data(element[0], "events"); // this line requires jQuery
      if (!eventsObject) return;
      console.log("vvv click to expand vvv");
      Object.keys(eventsObject).forEach(function (eventName) {
        console.groupCollapsed(
          "%cEvent:%c " + eventName,
          "color: lime; background: black;",
          ""
        );
        var subscribedEvents = eventsObject[eventName];
        subscribedEvents.forEach(function (event) {
          console.log(event.handler.toString());
        });
        console.groupEnd();
      });
    }
  }
}

console.log(
  "Found a bug? Feel free to report suggestions here: https://github.com/hchiam/slides/issues"
);

window.enableDebugging = enableDebugging;
window.debugMemory = debugMemory;
window.getEventsOnElement = getEventsOnElement;
