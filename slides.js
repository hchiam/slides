var currentSlide = document.querySelector("#current_slide");

useMemory(createTextCallback, createImageCallback);
createSlide();

function left() {}

function right() {}

function createSlide() {
  var currentSlideTexts = getCurrentSlide().texts;
  var haveTextsInMemory = Object.keys(currentSlideTexts).length;
  if (haveTextsInMemory) return;
  createNewText(currentSlide);
}

function recreateText(parentElement = currentSlide, textId) {
  var textObject = getCurrentSlide().texts[textId];
  var text = textObject.text;
  var left = textObject.left;
  var top = textObject.top;
  var id = textObject.id;
  createText(parentElement, text, left, top, id);
}

function createNewText(
  parentElement = currentSlide,
  text = defaultText.text,
  left = defaultText.left,
  top = defaultText.top
) {
  if (alreadyHasDefaultText()) return;
  var textObject = new Text(text);
  textObject.left = left;
  textObject.top = top;
  addTextToMemory(textObject);
  createText(parentElement, textObject.text, left, top, textObject.id);
}

function createText(
  parentElement = currentSlide,
  text = defaultText.text,
  left = defaultText.left,
  top = defaultText.top,
  id
) {
  var p = document.createElement("p");
  p.innerText = text;
  p.style.left = left + "px";
  p.style.top = top + "px";
  p.id = id;
  p.style.boxShadow = "none";
  p.style.background = "transparent";
  makeElementDraggableAndEditable(p, {
    mouseMoveCallback: updateTextPosition,
    blurCallback: updateText,
  });

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
  updateTextInMemory(htmlElement.id, text);
  backgroundColorIfEmptyText(htmlElement);

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

function createTextCallback(textObject) {
  recreateText(currentSlide, textObject.id);
}

// TODO: image versions of the text functions above

function createImageCallback(imageObject) {}
