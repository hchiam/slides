var currentSlideIndex = 0;

var idCounter = 0; // for uniqueness only

var memory = {
  slides: [
    {
      texts: {
        // id: { text: "", left: 0, top: 0, slide: 0 },
      },
      images: {
        // id: { file: "", left: 0, top: 0, slide: 0 },
      },
    },
  ],
};

var defaultText = {
  text: "Double-click to edit",
  left: 100,
  top: 100,
  slide: 0,
};

if (localStorage.slidesMemory) {
  memory = readPersistentMemory();
} else {
  updatePersistentMemory(memory);
}

function Text(text = "", id) {
  this.text = text || defaultText.text;
  this.left = defaultText.left;
  this.top = defaultText.top;
  this.slide = defaultText.slide;
  this.id = id || generateId();
}

function Image(file = "", id) {
  this.file = file;
  this.left = 0;
  this.top = 0;
  this.slide = defaultText.slide;
  this.id = id || generateId();
}

function generateId() {
  var currentDate = new Date();
  var timeNow = currentDate.getTime(); // milliseconds
  idCounter++; // to guarantee uniqueness
  return idCounter + "_" + timeNow;
}

function createSlideInMemory(createSlideCallback) {
  memory.slides.push({
    texts: {
      // id: { text: "", left: 0, left: 0, slide: 0 },
    },
    images: {
      // id: { file: "", left: 0, left: 0, slide: 0 },
    },
  });
  updatePersistentMemory(memory);
  if (createSlideCallback) createSlideCallback();
}

function getCurrentSlide() {
  return memory.slides[currentSlideIndex];
}

function getSlide(slideIndex) {
  return memory.slides[slideIndex];
}

function getTextIds(slideIndex) {
  var slides = getSlide(slideIndex);
  if (!slides || !slides.texts) return [];
  return Object.keys(slides.texts);
}

function haveContentInSlide(slideIndex) {
  var slide = getSlide(slideIndex);
  return (
    Object.keys(slide.texts).length > 0 || Object.keys(slide.images).length > 0
  );
}

function addTextToMemory(text, id, textProps) {
  var textId = "";
  if (typeof text === "string") {
    var textObject = new Text(text, id);
    textId = textObject.id;
    memory.slides[currentSlideIndex].texts[textObject.id] = {
      text: textObject.text,
      left: textObject.left,
      top: textObject.top,
      slide: textObject.slide,
      id: textObject.id,
    };
  } else {
    textId = text.id;
    memory.slides[currentSlideIndex].texts[text.id] = {
      text: text.text,
      left: text.left,
      top: text.top,
      slide: text.slide,
      id: text.id,
    };
  }
  if (textProps) {
    memory.slides[currentSlideIndex].texts[textId].textProps = textProps;
  }
  updatePersistentMemory(memory);
}

function updateTextPositionInMemory(textId, left, top) {
  memory.slides[currentSlideIndex].texts[textId].left = left;
  memory.slides[currentSlideIndex].texts[textId].top = top;
  updatePersistentMemory(memory);
}

function updateTextInMemory(textId, text) {
  memory.slides[currentSlideIndex].texts[textId].text = text;
  updatePersistentMemory(memory);
}

function updatePersistentMemory(memoryObject) {
  localStorage.slidesMemory = JSON.stringify(memoryObject || memory);
}

function readPersistentMemory() {
  if (localStorage.slidesMemory) {
    return JSON.parse(localStorage.slidesMemory);
  }
  return memory;
}

function useMemory(createTextCallback, createImageCallback) {
  var slides = memory.slides;

  if (slides.length === 0) return;

  slides.forEach(function (slide, slideIndex) {
    if (Object.keys(slide.texts).length > 0) {
      useTextsFromMemory(slide, slideIndex, createTextCallback);
    }

    if (Object.keys(slide.images).length > 0) {
      useImagesFromMemory(slide, slideIndex, createImageCallback);
    }
  });
}

function useTextsFromMemory(slide, slideIndex, createTextCallback) {
  var textIds = Object.keys(slide.texts);
  textIds.forEach(function (textId) {
    var textObject = slide.texts[textId];
    createTextCallback(textObject, slideIndex);
  });
}

function useImagesFromMemory(slide, slideIndex, createImageCallback) {
  var imageIds = Object.keys(slide.images);
  imageIds.forEach(function (imageId) {
    var imageObject = slide.images[imageId];
    createImageCallback(imageObject, slideIndex);
  });
}
