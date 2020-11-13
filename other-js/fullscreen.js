function fullscreen() {
  var body = document.body;
  var requestFullScreen =
    body.requestFullScreen ||
    body.webkitRequestFullScreen ||
    body.mozRequestFullScreen ||
    body.msRequestFullScreen;
  if (requestFullScreen) requestFullScreen.call(body);
}
