const SW_VERSION = "slides-sw-version-1"; // also can serve as cache name

const appShellURLs = [
  "https://fonts.googleapis.com/icon?family=Material+Icons&display=swap",
  "https://cdn.jsdelivr.net/gh/hchiam/draggable@3.3.2/makeElementDraggableAndEditable.js",
  "https://cdn.jsdelivr.net/gh/hchiam/_2DNote@1.12.0/_2DNote.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/localforage/1.9.0/localforage.min.js",
  "/other-css/boilerplate.css",
  "/other-js/debug.js",
  "/other-js/plugins.js",
  "/other-js/a11y.js",
  "/other-js/texts.js",
  "/other-js/images.js",
  "/other-js/fullscreen.js",
  "/other-js/laser.js",
  "/slides.css",
  "/other-js/memory.js",
  "/slides.js",
  // "/manifest.webmanifest",
];

// when install service worker:
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SW_VERSION).then((cache) => {
      // console.log('Service worker installing.')
      // cache app shell URLs/resources:
      return cache.addAll(appShellURLs);
    })
  );
});

// when activate service worker:
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys() // cache names (caches)
      .then((cacheKeys) => {
        // cache entries (keys/entries in a single cache)
        const oldKeys = cacheKeys.filter(
          (key) => key.indexOf(SW_VERSION) !== 0
        );
        // promise to delete all old keys in this cache:
        const promisesToDeleteOldKeys = oldKeys.map((oldKey) =>
          caches.delete(oldKey)
        );
        // don't continue until ALL old keys are deleted:
        return Promise.all(promisesToDeleteOldKeys);
      })
  );
});

// when a resource fetch can be intercepted by service worker:
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  const wantAppShellResource = appShellURLs.indexOf(url.pathname) !== -1;
  const navigatingToPage = event.request.mode === "navigate";
  if (wantAppShellResource) {
    event.respondWith(
      caches
        .match(event.request)
        .then((response) => {
          if (!response) {
            throw new Error(event.request + " not found in cache");
          }
          // console.log(`Service worker fetching resource even though you're offline: ${url}`);
          // get resource from cache:
          return response;
        })
        .catch((error) => {
          // fetch resource from network if not in cache:
          fetch(event.request);
        })
    );
  } else if (navigatingToPage) {
    event.respondWith(
      fetch(event.request).catch((error) => {
        return caches.open(SW_VERSION).then((cache) => {
          // console.log(`Service worker fetching page even though you're offline: ${url}`);
          // get page from cache:
          return cache.match("index.html");
        });
      })
    );
  }
});
