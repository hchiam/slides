var currentSlide = document.getElementById("current_slide");
var leftButton = document.getElementById("left");
var rightButton = document.getElementById("right");

var isInitializingMemory = true;
useMemory(createTextCallback, createImageCallback);
isInitializingMemory = false;
setUpInitialSlide();
styleLeftRightButtons();
updateSlideNumberInputMax();
setSlideNumber(currentSlideIndex + 1);

var slideNumberTimer = null;
function delayedSetSlideNumber(slideNumber) {
  clearTimeout(slideNumberTimer);
  slideNumberTimer = setTimeout(function () {
    setSlideNumber(slideNumber);
  }, 1000);
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

function detectArrowKeys(event) {
  if (document.activeElement !== document.body) return;
  var key = event.code || event.keyCode || event.which || window.event;
  var isLeft = key === "ArrowLeft" || key === 37;
  var isUp = key === "ArrowUp" || key === 38;
  var isRight = key === "ArrowRight" || key === 39;
  var isDown = key === "ArrowDown" || key === 40;
  if (isLeft || isUp) {
    left();
  } else if (isRight || isDown) {
    right();
  }
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
  leftButton.classList.remove("hide-on-first-load");
}

function styleLeftRightButtons() {
  // left
  var isOnFirstSlide = currentSlideIndex < 1;
  if (isOnFirstSlide) {
    leftButton.setAttribute("disabled", true);
    document
      .getElementById("left")
      .setAttribute("title", "(You're on the first slide)");
  } else {
    leftButton.removeAttribute("disabled");
    leftButton.setAttribute("title", "Previous slide");
  }
  // right
  var isOnLastSlide = currentSlideIndex === memory.slides.length - 1;
  if (isOnLastSlide && !haveContentInSlide(currentSlideIndex)) {
    rightButton.setAttribute("disabled", true);
    document
      .getElementById("right")
      .setAttribute("title", "(You're on the last slide)");
  } else {
    rightButton.removeAttribute("disabled");
    rightButton.setAttribute("title", "Next slide");
  }
}

function updateSlideNumberInputMax() {
  var slideNumberInput = document.getElementById("slide_number");
  slideNumberInput.setAttribute("max", memory.slides.length);
}

var slideNumberTimer;
function focusSlideNumberInput() {
  var slideNumberInput = document.getElementById("slide_number");
  slideNumberInput.focus();
  clearTimeout(slideNumberTimer);
  slideNumberTimer = setTimeout(function () {
    if (document.activeElement === slideNumberInput) slideNumberInput.blur();
  }, 3000);
}

function hideSlide(slideIndex) {
  var textIds = getTextIds(slideIndex);
  textIds.map(function hideText(textId) {
    var element = document.getElementById(textId);
    if (element) element.style.display = "none";
  });
  var imageIds = getImageIds(slideIndex);
  imageIds.map(function hideImage(imageId) {
    var element = document.getElementById(imageId);
    if (element) element.style.display = "none";
  });
}

function showSlide(slideIndex) {
  var textIds = getTextIds(slideIndex);
  textIds.map(function showText(textId) {
    var element = document.getElementById(textId);
    if (element) element.style.display = "block";
  });
  var imageIds = getImageIds(slideIndex);
  imageIds.map(function showImage(imageId) {
    var element = document.getElementById(imageId);
    if (element) element.style.display = "block";
  });
}

function setUpInitialSlide() {
  var currentSlideTexts = getCurrentSlide().texts;
  var haveTextsInMemory = Object.keys(currentSlideTexts).length > 0;
  if (haveTextsInMemory) return;
  createNewText(currentSlide);
}

function clearSlides() {
  document.querySelector("#current_slide").innerHTML = "";
}
