window.Texts = {
  currentText: null,
  editTextIcon: null,

  initializeTextButtons: function () {
    document
      .querySelector("#add_text")
      .addEventListener(
        "click",
        this.createNewText.bind(this, Slides.currentSlide, defaultText.text)
      );
    document
      .querySelector("#add_big_text")
      .addEventListener(
        "click",
        this.createNewBigText.bind(this, Slides.currentSlide, defaultText.text)
      );
    this.createEditIcon();
  },

  createEditIcon: function () {
    var editTextIcon = document.createElement("button");

    editTextIcon.ariaLabel = "Edit text";
    editTextIcon.id = "edit_text_icon";
    editTextIcon.innerHTML = `<i class="material-icons">edit</i>`;
    editTextIcon.style.display = "none";
    editTextIcon.style.position = "absolute";
    editTextIcon.style.cursor = "text";
    editTextIcon.style.transition = "0s";

    editTextIcon.onclick = function () {
      Texts.currentText.contentEditable = true;
      Texts.currentText.focus();
      editTextIcon.style.direction = "none";
    };

    document.body.appendChild(editTextIcon);
    Texts.editTextIcon = editTextIcon;
  },

  moveEditIcon: function () {
    var currentText = Texts.currentText;
    var editTextIcon = Texts.editTextIcon;
    var leftOffset = editTextIcon.offsetWidth / 3;
    var topOffset = editTextIcon.offsetHeight / 3;
    if (editTextIcon && currentText) {
      editTextIcon.style.left =
        currentText.style.left.replace("px", "") - leftOffset + "px";
      editTextIcon.style.top =
        currentText.style.top.replace("px", "") - topOffset + "px";
    }
  },

  recreateText: function (
    parentElement = Slides.currentSlide,
    textId,
    slideIndex
  ) {
    var textObject = Memory.getSlide(slideIndex).texts[textId];
    var text = textObject.text;
    var left = textObject.left * Memory.getScaleForOriginalScreenSize(memory);
    var top = textObject.top * Memory.getScaleForOriginalScreenSize(memory);
    var id = textObject.id;
    var textProps = textObject.textProps;
    this.createText(parentElement, text, left, top, id, slideIndex, textProps);
  },

  createNewText: function (
    parentElement = Slides.currentSlide,
    text = defaultText.text,
    left = defaultText.left,
    top = defaultText.top,
    textProps
  ) {
    if (this.alreadyHasDefaultText()) return;
    var textObject = new Memory.Text(text);
    textObject.left = left;
    textObject.top = top;
    textObject.slide = Memory.currentSlideIndex;
    var id = textObject.id;
    Memory.addTextToMemory(textObject, id, textProps);
    this.createText(
      parentElement,
      text,
      left,
      top,
      id,
      Memory.currentSlideIndex,
      textProps
    );
    Slides.styleLeftRightButtons();
    A11y.announce("Added new text."); // TODO: not working
  },

  createNewBigText: function (
    parentElement = Slides.currentSlide,
    text = defaultText.text,
    left = defaultText.left + defaultTextWidth / 2 - defaultTextWidthBig / 2,
    top = defaultText.top + defaultTextHeight / 2 - defaultTextHeightBig / 2
  ) {
    var textProps = { fontSize: defaultTextFontSizeBig + "px" };
    this.createNewText(parentElement, text, left, top, textProps);
  },

  createText: function (
    parentElement = Slides.currentSlide,
    text = defaultText.text,
    left = defaultText.left,
    top = defaultText.top,
    id,
    slideIndex = Memory.currentSlideIndex,
    textProperties
  ) {
    var p = document.createElement("p");
    p.innerText = text;
    p.style.left = left + "px";
    p.style.top = top + "px";
    p.id = id;
    p.style.boxShadow = "none";
    p.style.background = "transparent";

    p.style.display =
      Memory.currentSlideIndex === slideIndex ? "block" : "none";
    p.tabIndex = 0;
    p.ariaLabel = this.getAriaLabelFromTextElement(p);
    p.role = "textbox";

    p.setAttribute("data-slide", slideIndex);

    if (textProperties) {
      if (textProperties.fontSize) {
        p.style.fontSize = textProperties.fontSize;
      }
    } else {
      p.style.fontSize = defaultText.fontSize; // fallback size (if not in memory)
    }

    makeElementDraggable(p, {
      mouseMoveCallback: Texts.updateTextPosition.bind(Texts),
      snapPoints: [
        { x: window.innerWidth / 2, y: window.innerHeight / 10 },
        { x: window.innerWidth / 2, y: window.innerHeight / 2 },
      ],

      snapCallback: function (left, top) {
        Texts.updateTextPosition(p);
      },
    });

    p.onpaste = function handlePaste(e) {
      // prevent actually pasting HTML:
      e.stopPropagation();
      e.preventDefault();

      var clipboardData = e.clipboardData || window.clipboardData;
      var pastedText = clipboardData.getData("text/plain");
      if (document.execCommand) {
        document.execCommand("insertHTML", false, pastedText);
      } else {
        // at least do something:
        p.innerText = pastedText;
      }
    };

    p.addEventListener("keyup", function (event) {
      var key = event.code || event.keyCode || event.which || window.event;
      var isBackspace = key === "Backspace" || key === 8;
      var isDelete = key === "Delete" || key === 46;
      if ((isBackspace || isDelete) && p.contentEditable !== "true") {
        var yes = confirm(
          "Do you want to delete this text? It starts with: " +
            Texts.getStartOfTextStringForA11y(p.innerText)
        );
        if (!yes) return;
        Memory.removeTextFromMemory(p.id, function () {
          p.remove();
        });
      } else if (p.contentEditable === "true") {
        runTextPluginsWhenTextUpdated(p);
      }
    });

    p.addEventListener("mouseover", function () {
      Texts.currentText = p;
      if (Texts.currentText.contentEditable !== "true") {
        Texts.editTextIcon.style.display = "";
        Texts.moveEditIcon();
      }
    });

    p.addEventListener("mouseleave", function (e) {
      setTimeout(function () {
        if (
          e.target !== Texts.editTextIcon &&
          e.target !== Texts.editTextIcon.querySelector("i")
        ) {
          Texts.editTextIcon.style.display = "none";
        }
      }, 3000);
    });

    p.addEventListener("blur", function () {
      p.contentEditable = false;
      Texts.updateText(p);
    });

    parentElement.appendChild(p);

    Slides.enableShareButton();
  },

  getAriaLabelFromTextElement: function (textElement) {
    var startOfTextString = this.getStartOfTextStringForA11y(
      textElement.innerText
    );
    var output = startOfTextString
      ? 'Text starting with: "' + startOfTextString
      : "(empty text)";
    output +=
      '" at ' +
      textElement.style.left +
      " left and " +
      textElement.style.top +
      " top";
    return output;
  },

  getStartOfTextStringForA11y: function (text) {
    // for quick text preview/reminder
    var textString = typeof text === "string" ? text : text.text;
    if (textString.length <= 20) return textString;
    var positionOfLastSpace = textString.slice(0, 20).lastIndexOf(" ");
    return textString.slice(0, positionOfLastSpace);
  },

  updateTextPosition: function (htmlElement) {
    var left = htmlElement.offsetLeft;
    var top = htmlElement.offsetTop;
    Memory.updateTextPositionInMemory(htmlElement.id, left, top);
    htmlElement.ariaLabel = this.getAriaLabelFromTextElement(htmlElement);

    this.moveEditIcon();

    Texts.editTextIcon.style.display = "none";

    debugMemory();
  },

  updateText: function (htmlElement) {
    var text = htmlElement.innerText;
    htmlElement.innerText = text;
    Memory.updateTextInMemory(htmlElement.id, text);
    htmlElement.ariaLabel = this.getAriaLabelFromTextElement(htmlElement);
    this.backgroundColorIfEmptyText(htmlElement);

    var isEmpty = text.trim() === "";
    if (isEmpty) {
      Memory.removeTextFromMemory(htmlElement.id);
      htmlElement.remove();
    }

    debugMemory();
  },

  backgroundColorIfEmptyText: function (htmlElement) {
    if (!htmlElement.innerText) {
      htmlElement.style.background = "black";
    } else {
      htmlElement.style.background = "transparent";
    }
  },

  alreadyHasDefaultText: function () {
    var textsInMemory = Memory.getCurrentSlide().texts;
    var textIds = Object.keys(Memory.getCurrentSlide().texts);
    var found = false;
    textIds.forEach(function (textId) {
      var text = textsInMemory[textId];
      if (
        text.text === defaultText.text &&
        text.left === defaultText.left &&
        text.top === defaultText.top
      ) {
        found = true;
        return;
      }
    });
    return found;
  },

  createTextCallback: function (textObject, slideIndex) {
    this.recreateText(Slides.currentSlide, textObject.id, slideIndex);
  },
};
