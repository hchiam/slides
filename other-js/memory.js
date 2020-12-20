var currentSlideIndex = 0;

var idCounter = 0; // for uniqueness only

var memory = {
  originalScreenSize: {
    width: document.documentElement.clientWidth,
    height: document.documentElement.clientHeight,
  },
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

var defaultTextString = "Drag this to move around. Double-click to edit text.";

var defaultText = {
  text: defaultTextString,
  left: document.documentElement.clientWidth / 2 - 372 / 2,
  top: document.documentElement.clientHeight / 2 - 32,
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

function removeTextFromMemory(id, callbackOnDelete) {
  delete memory.slides[currentSlideIndex].texts[id];
  updatePersistentMemory(memory);
  if (callbackOnDelete) callbackOnDelete();
}

function updateTextPositionInMemory(textId, left, top) {
  if (!memory.slides[currentSlideIndex].texts[textId]) return;
  memory.slides[currentSlideIndex].texts[textId].left = left;
  memory.slides[currentSlideIndex].texts[textId].top = top;
  updatePersistentMemory(memory);
}

function updateImagePositionInMemory(imageId, left, top) {
  if (!memory.slides[currentSlideIndex].images[imageId]) return;
  memory.slides[currentSlideIndex].images[imageId].left = left;
  memory.slides[currentSlideIndex].images[imageId].top = top;
  updatePersistentMemory(memory);
}

function updateTextInMemory(textId, text) {
  if (!memory.slides[currentSlideIndex].texts[textId]) return;
  memory.slides[currentSlideIndex].texts[textId].text = text;
  updatePersistentMemory(memory);
}

function updatePersistentMemory(memoryObject) {
  if (sessionStorage.slidesMemory) {
    sessionStorage.slidesMemory = JSON.stringify(memoryObject || memory);
  } else {
    localStorage.slidesMemory = JSON.stringify(memoryObject || memory);
  }
  memory = memoryObject;

  // // new
  // new localforage.setItem("key", "value").then(function () {
  //   memory = localforage.getItem("key");
  //   console.log(memory);
  // });
}

function readPersistentMemory() {
  if (sessionStorage.slidesMemory) {
    return JSON.parse(sessionStorage.slidesMemory);
  } else if (localStorage.slidesMemory) {
    return JSON.parse(localStorage.slidesMemory);
  }

  // // new
  // localforage.getItem("key").then(function (value) {
  //   console.log(value);
  //   // return memory;
  // });

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

  var scale = getScaleForOriginalScreenSize(memory);
  var elementToScale = document.getElementById("current_slide");
  elementToScale.style.transform = "scale(" + scale + ")";
}

function useTextsFromMemory(slide, slideIndex, createTextCallback) {
  var textIds = Object.keys(slide.texts);
  textIds.forEach(function (textId) {
    var textObject = slide.texts[textId];
    if (createTextCallback) createTextCallback(textObject, slideIndex);
  });
}

function useImagesFromMemory(slide, slideIndex, createImageCallback) {
  var imageIds = Object.keys(slide.images);
  imageIds.forEach(function (imageId) {
    var imageObject = slide.images[imageId];
    if (createImageCallback) createImageCallback(imageObject, slideIndex);
  });
}

function getScaleForOriginalScreenSize(memory) {
  var originalScreenSize = memory.originalScreenSize || {
    width: document.documentElement.clientWidth,
    height: document.documentElement.clientHeight,
  };
  var currentWidth = document.documentElement.clientWidth;
  var currentHeight = document.documentElement.clientHeight;
  var widthRatio = currentWidth / originalScreenSize.width;
  var heightRatio = currentHeight / originalScreenSize.height;
  var minRatio = Math.min(widthRatio, heightRatio);
  return minRatio;
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
  var yes = confirm("Do you want to delete this image?");
  if (!yes) return;
  delete memory.slides[currentSlideIndex].images[id];
  updatePersistentMemory(memory);
  if (callback) callback();
}

function recreateSlidesFromMemory(memoryObject) {
  updatePersistentMemory(memoryObject);
  clearSlides();
  useMemory(createTextCallback, createImageCallback);
}

function save() {
  var yes = confirm(
    "Your slides are already automatically saved in your browser, \nas long as you don't clear cache. \n\nDo you still want to save the slides data in a JSON file?"
  );
  if (!yes) return;
  var jsonText = JSON.stringify(readPersistentMemory());
  download(jsonText, "slides_data.json", "application/json");
}

function download(text, name, type) {
  var a = document.createElement("a");
  var file = new Blob([text], { type: type });
  a.href = URL.createObjectURL(file);
  a.download = name;
  a.click();
  a.remove();
}

function upload() {
  var selectJsonFileInput = document.getElementById("select_json_file");
  selectJsonFileInput.onchange = (e) => {
    var file = e.target.files[0];
    var reader = new FileReader();
    reader.readAsText(file, "UTF-8");
    reader.onload = (e) => {
      var content = e.target.result;
      var json = JSON.parse(content);
      recreateSlidesFromMemory(json);
      console.log(memory);
    };
  };
  selectJsonFileInput.click();
}

function deleteAll() {
  var yes = confirm("Do you want to delete all slides?");
  if (!yes) return;
  clearMemory();
  location.reload();
}

function clearMemory() {
  sessionStorage.slidesMemory = "";
  localStorage.slidesMemory = "";
  memory = {
    originalScreenSize: {
      width: document.documentElement.clientWidth,
      height: document.documentElement.clientHeight,
    },
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
}
