var showLaserTimer;
document.addEventListener("mousemove", function (e) {
  var screenWidth = document.documentElement.clientWidth; // not screen.width
  var laserDot = document.getElementById("laser");
  var dotSize = 10;
  if (screenWidth <= 600) {
    laserDot.style.display = "none";
    return;
  }
  laserDot.style.left = e.pageX - dotSize + "px";
  laserDot.style.top = e.pageY - dotSize + "px";
  laserDot.style.display = "block";
  clearTimeout(showLaserTimer);
  showLaserTimer = setTimeout(function () {
    laserDot.style.display = "none";
  }, 3000);
});
