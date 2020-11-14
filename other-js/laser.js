document.addEventListener("mousemove", function (e) {
  var dotSize = 10;
  var laserDot = document.getElementById("laser");
  laserDot.style.left = e.pageX - dotSize + "px";
  laserDot.style.top = e.pageY - dotSize + "px";
});
