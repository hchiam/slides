function recreateText(parentElement = currentSlide, textId, slideIndex) {
  var textObject = getSlide(slideIndex).texts[textId];
  var text = textObject.text;
  var left = textObject.left;
  var top = textObject.top;
  var id = textObject.id;
  var textProps = textObject.textProps;
  createText(parentElement, text, left, top, id, slideIndex, textProps);
}

function createNewText(
  parentElement = currentSlide,
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
  styleLeftRightButtons();
  announce("Added new text."); // TODO: not working
}

function createNewBigText(
  parentElement = currentSlide,
  text = defaultText.text,
  left = defaultText.left - (743 - 372) / 2, // 743 vs 372
  top = defaultText.top
) {
  var textProps = { fontSize: "2rem" };
  createNewText(parentElement, text, left, top, textProps);
}

function createText(
  parentElement = currentSlide,
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
  }
  makeElementDraggableAndEditable(p, {
    mouseMoveCallback: updateTextPosition,
    blurCallback: updateText,
  });

  p.onpaste = function handlePaste(e) {
    // prevent actually pasting HTML:
    e.stopPropagation();
    e.preventDefault();

    var clipboardData = e.clipboardData || window.clipboardData;
    var pastedText = clipboardData.getData("Text");
    p.innerText = pastedText;
  };

  p.addEventListener("keyup", function (event) {
    var key = event.code || event.keyCode || event.which || window.event;
    var isBackspace = key === "Backspace" || key === 8;
    var isDelete = key === "Delete" || key === 46;
    if (isBackspace || isDelete) {
      var yes = confirm(
        "Do you want to delete this text? It starts with: " +
          getStartOfTextStringForA11y(p.innerText)
      );
      if (!yes) return;
      removeTextFromMemory(p.id, function () {
        p.remove();
      });
    } else {
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
  recreateText(currentSlide, textObject.id, slideIndex);
}
