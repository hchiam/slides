let slideNumber = 1;
let numberOfSlides = 1;

setup();

function setup() {
  const slidesInfo = getSlidesInfo();
  const englishTitle = slidesInfo.englishTitle || "Type here";
  const alternativeTitle = slidesInfo.alternativeTitle || "Type here";
  const subtitle = slidesInfo.subtitle || "";
  $("#english-title").text("Title: " + englishTitle.replace(/^Title: /, ""));
  $("#alternative-title").text(
    "Other title: " + alternativeTitle.replace(/^Other title: /, "")
  );
  $("#subtitle").text("Subtitle: " + subtitle.replace(/^Subtitle: /, ""));
  reinstateSlidesInfo();
  setupHoverEffects();
}

function getSlidesInfo() {
  const slidesInfo = JSON.parse(sessionStorage.getItem("slidesInfo")) || {
    englishTitle: "",
    alternativeTitle: "",
    subtitle: "",
    slides: [{}, {}],
  };
  if (!slidesInfo.slides) {
    slidesInfo.slides = [{}, {}]; // make index 0 and 1 empty for convenience
  }
  return slidesInfo;
}

function setSlidesInfo(slidesInfo) {
  sessionStorage.setItem("slidesInfo", JSON.stringify(slidesInfo));
}

function reinstateSlidesInfo() {
  const slidesInfo = getSlidesInfo();
  slideNumber = 1;
  for (let i = 2; i < slidesInfo.slides.length; i++) {
    const singleSlideInfo = slidesInfo.slides[i];
    if (
      (singleSlideInfo.header === "" ||
        singleSlideInfo.header === "Type here") &&
      (singleSlideInfo.content === "" ||
        singleSlideInfo.content === "Type here") &&
      singleSlideInfo.image === ""
    ) {
      continue; // skip empty slides
    }
    slideNumber = i;
    addSlide(slideNumber);
    $("#header-" + slideNumber).text(singleSlideInfo.header || "Type here");
    $("#text-" + slideNumber).text(singleSlideInfo.content || "Type here");
    $("#image-" + slideNumber).attr("src", singleSlideInfo.image);
    if (singleSlideInfo.image) {
      $("#image-button-add-" + slideNumber).css("display", "none");
      $("#image-button-remove-" + slideNumber).css("display", "block");
    } else {
      $("#image-button-add-" + slideNumber).css("display", "block");
      $("#image-button-remove-" + slideNumber).css("display", "none");
    }
  }
  slideNumber = 1;
  goToSlide(slideNumber);
}

function setupHoverEffects() {
  const snackbar = $("#snackbar");
  $("h1, h2, h3, pre")
    .attr("contenteditable", true)
    .attr("title", "Click to edit")
    .off("mouseover")
    .on("mouseover", function () {
      $(this).addClass("editable");
      snackbar.addClass("show");
    })
    .off("mouseleave")
    .on("mouseleave", function () {
      $(this).removeClass("editable");
      snackbar.removeClass("show");
    });
}

function previous() {
  slideNumber--;
  if (slideNumber < 1) {
    slideNumber = 1;
    // cancel:
    return;
  }
  goToSlide(slideNumber);
}

function next() {
  slideNumber++;
  addSlide(slideNumber);
  if (slideNumber > numberOfSlides) {
    slideNumber = numberOfSlides;
    // cancel:
    return;
  }
  goToSlide(slideNumber);
}

