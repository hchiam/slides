var Slides = {
  currentSlide: document.getElementById("current_slide"),
  leftButton: document.getElementById("left"),
  rightButton: document.getElementById("right"),
  isInitializingMemory: true,
  slideNumberTimer: null,

  initialize: function () {
    if (
      typeof localforage !== "undefined" ||
      sessionStorage.slidesMemory ||
      localStorage.slidesMemory
    ) {
      Memory.readPersistentMemory(Memory.recreateSlidesFromMemory.bind(Memory));
    } else {
      Memory.updatePersistentMemory(memory).bind(Memory);
    }
    this.setUpSlides();
    this.isInitializingMemory = false;
    document.body.addEventListener("keyup", this.detectArrowKeys.bind(this));
  },

  delayedSetSlideNumber: function (slideNumber) {
    clearTimeout(this.slideNumberTimer);
    this.slideNumberTimer = setTimeout(function () {
      Slides.setSlideNumber(slideNumber);
    }, 1000);
  },

  setUpSlides: function () {
    if (Memory.areAllSlidesBlankInMemory()) {
      this.setUpInitialSlide();
    }
    this.styleLeftRightButtons();
    this.updateSlideNumberInputMax();
    this.setSlideNumber(Memory.currentSlideIndex + 1);
  },

  setSlideNumber: function (slideNumber) {
    var slideIndex = slideNumber - 1;
    var slideNumberInput = document.getElementById("slide_number");
    slideNumberInput.value = slideNumber;
    if (slideIndex === memory.slides.length && !this.isLastSlideBlank()) {
      Memory.createSlideInMemory();
      this.updateSlideNumberInputMax();
      this.leftButton.classList.remove("hide-on-first-load");
    }
    var isValidSlideNumber =
      0 < slideNumber && slideNumber < memory.slides.length + 1;
    if (!isValidSlideNumber) {
      slideNumberInput.value = Memory.currentSlideIndex + 1;
      return;
    }
    if (slideIndex > 0) {
      this.leftButton.classList.remove("hide-on-first-load");
    }
    this.hideSlide(Memory.currentSlideIndex);
    Memory.currentSlideIndex = slideIndex;
    this.showSlide(Memory.currentSlideIndex);
    A11y.announceSlideNumber(Memory.currentSlideIndex + 1);
    this.styleLeftRightButtons();
    // style slide number input:
    slideNumberInput.style.width = slideNumberInput.value.length + 5 + "ch";
  },

  detectArrowKeys: function (event) {
    var isOnBody = document.activeElement === document.body;
    var isOnButton = document.activeElement.tagName === "BUTTON";
    if (!isOnBody && !isOnButton) return;
    var key = event.code || event.keyCode || event.which || window.event;
    var isLeft = key === "ArrowLeft" || key === 37;
    var isUp = key === "ArrowUp" || key === 38;
    var isRight = key === "ArrowRight" || key === 39;
    var isDown = key === "ArrowDown" || key === 40;
    if (isLeft || isUp) {
      this.left();
    } else if (isRight || isDown) {
      this.right();
    }
  },

  left: function () {
    if (Memory.currentSlideIndex === 0) return;
    this.hideSlide(Memory.currentSlideIndex);
    Memory.currentSlideIndex--;
    this.showSlide(Memory.currentSlideIndex);
    this.styleLeftRightButtons();
    this.setSlideNumber(Memory.currentSlideIndex + 1);
    A11y.announceSlideNumber(Memory.currentSlideIndex + 1);
  },

  right: function () {
    if (!Memory.haveContentInSlide(Memory.currentSlideIndex)) return;
    this.hideSlide(Memory.currentSlideIndex);
    Memory.currentSlideIndex++;
    if (Memory.currentSlideIndex >= memory.slides.length) {
      Memory.createSlideInMemory();
      this.updateSlideNumberInputMax();
    }
    this.showSlide(Memory.currentSlideIndex);
    this.styleLeftRightButtons();
    this.setSlideNumber(Memory.currentSlideIndex + 1);
    this.leftButton.classList.remove("hide-on-first-load");
    A11y.announceSlideNumber(Memory.currentSlideIndex + 1);
  },

  styleLeftRightButtons: function () {
    // left
    var isOnFirstSlide = Memory.currentSlideIndex < 1;
    if (isOnFirstSlide) {
      this.leftButton.setAttribute("disabled", true);
      this.leftButton.nextElementSibling.setAttribute(
        "data-before",
        "(You're on the first slide)"
      );
      this.leftButton.nextElementSibling.style.setProperty("--left", "-7.1em");
    } else {
      this.leftButton.removeAttribute("disabled");
      this.leftButton.nextElementSibling.setAttribute(
        "data-before",
        "Previous slide"
      );
      this.leftButton.nextElementSibling.style.setProperty("--left", "-5em");
    }
    // right
    var isOnLastSlide = Memory.currentSlideIndex === memory.slides.length - 1;
    if (isOnLastSlide && !Memory.haveContentInSlide(Memory.currentSlideIndex)) {
      this.rightButton.setAttribute("disabled", true);
      this.rightButton.nextElementSibling.setAttribute(
        "data-before",
        "(You're on the last slide)"
      );
      this.rightButton.nextElementSibling.style.setProperty("--left", "-7.2em");
    } else {
      this.rightButton.removeAttribute("disabled");
      this.rightButton.nextElementSibling.setAttribute(
        "data-before",
        "Next slide"
      );
      this.rightButton.nextElementSibling.style.setProperty("--left", "-4.2em");
    }
  },

  updateSlideNumberInputMax: function () {
    var slideNumberInput = document.getElementById("slide_number");
    var maxEnablingAddingNewSlide = memory.slides.length + 1;
    slideNumberInput.setAttribute("max", maxEnablingAddingNewSlide);
    // elsewhere handle actual (dis)enabling of adding slides
  },

  focusSlideNumberInput: function () {
    var slideNumberInput = document.getElementById("slide_number");
    slideNumberInput.focus();
    clearTimeout(this.slideNumberTimer);
    this.slideNumberTimer = setTimeout(function () {
      if (document.activeElement === slideNumberInput) slideNumberInput.blur();
    }, 3000);
  },

  hideSlide: function (slideIndex) {
    var textIds = Memory.getTextIds(slideIndex);
    textIds.map(function hideText(textId) {
      var element = document.getElementById(textId);
      if (element) element.style.display = "none";
    });
    var imageIds = Memory.getImageIds(slideIndex);
    imageIds.map(function hideImage(imageId) {
      var element = document.getElementById(imageId);
      if (element) element.style.display = "none";
    });
  },

  showSlide: function (slideIndex) {
    var textIds = Memory.getTextIds(slideIndex);
    textIds.map(function showText(textId) {
      var element = document.getElementById(textId);
      if (element) element.style.display = "block";
    });
    var imageIds = Memory.getImageIds(slideIndex);
    imageIds.map(function showImage(imageId) {
      var element = document.getElementById(imageId);
      if (element) element.style.display = "block";
    });
  },

  setUpInitialSlide: function () {
    var currentSlideTexts = Memory.getCurrentSlide().texts;
    var haveTextsInMemory = Object.keys(currentSlideTexts).length > 0;
    if (haveTextsInMemory) return;
    Texts.createNewText(this.currentSlide);
  },

  clearSlides: function () {
    document.querySelector("#current_slide").innerHTML = "";
  },

  isLastSlideBlank: function () {
    var lastIndex = memory.slides.length - 1;
    var numberOfTexts = Object.keys(memory.slides[lastIndex].texts).length;
    var numberOfImages = Object.keys(memory.slides[lastIndex].images).length;
    return numberOfTexts === 0 && numberOfImages === 0;
  },
};

Slides.initialize();
