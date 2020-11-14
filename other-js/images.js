function recreateImage(parentElement = currentSlide, imageId, slideIndex) {
  var imageObject = getSlide(slideIndex).images[imageId];
  var src = imageObject.file;
  var left = imageObject.left;
  var top = imageObject.top;
  createImage(currentSlide, src, left, top, imageId, slideIndex);
}

function createNewImage(src) {
  var image = new Image(src);
  addImageToMemory(image, image.id);

  var src = image.file;
  var left = image.left;
  var top = image.top;
  var imageId = image.id;
  createImage(currentSlide, src, left, top, imageId, currentSlideIndex);
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

  parentElement.appendChild(img);

  makeElementDraggable(img, {
    mouseMoveCallback: updateImagePosition,
  });

  if (!isInitializingMemory) {
    alert("Note: you can remove images by double-clicking on them.");
  }

  setTimeout(function () {
    setMaxImageSize(img);
    centerImage(img);
  }, 0); // 0 ms, but need timeout so img src sizes are defined
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
  var screenHeight = document.documentElement.clientHeight; // not screen.height
  var screenWidth = document.documentElement.clientWidth; // not screen.width
  img.style.top = screenHeight / 2 - img.height / 2 + "px";
  img.style.left = screenWidth / 2 - img.width / 2 + "px";
}
