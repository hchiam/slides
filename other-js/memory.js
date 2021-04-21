var memory = {
  originalScreenSize: {
    width: document.documentElement.clientWidth,
    height: document.documentElement.clientHeight,
  },
  id: "",
  title: "",
  slides: [
    {
      texts: {
        // id: { text: "", left: 0, top: 0, slide: 0, id: "..." },
      },
      images: {
        // id: { file: "", fileName: "", left: 0, top: 0, slide: 0, id: "..." },
      },
    },
  ],
};

var defaultTextString = "Drag to move. To edit, hover then click pencil icon.";
var goldenRatio = 1.6; // for big text to use
var defaultTextWidth = 690.484; // in px
var defaultTextHeight = 41; // in px
var defaultTextFontSize = 30; // in px
var defaultText = {
  text: defaultTextString,
  left: document.documentElement.clientWidth / 2 - defaultTextWidth / 2,
  top: document.documentElement.clientHeight / 2 - defaultTextHeight / 2,
  slide: 0,
  fontSize: defaultTextFontSize + "px",
};
var defaultTextWidthBig = defaultTextWidth * goldenRatio;
var defaultTextHeightBig = defaultTextHeight * goldenRatio;
var defaultTextFontSizeBig = Math.round(defaultTextFontSize * goldenRatio); // number

var bytesIn1MiB = Math.pow(2, 20);
var localStorageLimit = 5 * bytesIn1MiB; // 5MB

