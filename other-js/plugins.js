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
}

function runImagePluginsWhenImageCreated(imageElement, internalCallback) {
  if (!usePlugins || !useImagePlugins) return;
  pluginCallbacksToParseTexts.forEach(function (cb) {
    cb(imageElement);
  });
  if (internalCallback) internalCallback(imageElement);
}

window.usePlugins = usePlugins;
window.useTextPlugins = useTextPlugins;
window.useImagePlugins = useImagePlugins;
window.pluginCallbacksToParseTexts = pluginCallbacksToParseTexts;
window.pluginCallbacksToParseImages = pluginCallbacksToParseImages;
