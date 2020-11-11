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
}

function updateImagePosition(htmlElement) {
  var left = htmlElement.offsetLeft;
  var top = htmlElement.offsetTop;
  updateImagePositionInMemory(htmlElement.id, left, top);

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