window.Memory = {
  currentSlideIndex: 0,

  idCounter: 0, // for uniqueness only

  Text: function (text = "", id) {
    this.text = text || defaultText.text;
    this.left = defaultText.left;
    this.top = defaultText.top;
    this.slide = defaultText.slide;
    this.fontSize = defaultText.fontSize;
    this.id = id || Memory.generateId();
  },

  Image: function (file = "", fileName, id) {
    this.file = file;
    this.fileName = fileName;
    this.left = 0;
    this.top = 0;
    this.slide = defaultText.slide;
    this.id = id || Memory.generateId();
  },

  initialize: function () {
    this.initializeDefaultText();
    this.initializeEventListeners();
    this.initializeConsoleCommands();
  },

  initializeDefaultText: function () {
    defaultText.text = defaultTextString;
    defaultText.left =
      document.documentElement.clientWidth / 2 - defaultTextWidth / 2;
    defaultText.top =
      document.documentElement.clientHeight / 2 - defaultTextHeight / 2;
  },

  initializeEventListeners: function () {
    document
      .querySelector("#save")
      .addEventListener("click", this.save.bind(this));
    document
      .querySelector("#upload")
      .addEventListener("click", this.upload.bind(this));
    document
      .querySelector("#share")
      .addEventListener("click", this.share.bind(this));
    document
      .querySelector("#delete")
      .addEventListener("click", this.deleteAll.bind(this));
    Morphing_button.setup(document.querySelector("#share"));
  },

  initializeConsoleCommands: function () {
    document.querySelector("#save").style.display = "none";
    document.querySelector("#upload").style.display = "none";
    window.save = Memory.save.bind(Memory);
    window.upload = Memory.upload.bind(Memory);
    window.shareSaveUpload = function () {
      document.querySelector("#share").style.display = "inline";
      document.querySelector("#save").style.display = "inline";
      document.querySelector("#upload").style.display = "inline";
    };
  },

  generateId: function () {
    var currentDate = new Date();
    var timeNow = currentDate.getTime(); // milliseconds
    this.idCounter++; // to guarantee uniqueness
    return this.idCounter + "_" + timeNow;
  },

  createSlideInMemory: function (createSlideCallback) {
    memory.slides.push({
      texts: {
        // id: { text: "", left: 0, top: 0, slide: 0, id: "..." },
      },
      images: {
        // id: { file: "", fileName: "", left: 0, top: 0, slide: 0, id: "..." },
      },
    });
    this.updatePersistentMemory(memory);
    if (createSlideCallback) createSlideCallback();
  },

  getCurrentSlide: function () {
    return memory.slides[this.currentSlideIndex];
  },

  getSlide: function (slideIndex) {
    return memory.slides[slideIndex];
  },

  getTextIds: function (slideIndex) {
    var slides = this.getSlide(slideIndex);
    if (!slides || !slides.texts) return [];
    return Object.keys(slides.texts);
  },

  getImageIds: function (slideIndex) {
    var slides = this.getSlide(slideIndex);
    if (!slides || !slides.images) return [];
    return Object.keys(slides.images);
  },

  haveContentInSlide: function (slideIndex) {
    var slide = this.getSlide(slideIndex);
    return (
      Object.keys(slide.texts).length > 0 ||
      Object.keys(slide.images).length > 0
    );
  },

  addTextToMemory: function (text, id, textProps) {
    var textId = "";
    if (typeof text === "string") {
      var textObject = new this.Text(text, id);
      textId = textObject.id;
      memory.slides[this.currentSlideIndex].texts[textObject.id] = {
        text: textObject.text,
        left: textObject.left,
        top: textObject.top,
        slide: textObject.slide,
        id: textObject.id,
      };
    } else {
      textId = text.id;
      memory.slides[this.currentSlideIndex].texts[text.id] = {
        text: text.text,
        left: text.left,
        top: text.top,
        slide: text.slide,
        id: text.id,
      };
    }
    if (textProps) {
      memory.slides[this.currentSlideIndex].texts[textId].textProps = textProps;
    }
    this.updatePersistentMemory(memory);
  },

  removeTextFromMemory: function (id, callbackOnDelete) {
    delete memory.slides[this.currentSlideIndex].texts[id];
    this.updatePersistentMemory(memory);
    if (callbackOnDelete) callbackOnDelete();
  },

  updateTextPositionInMemory: function (textId, left, top) {
    if (!memory.slides[this.currentSlideIndex].texts[textId]) return;
    memory.slides[this.currentSlideIndex].texts[textId].left = left;
    memory.slides[this.currentSlideIndex].texts[textId].top = top;
    this.updatePersistentMemory(memory);
  },

  updateImagePositionInMemory: function (imageId, left, top) {
    if (!memory.slides[this.currentSlideIndex].images[imageId]) return;
    memory.slides[this.currentSlideIndex].images[imageId].left = left;
    memory.slides[this.currentSlideIndex].images[imageId].top = top;
    this.updatePersistentMemory(memory);
  },

  updateTextInMemory: function (textId, text) {
    if (!memory.slides[this.currentSlideIndex].texts[textId]) return;
    memory.slides[this.currentSlideIndex].texts[textId].text = text;
    this.updatePersistentMemory(memory);
  },

  updatePersistentMemory: function (memoryObject) {
    memory = memoryObject;
    var willFitInAnyLocalStorage = !this.isStringTooLongForLocalStorageLimit(
      JSON.stringify(memory)
    );
    if (!willFitInAnyLocalStorage) return;
    if (typeof localforage !== "undefined") {
      localforage.setItem(
        "slidesMemory",
        JSON.stringify(memoryObject || memory)
      );
    } else if (sessionStorage.slidesMemory) {
      sessionStorage.slidesMemory = JSON.stringify(memoryObject || memory);
    } else {
      localStorage.slidesMemory = JSON.stringify(memoryObject || memory);
    }
  },

  readPersistentMemory: function (callback) {
    if (typeof localforage !== "undefined") {
      localforage.getItem("slidesMemory", function (err, value) {
        memory = JSON.parse(value) || memory;
        if (callback) callback(memory);
      });
    } else {
      if (sessionStorage.slidesMemory) {
        memory = JSON.parse(sessionStorage.slidesMemory);
      } else if (localStorage.slidesMemory) {
        memory = JSON.parse(localStorage.slidesMemory);
      }
      if (callback) callback(memory);
    }
  },

  useMemory: function (createTextCallback, createImageCallback, setupCallback) {
    var slides = memory.slides;

    if (slides.length === 0) return;

    slides.forEach(function (slide, slideIndex) {
      if (Object.keys(slide.texts).length > 0) {
        Memory.useTextsFromMemory(slide, slideIndex, createTextCallback);
      }

      if (Object.keys(slide.images).length > 0) {
        Memory.useImagesFromMemory(slide, slideIndex, createImageCallback);
      }
    });

    var scale = this.getScaleForOriginalScreenSize(memory);
    var elementToScale = document.getElementById("current_slide");
    elementToScale.style.transform = "scale(" + scale + ")";

    if (setupCallback) setupCallback(memory);
  },

  useTextsFromMemory: function (slide, slideIndex, createTextCallback) {
    var textIds = Object.keys(slide.texts);
    textIds.forEach(function (textId) {
      var textObject = slide.texts[textId];
      if (createTextCallback) createTextCallback(textObject, slideIndex);
    });
  },

  useImagesFromMemory: function (slide, slideIndex, createImageCallback) {
    var imageIds = Object.keys(slide.images);
    imageIds.forEach(function (imageId) {
      var imageObject = slide.images[imageId];
      if (createImageCallback) createImageCallback(imageObject, slideIndex);
    });
  },

  getScaleForOriginalScreenSize: function (memory) {
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
  },

  addImageToMemory: function (image, fileName, id) {
    if (typeof image === "string") {
      var src = image;
      var imageObject = new this.Image(src, fileName, id);
      memory.slides[this.currentSlideIndex].images[imageObject.id] = {
        file: imageObject.file,
        fileName: imageObject.fileName,
        left: imageObject.left,
        top: imageObject.top,
        slide: imageObject.slide,
        id: imageObject.id,
      };
    } else {
      memory.slides[this.currentSlideIndex].images[image.id] = {
        file: image.file,
        fileName: image.fileName,
        left: image.left,
        top: image.top,
        slide: image.slide,
        id: image.id,
      };
    }
    this.updatePersistentMemory(memory);
  },

  removeImageFromMemory: function (id, callback) {
    var yes = confirm("Do you want to delete this image?");
    if (!yes) return;
    delete memory.slides[this.currentSlideIndex].images[id];
    this.updatePersistentMemory(memory);
    if (callback) callback();
  },

  recreateSlidesFromMemory: function (memoryObject) {
    this.updatePersistentMemory(memoryObject);
    Slides.clearSlides();
    this.useMemory(
      Texts.createTextCallback.bind(Texts),
      Images.createImageCallback.bind(Images)
    );
  },

  save: function () {
    var yes = confirm(
      "Your slides are already automatically saved in your browser, \nas long as you don't clear cache. \n\nDo you still want to save the slides data in a JSON file?"
    );
    if (!yes) return;
    this.readPersistentMemory();
    this.download(
      JSON.stringify(memory, null, 2),
      "slides_data.json",
      "application/json"
    );
  },

  download: function (text, name, type) {
    var a = document.createElement("a");
    var file = new Blob([text], { type: type });
    a.href = URL.createObjectURL(file);
    a.download = name;
    a.click();
    a.remove();
  },

  upload: function () {
    var selectJsonFileInput = document.getElementById("select_json_file");
    selectJsonFileInput.onchange = (e) => {
      var file = e.target.files[0];
      var reader = new FileReader();
      reader.readAsText(file, "UTF-8");
      reader.onload = (e) => {
        var content = e.target.result;
        var json = JSON.parse(content);
        this.recreateSlidesFromMemory(json);
        console.log(memory);
      };
    };
    selectJsonFileInput.click();
  },

  share: function () {
    if (this.areAllSlidesBlankInMemory()) return;

    var yes = confirm(
      "This will create a public link that you can use to share your slides. " +
        "\n\nYour slides data will be saved in Google Firebase, and may be deleted at any time at the discretion of the maintainer of this app. " +
        "\n\nContinue?"
    );
    if (!yes) return;

    Spinner.show();
    this.readPersistentMemory();

    Firebase.createLink(function (query) {
      Spinner.hide();
      var url = location.protocol + "//" + location.host + "/?" + query;
      copyToClipboard(url, function () {
        console.log("Copied link: \n\n" + url);
      });
      var shareButton = document.querySelector("#share");
      Morphing_button.morph(shareButton);
      shareButton.classList.add("modal");
      shareButton.innerHTML = `
        <div>You can share your slides at this public link (no login necessary):</div>
        <br/>
        <div class="modal-share-link" tabindex="0" autofocus 
            onclick="copyToClipboard('${url}', function() { alert('Copied link:\\n\\n' + '${url}') })">
            ${url}
        </div>
        <br/>
        <div><button onclick="Memory.closeShareModal(event)" aria-label="Close">X</button></div>
      `;
      setUpKeyboardFocusTrap(shareButton);
    });
  },

  closeShareModal: function (e) {
    var shareButton = document.querySelector("#share");
    Morphing_button.revert(shareButton, e);
    shareButton.classList.remove("modal");
  },

  deleteAll: function () {
    var confirmDeleteMessage = "Do you want to delete all slides?";
    if (location.search)
      confirmDeleteMessage +=
        " \n\nNOTE: This does NOT delete the public link.";
    var yes = confirm(confirmDeleteMessage);
    if (!yes) return;
    this.clearMemory();
    location.href = location.origin;
  },

  clearMemory: function () {
    sessionStorage.slidesMemory = "";
    localStorage.slidesMemory = "";
    memory = {
      originalScreenSize: {
        width: document.documentElement.clientWidth,
        height: document.documentElement.clientHeight,
      },
      id: "",
      slides: [
        {
          texts: {
            // id: { text: "", left: 0, top: 0, slide: 0, id: "..." },
          },
          images: {
            // id: { file: "", fileName: "", left: 0, top: 0, slide: 0, id: "..." },
          },
        },
      ],
    };
    if (typeof localforage !== "undefined") localforage.clear();
  },

  areAllSlidesBlankInMemory: function () {
    var noJSMemoryAtAll = !memory;
    if (noJSMemoryAtAll) return true;

    var noSlides = !memory.slides || memory.slides.length === 0;
    if (noSlides) return true;

    var foundTextOrImageInSlides = memory.slides.some((s) => {
      var haveTextsInSlide = s.texts && Object.keys(s.texts).length > 0;
      var haveImagesInSlide = s.images && Object.keys(s.images).length > 0;
      return haveTextsInSlide || haveImagesInSlide;
    });

    if (foundTextOrImageInSlides) {
      Slides.enableShareButton();
    } else {
      Slides.disableShareButton();
    }

    return !foundTextOrImageInSlides;
  },

  isStringTooLongForLocalStorageLimit: function (string) {
    return this.getStringLengthInBytes(string) > localStorageLimit;
  },

  getStringLengthInBytes: function (string) {
    return this.getStringAsBytesArray(string).length;
  },

  getStringAsBytesArray: function (string) {
    return new TextEncoder().encode(string);
  },
};

window.memory = memory;
window.defaultTextString = defaultTextString;
window.goldenRatio = goldenRatio;
window.defaultTextWidth = defaultTextWidth;
window.defaultTextHeight = defaultTextHeight;
window.defaultTextFontSize = defaultTextFontSize;
window.defaultText = defaultText;
window.defaultTextWidthBig = defaultTextWidthBig;
window.defaultTextHeightBig = defaultTextHeightBig;
window.defaultTextFontSizeBig = defaultTextFontSizeBig;
