var currentSlideIndex = 0;

var idCounter = 0; // for uniqueness only

var memory = {
  slides: [
    {
      texts: {
        // id: { text: "", left: 0, left: 0, slide: 0 },
      },
      images: {
        // id: { file: "", left: 0, left: 0, slide: 0 },
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

function getCurrentSlide() {
  return memory.slides[currentSlideIndex];
}

function addTextToMemory(text, id) {
  if (typeof text === "string") {
    var textObject = new Text(text, id);
    memory.slides[currentSlideIndex].texts[textObject.id] = {
      text: textObject.text,
      left: textObject.left,
      top: textObject.top,
      slide: textObject.slide,
      id: textObject.id,
    };
  } else {
    memory.slides[currentSlideIndex].texts[text.id] = {
      text: text.text,
      left: text.left,
      top: text.top,
      slide: text.slide,
      id: text.id,
    };
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

function updatePersistentMemory(memory) {
  localStorage.slidesMemory = JSON.stringify(memory);
}

function readPersistentMemory() {
  if (localStorage.slidesMemory) {
    return JSON.parse(localStorage.slidesMemory);
  }
  return memory;
}

function useMemory(createTextCallback, createImageCallback) {
  var slides = memory.slides;

  if (!slides.length) return;

  slides.forEach(function (slide) {
    if (Object.keys(slide.texts).length) {
      useTextsFromMemory(slide, createTextCallback);
    }

    if (Object.keys(slide.images).length) {
      useImagesFromMemory(slide, createImageCallback);
    }
  });
}

function useTextsFromMemory(slide, createTextCallback) {
  var textIds = Object.keys(slide.texts);
  textIds.forEach(function (textId) {
    var textObject = slide.texts[textId];
    createTextCallback(textObject);
  });
}

function useImagesFromMemory(slide, createImageCallback) {
  var imageIds = Object.keys(slide.images);
  imageIds.forEach(function (imageId) {
    var imageObject = slide.images[imageId];
    createImageCallback(imageObject);
  });
}
