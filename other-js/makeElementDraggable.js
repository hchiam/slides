function makeElementDraggable(element, settings) {
  var mouseX = 0;
  var mouseY = 0;
  var disableStyleReset = (settings && settings.disableStyleReset) || false;
  var snapPoints = (settings && settings.snapPoints) || []; // [ {x,y}, ... ]
  element.addEventListener("mousedown", setupOnMouseDown);
  element.addEventListener("touchstart", setupOnTouchStart, { passive: true });
  if (!disableStyleReset || typeof disableStyleReset !== "boolean") {
    element.style.marginBlockStart = "initial";
    element.style.position = "absolute";
  }

  function setupOnMouseDown(event) {
    var e = event || window.event;
    // e.preventDefault();
    mouseX = e.clientX || (e.touches && e.touches.length && e.touches[0].pageX);
    mouseY = e.clientY || (e.touches && e.touches.length && e.touches[0].pageY);
    document.addEventListener("mouseup", stopDraggingOnMouseUp);
    document.addEventListener("mousemove", dragOnMouseMove);
    if (settings && settings.mouseDownCallback) {
      settings.mouseDownCallback(element);
    }
  }
  function setupOnTouchStart(event) {
    var e = event || window.event;
    // e.preventDefault();
    mouseX = e.clientX || (e.touches && e.touches.length && e.touches[0].pageX);
    mouseY = e.clientY || (e.touches && e.touches.length && e.touches[0].pageY);
    document.addEventListener("touchend", stopDraggingOnTouchEnd);
    document.addEventListener("touchmove", dragOnTouchMove);
    if (settings && settings.touchStartCallback) {
      settings.touchStartCallback(element);
    }
  }

  function dragOnMouseMove(event) {
    drag(event);
    if (settings && settings.mouseMoveCallback) {
      settings.mouseMoveCallback(element);
    }
  }

  function dragOnTouchMove(event) {
    drag(event);
    if (settings && settings.touchMoveCallback) {
      settings.touchMoveCallback(element);
    }
  }

  function drag(event) {
    element.focus();
    var e = event || window.event;
    e.preventDefault();
    const xChange =
      e.clientX - mouseX ||
      (e.touches && e.touches.length && e.touches[0].pageX - mouseX);
    const yChange =
      e.clientY - mouseY ||
      (e.touches && e.touches.length && e.touches[0].pageY - mouseY);
    mouseX = e.clientX || (e.touches && e.touches.length && e.touches[0].pageX);
    mouseY = e.clientY || (e.touches && e.touches.length && e.touches[0].pageY);
    element.style.left = element.offsetLeft + xChange + "px";
    element.style.top = element.offsetTop + yChange + "px";
  }

  function stopDraggingOnMouseUp() {
    document.removeEventListener("mouseup", stopDraggingOnMouseUp);
    document.removeEventListener("mousemove", dragOnMouseMove);
    snap(element);
    if (settings && settings.mouseUpCallback) {
      settings.mouseUpCallback(element);
    }
  }

  function stopDraggingOnTouchEnd() {
    document.removeEventListener("touchend", stopDraggingOnTouchEnd);
    document.removeEventListener("touchmove", dragOnTouchMove);
    snap(element);
    if (settings && settings.touchEndCallback) {
      settings.touchEndCallback(element);
    }
  }

  var snapTimer;
  function snap(element) {
    var left = element.offsetLeft;
    var top = element.offsetTop;
    var width = element.offsetWidth;
    var height = element.offsetHeight;
    var middleLeft = left + width / 2;
    var middleTop = top + height / 2;

    var shouldRunSnapCallback = false;

    if (settings && settings.snapGridSize) {
      var threshold = settings.snapGridSize;
      var newLeft = snapToGrid(middleLeft, threshold) - width / 2;
      var newTop = snapToGrid(middleTop, threshold) - height / 2;
      element.style.left = newLeft + "px";
      element.style.top = newTop + "px";
      shouldRunSnapCallback = true;
    }

    if (snapPoints && snapPoints.length) {
      var threshold = 50;
      clearTimeout(snapTimer);
      snapPoints.some(function (snapPoint) {
        if (isSnapPointInRange(snapPoint, middleLeft, middleTop, threshold)) {
          var newLeft = snapPoint.x - width / 2;
          var newTop = snapPoint.y - height / 2;
          element.style.left = newLeft + "px";
          element.style.top = newTop + "px";
          shouldRunSnapCallback = true;
          snapTimer = setTimeout(function () {
            return true; // exit Array.some()
          }, 100);
        }
      });
    }

    if (shouldRunSnapCallback && settings && settings.snapCallback) {
      settings.snapCallback(element.style.left, element.style.top);
    }
  }

  function snapToGrid(value, gridSize = 25) {
    var newValue = gridSize * Math.floor(value / gridSize);
    return newValue;
  }

  function isSnapPointInRange(snapPoint, left, top, threshold = 50) {
    var a = snapPoint.x - left;
    var b = snapPoint.y - top;
    var c = Math.sqrt(a * a + b * b);
    return c <= threshold;
  }
}
