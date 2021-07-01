window.makeElementDraggableAndEditable = makeElementDraggableAndEditable;

function makeElementDraggableAndEditable(element, settings) {
  element.mouseX = 0;
  element.mouseY = 0;
  element.disableStyleReset = (settings && settings.disableStyleReset) || false;
  element.snapPoints = (settings && settings.snapPoints) || []; // [ {x,y}, ... ]
  element.disableEditing = (settings && settings.disableEditing) || false;
  element.detectAsClickToEdit = false;
  element.startedTyping = false;
  // element.contentEditable = true;
  element.addEventListener("mousedown", setupOnMouseDown, false);
  element.addEventListener("touchstart", setupOnTouchStart, { passive: true });
  element.addEventListener("blur", resetEditableOnBlur, false);
  if (
    !element.disableStyleReset ||
    typeof element.disableStyleReset !== "boolean"
  ) {
    element.style.marginBlockStart = "initial";
    element.style.position = "absolute";
    element.style.minWidth = "1ch";
    element.style.minHeight = "1em";
  }
  setupAriaLabel(element);
  setupKeyboardEvents(element);

  function setupAriaLabel(element) {
    element.setAttribute(
      "aria-label",
      "Draggable and editable. To drag, hit Escape and then hold down Option and hit the arrow keys. To edit, start typing."
    );
  }

  function setupOnMouseDown(event) {
    var e = event || window.event;
    e.preventDefault();
    element.mouseX =
      e.clientX || (e.touches && e.touches.length && e.touches[0].pageX);
    element.mouseY =
      e.clientY || (e.touches && e.touches.length && e.touches[0].pageY);
    document.addEventListener("mouseup", stopDraggingOnMouseUp, false);
    document.addEventListener("mousemove", dragOnMouseMove, false);
    element.contentEditable = false;
    element.detectAsClickToEdit = true && !element.disableEditing; // enable editing when only clicking
    if (settings && settings.mouseDownCallback) {
      settings.mouseDownCallback(element);
    }
  }
  function setupOnTouchStart(event) {
    var e = event || window.event;
    e.preventDefault();
    element.mouseX =
      e.clientX || (e.touches && e.touches.length && e.touches[0].pageX);
    element.mouseY =
      e.clientY || (e.touches && e.touches.length && e.touches[0].pageY);
    document.addEventListener("touchend", stopDraggingOnTouchEnd, false);
    document.addEventListener("touchmove", dragOnTouchMove, false);
    element.contentEditable = false;
    element.detectAsClickToEdit = true && !element.disableEditing; // enable editing when only clicking
    if (settings && settings.touchStartCallback) {
      settings.touchStartCallback(element);
    }
  }

  function dragOnMouseMove(event) {
    drag(event);
    element.detectAsClickToEdit = false; // disabling editing when dragging
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
    var xChange =
      e.clientX - element.mouseX ||
      (e.touches && e.touches.length && e.touches[0].pageX - element.mouseX);
    var yChange =
      e.clientY - element.mouseY ||
      (e.touches && e.touches.length && e.touches[0].pageY - element.mouseY);
    element.mouseX =
      e.clientX || (e.touches && e.touches.length && e.touches[0].pageX);
    element.mouseY =
      e.clientY || (e.touches && e.touches.length && e.touches[0].pageY);
    element.style.left = element.offsetLeft + xChange + "px";
    element.style.top = element.offsetTop + yChange + "px";
  }

  function stopDraggingOnMouseUp() {
    document.removeEventListener("mouseup", stopDraggingOnMouseUp);
    document.removeEventListener("mousemove", dragOnMouseMove);
    if (element.detectAsClickToEdit) {
      element.contentEditable = true; // disabling editing when stopped dragging
      element.focus();
      element.removeEventListener("mousedown", setupOnMouseDown);
    }
    snap(element);
    if (settings && settings.mouseUpCallback) {
      settings.mouseUpCallback(element);
    }
  }

  function stopDraggingOnTouchEnd() {
    document.removeEventListener("touchend", stopDraggingOnTouchEnd);
    document.removeEventListener("touchmove", dragOnTouchMove);
    if (element.detectAsClickToEdit) {
      element.contentEditable = true; // disabling editing when stopped dragging
      element.focus();
      element.removeEventListener("touchstart", setupOnTouchStart);
    }
    snap(element);
    if (settings && settings.touchEndCallback) {
      settings.touchEndCallback(element);
    }
  }

  function resetEditableOnBlur() {
    element.contentEditable = false;
    element.addEventListener("mousedown", setupOnMouseDown, false);
    element.addEventListener("touchstart", setupOnTouchStart, {
      passive: true,
    });
    element.startedTyping = false;
    if (settings && settings.blurCallback) {
      settings.blurCallback(element);
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

    if (element.snapPoints && element.snapPoints.length) {
      var threshold = 50;
      clearTimeout(snapTimer);
      element.snapPoints.some(function (snapPoint) {
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

  function setupKeyboardEvents(element) {
    element.addEventListener(
      "keyup",
      function (event) {
        event.preventDefault();
        var arrowKey = getArrowKey(event);
        if (arrowKey && !element.startedTyping) {
          element.detectAsClickToEdit = false;
          element.contentEditable = false;
          moveWithArrowKeys(element, arrowKey);
        } else if (isEscKey(event)) {
          element.startedTyping = false;
          element.detectAsClickToEdit = false;
          element.contentEditable = false;
        } else if (!isTabKey(event)) {
          if (!element.startedTyping) {
            setCaret(element);
          }
          element.startedTyping = true;
          element.detectAsClickToEdit = true;
          element.contentEditable = true;
          element.focus();
        }
      },
      false
    );
  }

  function setCaret(element) {
    var range = document.createRange();
    range.setStart(element, 0);
    range.collapse(true);

    var selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }

  function moveWithArrowKeys(element, arrowKey) {
    var offsetLeft = element.offsetLeft;
    var offsetTop = element.offsetTop;
    var scrollDelta = 10;
    switch (arrowKey) {
      case "ArrowLeft":
        offsetLeft -= scrollDelta;
        break;
      case "ArrowUp":
        offsetTop -= scrollDelta;
        break;
      case "ArrowRight":
        offsetLeft += scrollDelta;
        break;
      case "ArrowDown":
        offsetTop += scrollDelta;
        break;
      default:
        break;
    }
    element.style.left = offsetLeft + "px";
    element.style.top = offsetTop + "px";
    if (settings && settings.keyboardMoveCallback) {
      settings.keyboardMoveCallback(element);
    }
  }

  function getArrowKey(event) {
    var e = event || window.event;
    var key = e.key || e.code || e.keyCode || e.which;
    switch (key) {
      case "ArrowLeft":
      case "Left":
      case 37:
        return "ArrowLeft";
      case "ArrowUp":
      case "Up":
      case 38:
        return "ArrowUp";
      case "ArrowRight":
      case "Right":
      case 39:
        return "ArrowRight";
      case "ArrowDown":
      case "Down":
      case 40:
        return "ArrowDown";
      default:
        break;
    }
  }

  function isTabKey(event) {
    var e = event || window.event;
    var key = e.key || e.code || e.keyCode || e.which;
    return key === "Tab" || key === 9;
  }

  function isEscKey(event) {
    var e = event || window.event;
    var key = e.key || e.code || e.keyCode || e.which;
    return key === "Escape" || key === "Esc" || key === 27;
  }
}
