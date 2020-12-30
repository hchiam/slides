mkdir to-publish
rm to-publish/*
mkdir to-publish/other-css
mkdir to-publish/other-js

# cp -r other-css to-publish
# cp -r other-js to-publish
bash minify.sh

cp minified.css to-publish/minified.css
cp minified.js to-publish/minified.js

cp favicon.png to-publish
cp index.html to-publish
cp slides.css to-publish
cp slides.js to-publish

surge to-publish https://test-slides.surge.sh/
