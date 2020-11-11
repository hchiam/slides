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
}

function createNewBigText(
  parentElement = currentSlide,
  text = defaultText.text,
  left = defaultText.left,
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

  parentElement.appendChild(p);
}

function updateTextPosition(htmlElement) {
  var left = htmlElement.offsetLeft;
  var top = htmlElement.offsetTop;
  updateTextPositionInMemory(htmlElement.id, left, top);

  debugMemory();
}

function updateText(htmlElement) {
  var text = htmlElement.innerText;
  htmlElement.innerText = text;
  updateTextInMemory(htmlElement.id, text);
  backgroundColorIfEmptyText(htmlElement);

  var isEmpty = text.trim() === "";
  if (isEmpty) {
    removeTextFromMemory(
      htmlElement.id,
      function callbackOnDelete() {},
      function callbackOnKeep(defaultText) {
        htmlElement.innerText = defaultText;
      }
    );
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
