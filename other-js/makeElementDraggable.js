function makeElementDraggable(element, settings) {
  var mouseX = 0;
  var mouseY = 0;
  var disableStyleReset = (settings && settings.disableStyleReset) || false;
  element.addEventListener("mousedown", dragOnMouseDown);
  if (!disableStyleReset || typeof disableStyleReset !== "boolean") {
    element.style.marginBlockStart = "initial";
    element.style.position = "absolute";
  }

  function dragOnMouseDown(event) {
    var e = event || window.event;
    e.preventDefault();
    mouseX = e.clientX;
    mouseY = e.clientY;
    document.addEventListener("mouseup", stopDragging);
    document.addEventListener("mousemove", dragElement);
    if (settings && settings.mouseDownCallback) {
      settings.mouseDownCallback(element);
    }
  }

  function dragElement(event) {
    element.focus();
    var e = event || window.event;
    e.preventDefault();
    const xChange = e.clientX - mouseX;
    const yChange = e.clientY - mouseY;
    mouseX = e.clientX;
    mouseY = e.clientY;
    element.style.left = element.offsetLeft + xChange + "px";
    element.style.top = element.offsetTop + yChange + "px";
    if (settings && settings.mouseMoveCallback) {
      settings.mouseMoveCallback(element);
    }
  }

  function stopDragging() {
    document.removeEventListener("mouseup", stopDragging);
    document.removeEventListener("mousemove", dragElement);
    if (settings && settings.mouseUpCallback) {
      settings.mouseUpCallback(element);
    }
  }
}
