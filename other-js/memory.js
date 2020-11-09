var idCounter = 0;

var memory = {
  texts: {
    // id: { text: "", left: 0, left: 0 },
  },
  images: {
    // id: { file: "", left: 0, left: 0 },
  },
};

if (localStorage.slidesMemory) {
  memory = readPersistentMemory();
} else {
  updatePersistentMemory(memory);
}

function Text(text = "", id) {
  this.text = text;
  this.left = 0;
  this.top = 0;
  this.id = id || generateId();
}

function Image(file = "", id) {
  this.file = file;
  this.left = 0;
  this.top = 0;
  this.id = id || generateId();
}

function generateId() {
  var currentDate = new Date();
  var timeNow = currentDate.getTime(); // milliseconds
  idCounter++; // to guarantee uniqueness
  return idCounter + "_" + timeNow;
}

function addTextToMemory(text, id) {
  if (typeof text === "string") {
    var textObject = new Text(text, id);
    memory.texts[textObject.id] = {
      text: textObject.text,
      left: textObject.left,
      top: textObject.top,
      id: textObject.id,
    };
  } else {
    memory.texts[text.id] = {
      text: text.text,
      left: text.left,
      top: text.top,
      id: text.id,
    };
  }
  updatePersistentMemory(memory);
}

function updateTextPositionInMemory(textId, left, top) {
  memory.texts[textId].left = left;
  memory.texts[textId].top = top;
  updatePersistentMemory(memory);
}

function updateTextInMemory(textId, text) {
  memory.texts[textId].text = text;
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
  if (Object.keys(memory.texts).length) {
    useTextsFromMemory(createTextCallback);
  }
  if (Object.keys(memory.images).length) {
    useImagesFromMemory(createImageCallback);
  }
}

function useTextsFromMemory(createTextCallback) {
  var textIds = Object.keys(memory.texts);
  textIds.forEach(function (textId) {
    var textObject = memory.texts[textId];
    createTextCallback(textObject);
  });
}

function useImagesFromMemory(createImageCallback) {
  var imageIds = Object.keys(memory.images);
  imageIds.forEach(function (imageId) {
    var imageObject = memory.images[imageId];
    createImageCallback(imageObject);
  });
}
