var enableDebugging = false;

function debugMemory() {
  if (!enableDebugging) return;
  // for debugging:
  var firstTextId = Object.keys(memory.texts)[0];
  var firstText = memory.texts[firstTextId];
  console.log(JSON.stringify(firstText));
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
