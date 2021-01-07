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

  yarn test-cli

else
  echo
  echo "Can't update test site. Running test locally."
  echo

  parcel index.html

  # TODO: how run this in parallel with parcel command?
  # yarn test-cli
  # TODO: how make cypress use http://localhost:1234 ?

fi
