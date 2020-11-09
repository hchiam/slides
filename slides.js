var currentSlide = document.querySelector("#current_slide");

useMemory(createTextCallback, createImageCallback);
createSlide();

function left() {
  if (currentSlideIndex === 0) return;
  hideSlide(currentSlideIndex);
  currentSlideIndex--;
  showSlide(currentSlideIndex);
}

function right() {
  if (!haveContentInSlide(currentSlideIndex)) return;
  hideSlide(currentSlideIndex);
  currentSlideIndex++;
  if (currentSlideIndex >= memory.slides.length) {
    createSlideInMemory();
  }
  showSlide(currentSlideIndex);
}

function hideSlide(slideIndex) {
  var textIds = getTextIds(slideIndex);
  textIds.map(function hideText(textId) {
    var element = document.getElementById(textId);
    if (element) element.style.display = "none";
  });
}

function showSlide(slideIndex) {
  var textIds = getTextIds(slideIndex);
  textIds.map(function showText(textId) {
    var element = document.getElementById(textId);
    if (element) element.style.display = "block";
  });
}

function createSlide() {
  var currentSlideTexts = getCurrentSlide().texts;
  var haveTextsInMemory = Object.keys(currentSlideTexts).length > 0;
  if (haveTextsInMemory) return;
  createNewText(currentSlide);
}

function recreateText(parentElement = currentSlide, textId, slideIndex) {
  var textObject = getSlide(slideIndex).texts[textId];
  var text = textObject.text;
  var left = textObject.left;
  var top = textObject.top;
  var id = textObject.id;
  createText(parentElement, text, left, top, id, slideIndex);
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
  textObject.slide = currentSlideIndex;
  var id = textObject.id;
  addTextToMemory(textObject);
  createText(parentElement, text, left, top, id, currentSlideIndex);
}

function createText(
  parentElement = currentSlide,
  text = defaultText.text,
  left = defaultText.left,
  top = defaultText.top,
  id,
  slideIndex = currentSlideIndex
) {
  var p = document.createElement("p");
  p.innerText = text;
  p.style.left = left + "px";
  p.style.top = top + "px";
  p.id = id;
  p.style.boxShadow = "none";
  p.style.background = "transparent";
  p.style.display = currentSlideIndex === slideIndex ? "block" : "none";
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

function createTextCallback(textObject, slideIndex) {
  recreateText(currentSlide, textObject.id, slideIndex);
}

// TODO: image versions of the text functions above

function createImageCallback(imageObject, slideIndex) {}
