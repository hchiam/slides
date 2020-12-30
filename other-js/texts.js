function recreateText(parentElement = Slides.currentSlide, textId, slideIndex) {
  var textObject = getSlide(slideIndex).texts[textId];
  var text = textObject.text;
  var left = textObject.left * getScaleForOriginalScreenSize(memory);
  var top = textObject.top * getScaleForOriginalScreenSize(memory);
  var id = textObject.id;
  var textProps = textObject.textProps;
  createText(parentElement, text, left, top, id, slideIndex, textProps);
}

function createNewText(
  parentElement = Slides.currentSlide,
  text = defaultText.text,
  left = defaultText.left,
  top = defaultText.top,
  textProps
) {
  if (alreadyHasDefaultText()) return;
  var textObject = new Text(text);
  textObject.left = left;
  textObject.top = top;
  textObject.slide = currentSlideIndex;
  var id = textObject.id;
  addTextToMemory(textObject, id, textProps);
  createText(parentElement, text, left, top, id, currentSlideIndex, textProps);
  Slides.styleLeftRightButtons();
  announce("Added new text."); // TODO: not working
}

function createNewBigText(
  parentElement = Slides.currentSlide,
  text = defaultText.text,
  left = defaultText.left + defaultTextWidth / 2 - defaultTextWidthBig / 2,
  top = defaultText.top + defaultTextHeight / 2 - defaultTextHeightBig / 2
) {
  var fontSizeBig = defaultText.fontSize.replace("px", "") * goldenRatio;
  var textProps = { fontSize: fontSizeBig + "px" };
  createNewText(parentElement, text, left, top, textProps);
}

function createText(
  parentElement = Slides.currentSlide,
  text = defaultText.text,
  left = defaultText.left,
  top = defaultText.top,
  id,
  slideIndex = currentSlideIndex,
  textProperties
) {
  var p = document.createElement("p");
  p.innerText = text;
  p.style.left = left + "px";
  p.style.top = top + "px";
  p.id = id;
  p.style.boxShadow = "none";
  p.style.background = "transparent";

  p.style.display = currentSlideIndex === slideIndex ? "block" : "none";
  p.tabIndex = 0;
  p.ariaLabel = getAriaLabelFromTextElement(p);
  p.role = "textbox";

  p.setAttribute("data-slide", slideIndex);

  if (textProperties) {
    if (textProperties.fontSize) {
      p.style.fontSize = textProperties.fontSize;
    }
  } else {
    p.style.fontSize = defaultText.fontSize; // fallback size (if not in memory)
  }

  makeElementDraggableAndEditable(p, {
    mouseMoveCallback: updateTextPosition,
    blurCallback: updateText,
    snapPoints: [
      { x: window.innerWidth / 2, y: window.innerHeight / 10 },
      { x: window.innerWidth / 2, y: window.innerHeight / 2 },
    ],
    snapCallback: function (left, top) {
      updateTextPosition(p);
    },
  });

  p.onpaste = function handlePaste(e) {
    // prevent actually pasting HTML:
    e.stopPropagation();
    e.preventDefault();

    var clipboardData = e.clipboardData || window.clipboardData;
    var pastedText = clipboardData.getData("text/plain");
    if (document.execCommand) {
      document.execCommand("insertHTML", false, pastedText);
    } else {
      // at least do something:
      p.innerText = pastedText;
    }
  };

  p.addEventListener("keyup", function (event) {
    var key = event.code || event.keyCode || event.which || window.event;
    var isBackspace = key === "Backspace" || key === 8;
    var isDelete = key === "Delete" || key === 46;
    if ((isBackspace || isDelete) && p.contentEditable !== "true") {
      var yes = confirm(
        "Do you want to delete this text? It starts with: " +
          getStartOfTextStringForA11y(p.innerText)
      );
      if (!yes) return;
      removeTextFromMemory(p.id, function () {
        p.remove();
      });
    } else {
      p.contentEditable = true;
      runTextPluginsWhenTextUpdated(p);
    }
  });

  parentElement.appendChild(p);
}

function getAriaLabelFromTextElement(textElement) {
  var startOfTextString = getStartOfTextStringForA11y(textElement.innerText);
  var output = startOfTextString
    ? 'Text starting with: "' + startOfTextString
    : "(empty text)";
  output +=
    '" at ' +
    textElement.style.left +
    " left and " +
    textElement.style.top +
    " top";
  return output;
}

function getStartOfTextStringForA11y(text) {
  // for quick text preview/reminder
  var textString = typeof text === "string" ? text : text.text;
  if (textString.length <= 20) return textString;
  var positionOfLastSpace = textString.slice(0, 20).lastIndexOf(" ");
  return textString.slice(0, positionOfLastSpace);
}

function updateTextPosition(htmlElement) {
  var left = htmlElement.offsetLeft;
  var top = htmlElement.offsetTop;
  updateTextPositionInMemory(htmlElement.id, left, top);
  htmlElement.ariaLabel = getAriaLabelFromTextElement(htmlElement);

  debugMemory();
}

function updateText(htmlElement) {
  var text = htmlElement.innerText;
  htmlElement.innerText = text;
  updateTextInMemory(htmlElement.id, text);
  htmlElement.ariaLabel = getAriaLabelFromTextElement(htmlElement);
  backgroundColorIfEmptyText(htmlElement);

  var isEmpty = text.trim() === "";
  if (isEmpty) {
    removeTextFromMemory(htmlElement.id);
    htmlElement.remove();
  }

  debugMemory();
}

function backgroundColorIfEmptyText(htmlElement) {
  if (!htmlElement.innerText) {
    htmlElement.style.background = "black";
  } else {
    htmlElement.style.background = "transparent";
  }
}

function alreadyHasDefaultText() {
  var textsInMemory = getCurrentSlide().texts;
  var textIds = Object.keys(getCurrentSlide().texts);
  var found = false;
  textIds.forEach(function (textId) {
    var text = textsInMemory[textId];
    if (
      text.text === defaultText.text &&
      text.left === defaultText.left &&
      text.top === defaultText.top
    ) {
      found = true;
      return;
    }
  });
  return found;
}

function createTextCallback(textObject, slideIndex) {
  recreateText(Slides.currentSlide, textObject.id, slideIndex);
}
