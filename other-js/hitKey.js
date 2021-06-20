window.hitKey = hitKey;
window.hitEnterKey = hitEnterKey;
window.hitArrowKey = hitArrowKey;
window.hitArrowLeftKey = hitArrowLeftKey;
window.hitArrowUpKey = hitArrowUpKey;
window.hitArrowRightKey = hitArrowRightKey;
window.hitArrowDownKey = hitArrowDownKey;

function hitKey(event, keyNumber, keyWord) {
  var key = event.key || event.code || event.keyCode || event.which || event;
  return key === keyNumber || key === keyWord;
}

function hitEnterKey(event) {
  return hitKey(event, 13, "Enter");
}

function hitArrowKey(event) {
  return (
    hitArrowLeftKey(event) ||
    hitArrowUpKey(event) ||
    hitArrowRightKey(event) ||
    hitArrowDownKey(event)
  );
}

function hitArrowLeftKey(event) {
  return hitKey(event, 37, "ArrowLeft");
}

function hitArrowUpKey(event) {
  return hitKey(event, 38, "ArrowUp");
}

function hitArrowRightKey(event) {
  return hitKey(event, 39, "ArrowRight");
}

function hitArrowDownKey(event) {
  return hitKey(event, 40, "ArrowDown");
}
