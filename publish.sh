mkdir to-publish
mkdir to-publish/other-css
mkdir to-publish/other-js
cp -r other-css to-publish
cp -r other-js to-publish
cp favicon.png to-publish
cp index.html to-publish
cp slides.css to-publish
cp slides.js to-publish
cp service-worker.js to-publish

surge to-publish https://hchiam-slides.surge.sh
surge to-publish https://simple-slides.surge.sh
