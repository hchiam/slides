var currentSlide = document.querySelector("#current_slide");

var isInitializingMemory = true;
useMemory(createTextCallback, createImageCallback);
isInitializingMemory = false;
createSlide();
styleLeftRightButtons();
updateSlideNumberInputMax();
setSlideNumber(currentSlideIndex + 1);

// slide:

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

function createSlide() {
  var currentSlideTexts = getCurrentSlide().texts;
  var haveTextsInMemory = Object.keys(currentSlideTexts).length > 0;
  if (haveTextsInMemory) return;
  createNewText(currentSlide);
}
