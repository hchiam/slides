var currentSlideIndex = 0;

var idCounter = 0; // for uniqueness only

var memory = {
  slides: [
    {
      texts: {
        // id: { text: "", left: 0, top: 0, slide: 0, id: "..." },
      },
      images: {
        // id: { file: "", left: 0, top: 0, slide: 0, id: "..." },
      },
    },
  ],
};

var defaultText = {
  text: "Drag to move around. Double-click to edit.",
  left: 100,
  top: 100,
  slide: 0,
};

if (sessionStorage.slidesMemory || localStorage.slidesMemory) {
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
      // id: { text: "", left: 0, top: 0, slide: 0, id: "..." },
    },
    images: {
      // id: { file: "", left: 0, top: 0, slide: 0, id: "..." },
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

function getImageIds(slideIndex) {
  var slides = getSlide(slideIndex);
  if (!slides || !slides.images) return [];
  return Object.keys(slides.images);
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

function removeTextFromMemory(id, callbackOnDelete, callbackOnKeep) {
  var yes = confirm("Do you want to remove this text?");
  if (yes) {
    delete memory.slides[currentSlideIndex].texts[id];
    updatePersistentMemory(memory);
    if (callbackOnDelete) callbackOnDelete();
  } else {
    memory.slides[currentSlideIndex].texts[id] = defaultText.text;
    updatePersistentMemory(memory);
    if (callbackOnKeep) callbackOnKeep(defaultText.text);
  }
}

function updateTextPositionInMemory(textId, left, top) {
  memory.slides[currentSlideIndex].texts[textId].left = left;
  memory.slides[currentSlideIndex].texts[textId].top = top;
  updatePersistentMemory(memory);
}

function updateImagePositionInMemory(imageId, left, top) {
  memory.slides[currentSlideIndex].images[imageId].left = left;
  memory.slides[currentSlideIndex].images[imageId].top = top;
  updatePersistentMemory(memory);
}

function updateTextInMemory(textId, text) {
  memory.slides[currentSlideIndex].texts[textId].text = text;
  updatePersistentMemory(memory);
}

function updatePersistentMemory(memoryObject) {
  if (sessionStorage.slidesMemory) {
    sessionStorage.slidesMemory = JSON.stringify(memoryObject || memory);
  } else {
    localStorage.slidesMemory = JSON.stringify(memoryObject || memory);
  }
}

function readPersistentMemory() {
  if (sessionStorage.slidesMemory) {
    return JSON.parse(sessionStorage.slidesMemory);
  } else if (localStorage.slidesMemory) {
    return JSON.parse(localStorage.slidesMemory);
  }
  return memory;
}

function useMemory(createTextCallback, createImageCallback) {
  if (isSavedFile()) memory = readPersistentMemory();
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

function addImageToMemory(image, id) {
  if (typeof image === "string") {
    var src = image;
    var imageObject = new Image(src, id);
    memory.slides[currentSlideIndex].images[imageObject.id] = {
      file: imageObject.file,
      left: imageObject.left,
      top: imageObject.top,
      slide: imageObject.slide,
      id: imageObject.id,
    };
  } else {
    memory.slides[currentSlideIndex].images[image.id] = {
      file: image.file,
      left: image.left,
      top: image.top,
      slide: image.slide,
      id: image.id,
    };
  }
  updatePersistentMemory(memory);
}

function removeImageFromMemory(id, callback) {
  var yes = confirm("Do you want to remove this image?");
  if (!yes) return;
  delete memory.slides[currentSlideIndex].images[id];
  updatePersistentMemory(memory);
  if (callback) callback();
}

function markAsSavedFile() {
  document.body.setAttribute("saved", true);
}

function isSavedFile() {
  return document.body.getAttribute("saved");
}

function recreateSlidesFromMemory() {
  if (!isSavedFile()) return;
  sessionStorage.slidesMemory = JSON.stringify({});
  var existingTexts = document.body.querySelectorAll("p");
  existingTexts.forEach(function (existingText) {
    var text = existingText.text;
    var left = existingText.style.left;
    var top = existingText.style.top;
    var slide = existingText.getAttribute("data-slide");
    var id = existingText.id;
    var alreadyHaveSlide = memory.slides[slide];
    if (!alreadyHaveSlide) {
      memory.slides[slide] = { texts: {}, images: {} };
    }
    memory.slides[slide].texts[id] = {
      text: text,
      left: left,
      top: top,
      slide: slide,
      id: id,
    };
  });
  var existingImages = document.body.querySelectorAll("img");
  existingImages.forEach(function (existingImage) {
    var src = existingImage.src;
    var left = existingImage.style.left;
    var top = existingImage.style.top;
    var slide = existingImage.getAttribute("data-slide");
    var id = existingImage.id;
    var alreadyHaveSlide = memory.slides[slide];
    if (!alreadyHaveSlide) {
      memory.slides[slide] = { texts: {}, images: {} };
    }
    memory.slides[slide].images[id] = {
      file: src,
      left: left,
      top: top,
      slide: slide,
      id: id,
    };
  });
  updatePersistentMemory(memory);
}

function save() {
  markAsSavedFile();
  var script = document.getElementById("save_memory_script");
  script.innerText =
    "sessionStorage.slidesMemory = JSON.stringify(" +
    JSON.stringify(readPersistentMemory()) +
    ")";
  document.getElementById("current_slide").innerHTML = "";

  // TODO: trigger save page dialog

  // TODO: reload this page so you can continue editing
}
