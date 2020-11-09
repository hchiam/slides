var currentSlide = document.querySelector("#current_slide");

useMemory(createTextCallback, createImageCallback);
createSlide();
styleLeftRightButtons();
updateSlideNumberInputMax();
setSlideNumber(currentSlideIndex + 1);

var slideNumberTimer = null;
function delayedSetSlideNumber(slideNumber) {
  clearTimeout(slideNumberTimer);
  slideNumberTimer = setTimeout(function () {
    setSlideNumber(slideNumber);
  }, 2000);
}

function setSlideNumber(slideNumber) {
  var slideIndex = slideNumber - 1;
  var slideNumberInput = document.getElementById("slide_number");
  slideNumberInput.value = slideNumber;
  var isValidSlideNumber =
    0 < slideNumber && slideNumber < memory.slides.length + 1;
  if (!isValidSlideNumber) {
    slideNumberInput.value = currentSlideIndex + 1;
    return;
  }
  hideSlide(currentSlideIndex);
  currentSlideIndex = slideIndex;
  showSlide(currentSlideIndex);
  styleLeftRightButtons();
  // style slide number input:
  slideNumberInput.style.width = slideNumberInput.value.length + 5 + "ch";
}

function left() {
  if (currentSlideIndex === 0) return;
  hideSlide(currentSlideIndex);
  currentSlideIndex--;
  showSlide(currentSlideIndex);
  styleLeftRightButtons();
  setSlideNumber(currentSlideIndex + 1);
}

function right() {
  if (!haveContentInSlide(currentSlideIndex)) return;
  hideSlide(currentSlideIndex);
  currentSlideIndex++;
  if (currentSlideIndex >= memory.slides.length) {
    createSlideInMemory();
    updateSlideNumberInputMax();
  }
  showSlide(currentSlideIndex);
  styleLeftRightButtons();
  setSlideNumber(currentSlideIndex + 1);
}

function styleLeftRightButtons() {
  // left
  var isOnFirstSlide = currentSlideIndex > 0;
  if (isOnFirstSlide) {
    document.getElementById("left").removeAttribute("disabled");
    document.getElementById("left").setAttribute("title", "Previous slide");
  } else {
    document.getElementById("left").setAttribute("disabled", true);
    document
      .getElementById("left")
      .setAttribute("title", "(You're on the first slide)");
  }
  // right
  var isOnLastSlide = currentSlideIndex === memory.slides.length - 1;
  if (isOnLastSlide && !haveContentInSlide(currentSlideIndex)) {
    document.getElementById("right").setAttribute("disabled", true);
    document
      .getElementById("right")
      .setAttribute("title", "(You're on the last slide)");
  } else {
    document.getElementById("right").removeAttribute("disabled");
    document.getElementById("right").setAttribute("title", "Next slide");
  }
}

function updateSlideNumberInputMax() {
  var slideNumberInput = document.getElementById("slide_number");
  slideNumberInput.setAttribute("max", memory.slides.length);
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
  if (textProperties) {
    if (textProperties.fontSize) {
      p.style.fontSize = textProperties.fontSize;
    }
  }
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
  htmlElement.innerText = text;
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
