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

if surge to-publish https://hchiam-slides.surge.sh && surge to-publish https://simple-slides.surge.sh
then
  echo
  echo "Published."
  echo
else
  echo
  echo "Sorry, you can't publish to the live site(s)."
  echo
fi
