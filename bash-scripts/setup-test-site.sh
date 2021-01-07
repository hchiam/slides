rm -rf to-publish
mkdir to-publish
mkdir to-publish/other-css
mkdir to-publish/other-js

# cp -r other-css to-publish
# cp -r other-js to-publish
bash bash-scripts/minify.sh

cp minified.css to-publish/minified.css
cp minified.js to-publish/minified.js

cp favicon.png to-publish
cp index.html to-publish
cp slides.css to-publish
cp slides.js to-publish

if surge to-publish https://test-slides.surge.sh
then
  echo
  echo "Updated test site."
  echo
else
  echo
  echo "Can't update test site. Consider running test site locally."
  echo
fi
