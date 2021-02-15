// reference: https://github.com/hchiam/clipboard

function copyToClipboard(text, callback) {
  try {
    var temp = document.createElement("textarea");
    document.body.append(temp);
    temp.value = text;
    temp.select();
    document.execCommand("copy");
    temp.remove();
    if (callback) callback(text);
  } catch (err) {
    alert(
      "Could not automatically copy to clipboard. \n\n Copy this text instead: \n\n" +
        text
    );
  }
}
