var usePlugins = false;
var useTextPlugins = usePlugins;
var useImagePlugins = usePlugins;

var pluginCallbacksToParseTexts = [];
var pluginCallbacksToParseImages = [];

function runTextPluginsWhenTextUpdated(textElement, internalCallback) {
  if (!usePlugins || !useTextPlugins) return;
  pluginCallbacksToParseTexts.forEach(function (cb) {
    cb(textElement);
  });
  if (internalCallback) internalCallback(textElement);
  console.log("text plugins");
}

function runImagePluginsWhenImageCreated(imageElement, internalCallback) {
  if (!usePlugins || !useImagePlugins) return;
  pluginCallbacksToParseTexts.forEach(function (cb) {
    cb(imageElement);
  });
  if (internalCallback) internalCallback(imageElement);
  console.log("image plugins");
}
