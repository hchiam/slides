rm -rf to-publish
mkdir to-publish

bash bash-scripts/minify.sh

cp minified.css to-publish/minified.css
cp minified.js to-publish/minified.js

cp favicon.png to-publish
cp index.html to-publish

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

  # run tests and local test site in parallel:
  parcel index.html & yarn test-cli-locally && fg

fi
