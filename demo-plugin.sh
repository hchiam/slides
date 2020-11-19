mkdir to-publish
mkdir to-publish/other-css
mkdir to-publish/other-js
cp -r other-css to-publish
cp -r other-js to-publish
cp plugin-demo.html to-publish
cp slides.css to-publish
cp slides.js to-publish

mv to-publish/plugin-demo.html to-publish/index.html

surge to-publish https://test-slides.surge.sh
