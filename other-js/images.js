var recreatingImage = true;
function recreateImage(parentElement = currentSlide, imageId, slideIndex) {
  recreatingImage = true;
  var imageObject = getSlide(slideIndex).images[imageId];
  var src = imageObject.file;
  var left = imageObject.left * getScaleForOriginalScreenSize(memory);
  var top = imageObject.top * getScaleForOriginalScreenSize(memory);
  isInitializingMemory = true;
  createImage(currentSlide, src, left, top, imageId, slideIndex);
}

function createNewImage(src) {
  recreatingImage = false;
  var image = new Image(src);
  addImageToMemory(image, image.id);

  var src = image.file;
  var left = image.left;
  var top = image.top;
  var imageId = image.id;
  isInitializingMemory = false;
  createImage(currentSlide, src, left, top, imageId, currentSlideIndex);
  announce("Added new image."); // TODO: not working
}

function createImage(
  parentElement = currentSlide,
  src,
  left,
  top,
  imageId,
  slideIndex
) {
  var img = document.createElement("img");
  img.src = src;
  img.style.left = isNaN(left) && left.endsWith("px") ? left : left + "px";
  img.style.top = isNaN(top) && top.endsWith("px") ? top : top + "px";
  img.style.zIndex = -1;
  img.id = imageId;

  img.style.display = currentSlideIndex === slideIndex ? "block" : "none";
  img.tabIndex = 0;
  img.ariaLabel = getAriaLabelFromImage(img);

  img.setAttribute("data-slide", slideIndex);

  img.addEventListener("dblclick", function () {
    removeImageFromMemory(img.id, function () {
      img.remove();
    });
  });

  img.addEventListener("keyup", function (event) {
    var key = event.code || event.keyCode || event.which || window.event;
    var isBackspace = key === "Backspace" || key === 8;
    var isDelete = key === "Delete" || key === 46;
    if (isBackspace || isDelete) {
      removeImageFromMemory(img.id, function () {
        img.remove();
      });
    }
  });

  parentElement.appendChild(img);

  makeElementDraggable(img, {
    mouseMoveCallback: updateImagePosition,
    touchEndCallback: onDoubleTap.bind(this, img, function (element) {
      removeImageFromMemory(element.id, function () {
        element.remove();
      });
    }),
    snapPoints: [{ x: window.innerWidth / 2, y: window.innerHeight / 2 }],
  });

  if (!isInitializingMemory) {
    alert("Note: you can delete images by double-clicking on them.");
  }

  setTimeout(() => {
    setMaxImageSize(img);
    centerImage(img);
    runImagePluginsWhenImageCreated(img);
  }, 0); // 0 ms, but timeout helps make sure img src sizes are defined
}

function getAriaLabelFromImage(img) {
  return "image at " + img.style.left + " left and " + img.style.top + " top";
}

function updateImagePosition(htmlElement) {
  var left = htmlElement.offsetLeft;
  var top = htmlElement.offsetTop;
  updateImagePositionInMemory(htmlElement.id, left, top);
  htmlElement.ariaLabel = getAriaLabelFromImage(htmlElement);

  debugMemory();
}

function createImageCallback(imageObject, slideIndex) {
  recreateImage(currentSlide, imageObject.id, slideIndex);
}

function triggerCreateNewImage() {
  document.getElementById("select_image").value = "";
  document.getElementById("select_image").click();
}

function readImage(inputElement) {
  if (inputElement.files && inputElement.files[0]) {
    const reader = new FileReader();
    reader.onload = function (e) {
      var src = e.target.result;
      createNewImage(src);
    };
    inputElement.onchange = function (e) {
      const f = e.target.files[0];
      reader.readAsDataURL(f);
    };
    const image = inputElement.files[0];
    reader.readAsDataURL(image);
  }
}

function setMaxImageSize(img) {
  var maxHeight = document.documentElement.clientHeight; // not screen.height
  var maxWidth = document.documentElement.clientWidth; // not screen.width
  var heightDifference = img.height - maxHeight;
  var widthDifference = img.width - maxWidth;
  if (heightDifference > widthDifference && heightDifference > 0) {
    img.style.height = (img.height > maxHeight ? maxHeight : img.height) + "px";
  } else if (widthDifference >= heightDifference && widthDifference > 0) {
    img.style.width = (img.width > maxWidth ? maxWidth : img.width) + "px";
  }
}

function centerImage(img) {
  if (!img.height || !img.width) return;
  // don't center if reusing data:
  if (isInitializingMemory || recreatingImage) return;
  var screenHeight = document.documentElement.clientHeight; // not screen.height
  var screenWidth = document.documentElement.clientWidth; // not screen.width
  img.style.top = screenHeight / 2 - img.height / 2 + "px";
  img.style.left = screenWidth / 2 - img.width / 2 + "px";
  updateImagePosition(img);
}

var timeOfLastTap;
function onDoubleTap(element, callback) {
  var now = new Date().getTime();
  var delay = now - timeOfLastTap;
  var detectedDoubleTap = 0 < delay && delay < 600;
  if (detectedDoubleTap && callback) callback(element);
  timeOfLastTap = new Date().getTime();
}
