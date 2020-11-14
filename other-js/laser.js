var showLaserTimer;
document.addEventListener("mousemove", function (e) {
  var dotSize = 10;
  var laserDot = document.getElementById("laser");
  laserDot.style.left = e.pageX - dotSize + "px";
  laserDot.style.top = e.pageY - dotSize + "px";
  laserDot.style.display = "block";
  clearTimeout(showLaserTimer);
  showLaserTimer = setTimeout(function () {
    laserDot.style.display = "none";
  }, 3000);
});