function deleteSlide() {
  const confirmed = confirm("Are you sure you want to delete this slide?");
  if (!confirmed) return; //cancel
  const slidesInfo = getSlidesInfo();
  if (slideNumber < 2) return; // cancel (can't delete 1st slide)
  // shift other slides in data:
  for (let i = slideNumber; i + 1 <= numberOfSlides; i++) {
    slidesInfo.slides[i].header = String(slidesInfo.slides[i + 1].header);
    slidesInfo.slides[i].content = String(slidesInfo.slides[i + 1].content);
    slidesInfo.slides[i].image = String(slidesInfo.slides[i + 1].image);
  }
  // shift other slides in HTML:
  for (let i = slideNumber; i < numberOfSlides; i++) {
    $("#header-" + i).text(slidesInfo.slides[i].header || "Type here");
    $("#text-" + i).text(slidesInfo.slides[i].content || "Type here");
    $("#image-" + i).attr("src", slidesInfo.slides[i].image || "");
  }
  $("#slide-" + numberOfSlides).remove();
  // update data afterwards:
  slidesInfo.slides = slidesInfo.slides.slice(0, numberOfSlides);
  setSlidesInfo(slidesInfo);
  slideNumber--;
  numberOfSlides--;
  // refresh page:
  goToSlide(slideNumber);
  // location.reload(); // WARNING: for now, don't reload because it messes up localStorage and images
}

function jumpToSlideNumberTyped() {
  const slideNumberElement = $("#slide-number");
  let slideNumberTarget = slideNumberElement.text();
  if (isNaN(slideNumberTarget)) return;
  goToSlide(slideNumberTarget);
  if (slideNumberTarget > numberOfSlides) {
    slideNumberTarget = numberOfSlides;
  } else if (slideNumberTarget < 1) {
    slideNumberTarget = 1;
  }
  slideNumber = slideNumberTarget;
}

function goToSlide(slideNumber) {
  if (slideNumber > numberOfSlides) {
    slideNumber = numberOfSlides;
    return;
  } else if (slideNumber < 1) {
    slideNumber = 1;
    return;
  }

  if (slideNumber === numberOfSlides && isSlideEdited(slideNumber)) {
    $("#next").text("＋ Add slide").effect(
      "shake",
      {
        times: 2,
        direction: "right",
        distance: 5,
      },
      500
    );
  } else {
    $("#next").text("▶ Next slide");
  }

  enableControlButtons(slideNumber);

  $("#slides > div:not(#slide-" + slideNumber + ")").css("top", "100vh");
  $("#slide-" + slideNumber).css("top", "7.5%");
  $("#slide-number").text(slideNumber);
}

function enableControlButtons(slideNumber) {
  // previous:
  const previous = $("#previous");
  if (slideNumber === 1) {
    previous.attr("disabled", true);
  } else {
    previous.attr("disabled", false);
  }

  // next:
  const next = $("#next");
  if (slideNumber === 1 || isSlideEdited(slideNumber)) {
    next.css("display", "block");
  } else if (slideNumber < numberOfSlides) {
    // if not edited but between other slides that might be:
    next.css("display", "block");
  } else {
    // > 1 and not edited:
    next.css("display", "none");
  }

  // delete:
  const deleteButton = $("#delete");
  if (slideNumber === 1) {
    deleteButton.css("display", "none");
  } else {
    deleteButton.css("display", "block");
  }
}

function isSlideEdited(previousSlideNumber) {
  const previousSlide = $("#slide-" + previousSlideNumber);
  const headerChanged =
    previousSlide.find("#header-" + previousSlideNumber).text() !== "Type here";
  const content = previousSlide.find("#text-" + previousSlideNumber).text();
  const textChanged = content !== "Type here" && content !== "";
  const previousImgSrc = previousSlide
    .find("#image-" + previousSlideNumber)
    .attr("src");
  const imageAdded =
    typeof previousImgSrc === "undefined" || previousImgSrc !== "";
  return headerChanged || textChanged || imageAdded;
}

