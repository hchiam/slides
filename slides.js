useMemory(createTextCallback, createImageCallback);
createSlide();

function left() {}

function right() {}

function createSlide() {
  var haveTextsInMemory = Object.keys(memory.texts).length;
  if (haveTextsInMemory) return;
  var currentSlide = document.querySelector("#current_slide");
  createNewText(currentSlide);
}

function recreateText(
  parentElement = document.querySelector("#current_slide"),
  textId
) {
  var textObject = memory.texts[textId];
  var text = textObject.text;
  var left = textObject.left;
  var top = textObject.top;
  var id = textObject.id;
  createText(parentElement, text, left, top, id);
}

function createNewText(
  parentElement = document.querySelector("#current_slide"),
  text = "Double-click to edit",
  left = 100,
  top = 100
) {
  var textObject = new Text(text);
  textObject.left = left;
  textObject.top = top;
  console.log(textObject.id);
  addTextToMemory(textObject);
  createText(parentElement, textObject.text, left, top, textObject.id);
}

function createText(
  parentElement = document.querySelector("#current_slide"),
  text = "Double-click to edit",
  left = 100,
  top = 100,
  id
) {
  var p = document.createElement("p");
  p.innerText = text;
  p.style.left = left + "px";
  p.style.top = top + "px";
  p.id = id;
  p.style.boxShadow = "none";
  p.style.background = "transparent";
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

function createTextCallback(textObject) {
  var parentElement = document.querySelector("#current_slide");
  var textId = textObject.id;
  recreateText(parentElement, textId);
}

// TODO: image versions of the text functions above

function createImageCallback(imageObject) {}
