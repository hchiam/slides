function getOS() {
  if (navigator.platform.startsWith("Mac")) {
    return "Mac";
  } else if (navigator.platform.startsWith("Win")) {
    return "Windows";
  } else {
    return navigator.platform;
  }
}

$("#save")
  .off("click")
  .on("click", function () {
    localStorage.setItem("slidesInfo", sessionStorage.getItem("slidesInfo"));
    const os = getOS();
    if (os === "Mac") {
      alert("To save these slides, close this popup and then hit Command+S");
    } else {
      alert("To save these slides, close this popup and then hit Ctrl+S");
    }
  });

const isSavedFile = location.href.startsWith("file:///");
if (isSavedFile) {
  document.getElementById("save").style.display = "none";

  if (localStorage.getItem("slidesInfo") === null) {
    localStorage.setItem("slidesInfo", sessionStorage.getItem("slidesInfo"));
  } else {
    sessionStorage.setItem("slidesInfo", localStorage.getItem("slidesInfo"));
  }
}