function addSlide(slideNumber) {
  if (slideNumber <= numberOfSlides) return; // cancel
  numberOfSlides++;
  const slidesInfo = getSlidesInfo();
  slidesInfo.slides[slideNumber] = { header: "", content: "", image: "" };
  setSlidesInfo(slidesInfo);
  $("#slides").append(`
  <div id="slide-${numberOfSlides}">
    <h2 id="header-${numberOfSlides}" onkeyup="editHeader(${numberOfSlides}, this.innerText)" contenteditable>Type here</h2>
    <pre id="text-${numberOfSlides}" onkeyup="editText(${numberOfSlides}, this.innerText)" onblur="checkEmpty(${numberOfSlides})" contenteditable>Type here</pre>
    <img id="image-${numberOfSlides}" src="" alt="">
    <button id="image-button-add-${numberOfSlides}" class="ui secondary button add-image" onclick="addImage(${numberOfSlides})">Or choose an image</button>
    <button id="image-button-remove-${numberOfSlides}" class="ui secondary button" onclick="removeImage(${numberOfSlides})" style="display: none;">Remove image</button>
    <input id="image-input-${numberOfSlides}" onchange="readImage(${numberOfSlides}, this)" type="file" accept="image/*" style="visibility: hidden;" aria-label="image selection"/>
  </div>
  `);
  setupHoverEffects();
  $("#next").css("display", "none");
}

function editHeader(slideNumber, headerText) {
  const slidesInfo = getSlidesInfo();
  slidesInfo.slides[slideNumber].header = headerText;
  setSlidesInfo(slidesInfo);
}

function checkEmpty(slideNumber) {
  const contentElement = $("#text-" + slideNumber);
  if (contentElement.text() === "") contentElement.text("Type here");
}

function editText(slideNumber, content) {
  if (isSlideEdited(slideNumber) || slideNumber < numberOfSlides) {
    $("#next").css("display", "block");
  } else {
    $("#next").css("display", "none");
  }

  if (slideNumber === numberOfSlides) {
    $("#next").text("＋ Add slide");
  } else {
    $("#next").text("▶ Next slide");
  }

  if (isSlideEdited(slideNumber)) {
    $("#image-button-add-" + slideNumber).css("display", "none");
  } else {
    $("#image-button-add-" + slideNumber).css("display", "block");
  }

  const slidesInfo = getSlidesInfo();
  slidesInfo.slides[slideNumber].content = content;
  setSlidesInfo(slidesInfo);
}

function addImage(slideNumber) {
  $("#image-input-" + slideNumber).click();
  if (isSlideEdited(slideNumber) || slideNumber < numberOfSlides) {
    $("#next").css("display", "block");
  } else {
    $("#next").css("display", "none");
  }
}

function readImage(slideNumber, input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = function (e) {
      $("#image-" + slideNumber).attr("src", e.target.result);
    };
    $("#image-input-" + slideNumber)
      .off("change")
      .on("change", (e) => {
        const f = e.target.files[0];
        reader.readAsDataURL(f);
      });
    const image = input.files[0];
    reader.readAsDataURL(image);
    const slidesInfo = getSlidesInfo();
    slidesInfo.slides[slideNumber].image = image;
    setSlidesInfo(slidesInfo);
    showImage(slideNumber);
    $("#next").css("display", "block");
  }
}

function removeImage(slideNumber) {
  $("#image-" + slideNumber).attr("src", "");
  hideImage(slideNumber);
  if (isSlideEdited(slideNumber)) {
    $("#next").css("display", "block");
  } else {
    $("#next").css("display", "none");
  }
}

function showImage(slideNumber) {
  $("#image-" + slideNumber).css("display", "block");
  $("#image-button-add-" + slideNumber).css("display", "none");
  $("#image-button-remove-" + slideNumber).css("display", "block");
  $("#header-" + slideNumber).css("display", "none");
  $("#text-" + slideNumber).css("display", "none");
}

function hideImage(slideNumber) {
  $("#image-" + slideNumber).css("display", "none");
  $("#image-button-add-" + slideNumber).css("display", "block");
  $("#image-button-remove-" + slideNumber).css("display", "none");
  $("#header-" + slideNumber).css("display", "block");
  $("#text-" + slideNumber).css("display", "block");
}
