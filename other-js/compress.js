function compressString(plainTextString) {
  if (isBase64String(plainTextString)) {
    return LZString.compress(plainTextString);
  } else {
    return plainTextString; // might already be compressed
  }
}

function decompressString(compressedString) {
  if (!isBase64String(compressedString)) {
    return LZString.decompress(compressedString);
  } else {
    return compressedString; // might already be de-compressed
  }
}

function isBase64String(string) {
  return string.startsWith("data:image/png;base64,");
}
