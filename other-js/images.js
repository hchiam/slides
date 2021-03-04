window.Images = {
  currentImage: null,
  deleteImageIcon: null,
  deleteImageIconTimer: null,

  recreatingImage: true,
  timeOfLastTap: null,

  initializeImageButtons: function () {
    document
      .querySelector("#select_image")
      .addEventListener("change", this.readImage.bind(this));
    document
      .querySelector("#add_image")
      .addEventListener("click", this.triggerCreateNewImage.bind(this));
    this.createImageIcon();
  },

  createImageIcon: function () {
    var deleteImageIcon = document.createElement("button");

    deleteImageIcon.ariaLabel = "Delete image";
    deleteImageIcon.id = "delete_image_icon";
    deleteImageIcon.innerHTML = `<i class="material-icons">delete</i><span></span>`;
    deleteImageIcon.style.display = "none";
    deleteImageIcon.style.position = "absolute";
    deleteImageIcon.style.transition = "0s";

    deleteImageIcon.onclick = function () {
      var img = Images.currentImage;
      Memory.removeImageFromMemory(img.id, function () {
        img.remove();
        Images.deleteImageIcon.style.display = "none";
      });
    };

    document.body.appendChild(deleteImageIcon);
    Images.deleteImageIcon = deleteImageIcon;
  },

  moveDeleteIcon: function () {
    var currentImage = Images.currentImage;
    var deleteImageIcon = Images.deleteImageIcon;
    var leftOffset = deleteImageIcon.offsetWidth / 4;
    var topOffset = deleteImageIcon.offsetHeight / 4;
    deleteImageIcon.style.left =
      currentImage.style.left.replace("px", "") - leftOffset + "px";
    deleteImageIcon.style.top =
      currentImage.style.top.replace("px", "") - topOffset + "px";
  },

  recreateImage: function (
    parentElement = Slides.currentSlide,
    imageId,
    slideIndex
  ) {
    this.recreatingImage = true;
    var imageObject = Memory.getSlide(slideIndex).images[imageId];
    var src = imageObject.file;
    var left = imageObject.left * Memory.getScaleForOriginalScreenSize(memory);
    var top = imageObject.top * Memory.getScaleForOriginalScreenSize(memory);
    Slides.isInitializingMemory = true;
    this.createImage(Slides.currentSlide, src, left, top, imageId, slideIndex);
  },

  createNewImage: function (src) {
    this.recreatingImage = false;
    var image = new Memory.Image(src);
    Memory.addImageToMemory(image, image.id);

    var src = image.file;
    var left = image.left;
    var top = image.top;
    var imageId = image.id;
    Slides.isInitializingMemory = false;
    this.createImage(
      Slides.currentSlide,
      src,
      left,
      top,
      imageId,
      Memory.currentSlideIndex
    );
    A11y.announce("Added new image."); // TODO: not working
  },

  createImage: function (
    parentElement = Slides.currentSlide,
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

    img.style.display =
      Memory.currentSlideIndex === slideIndex ? "block" : "none";
    img.tabIndex = 0;
    img.ariaLabel = this.getAriaLabelFromImage(img);

    img.setAttribute("data-slide", slideIndex);

    img.addEventListener("dblclick", function () {
      Memory.removeImageFromMemory(img.id, function () {
        img.remove();
      });
    });

    img.addEventListener("keyup", function (event) {
      var key = event.code || event.keyCode || event.which || window.event;
      var isBackspace = key === "Backspace" || key === 8;
      var isDelete = key === "Delete" || key === 46;
      if (isBackspace || isDelete) {
        Memory.removeImageFromMemory(img.id, function () {
          img.remove();
        });
      }
    });

    img.addEventListener("mousemove", function () {
      Images.currentImage = img;
      Images.deleteImageIcon.style.display = "";
      Images.moveDeleteIcon();
    });

    img.addEventListener("mouseout", function (e) {
      clearTimeout(deleteImageIconTimer);
      deleteImageIconTimer = setTimeout(function () {
        if (
          e.target !== Images.deleteImageIcon &&
          e.target !== Images.deleteImageIcon.querySelector("i")
        ) {
          Images.deleteImageIcon.style.display = "none";
        }
      }, 5000);
    });

    img.addEventListener("blur", function (e) {
      Images.deleteImageIcon.style.display = "none";
    });

    parentElement.appendChild(img);

    makeElementDraggableAndEditable(img, {
      mouseMoveCallback: Images.updateImagePosition,
      touchEndCallback: Images.onDoubleTap.bind(
        Images,
        img,
        function (element) {
          Memory.removeImageFromMemory(element.id, function () {
            element.remove();
          });
        }
      ),
      disableEditing: true,
      snapPoints: [{ x: window.innerWidth / 2, y: window.innerHeight / 2 }],
      snapCallback: function (left, top) {
        Images.updateImagePosition(img);
      },
    });

    Slides.enableShareButton();

    if (!Slides.isInitializingMemory) {
      alert("Note: you can delete images by double-clicking on them.");
    }

    setTimeout(() => {
      Images.setMaxImageSize(img);
      Images.centerImage(img);
      runImagePluginsWhenImageCreated(img);
    }, 0); // 0 ms, but timeout helps make sure img src sizes are defined
  },

  getAriaLabelFromImage: function (img) {
    return "image at " + img.style.left + " left and " + img.style.top + " top";
  },

  updateImagePosition: function (htmlElement) {
    var left = htmlElement.offsetLeft;
    var top = htmlElement.offsetTop;
    Memory.updateImagePositionInMemory(htmlElement.id, left, top);
    htmlElement.ariaLabel = Images.getAriaLabelFromImage(htmlElement);

    Images.deleteImageIcon.style.display = "none";

    debugMemory();
  },

  createImageCallback: function (imageObject, slideIndex) {
    this.recreateImage(Slides.currentSlide, imageObject.id, slideIndex);
  },

  triggerCreateNewImage: function () {
    document.getElementById("select_image").value = "";
    document.getElementById("select_image").click();
  },

  readImage: function () {
    var inputElement = document.querySelector("#select_image");
    if (inputElement.files && inputElement.files[0]) {
      var reader = new FileReader();
      var Images = this;
      reader.onload = function (e) {
        var src = e.target.result;
        Images.createNewImage(src);
      };
      inputElement.onchange = function (e) {
        const f = e.target.files[0];
        reader.readAsDataURL(f);
      };
      const image = inputElement.files[0];
      reader.readAsDataURL(image);
    }
  },

  setMaxImageSize: function (img) {
    var maxHeight = document.documentElement.clientHeight; // not screen.height
    var maxWidth = document.documentElement.clientWidth; // not screen.width
    var heightDifference = img.height - maxHeight;
    var widthDifference = img.width - maxWidth;
    if (heightDifference > widthDifference && heightDifference > 0) {
      img.style.height =
        (img.height > maxHeight ? maxHeight : img.height) + "px";
    } else if (widthDifference >= heightDifference && widthDifference > 0) {
      img.style.width = (img.width > maxWidth ? maxWidth : img.width) + "px";
    }
  },

  centerImage: function (img) {
    if (!img.height || !img.width) return;
    // don't center if reusing data:
    if (Slides.isInitializingMemory || this.recreatingImage) return;
    var screenHeight = document.documentElement.clientHeight; // not screen.height
    var screenWidth = document.documentElement.clientWidth; // not screen.width
    img.style.top = screenHeight / 2 - img.height / 2 + "px";
    img.style.left = screenWidth / 2 - img.width / 2 + "px";
    this.updateImagePosition(img);
  },

  onDoubleTap: function (element, callback) {
    var now = new Date().getTime();
    var delay = now - this.timeOfLastTap;
    var detectedDoubleTap = 0 < delay && delay < 600;
    if (detectedDoubleTap && callback) callback(element);
    this.timeOfLastTap = new Date().getTime();
  },
};
