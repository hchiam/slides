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

read -p "Are you @hchiam? (y/n) " input

# TODO: change this code to detect surge permissions and run parcel locally

if [[ -z "$input" ]] || [[ $input == "y" ]]
then
  surge to-publish https://test-slides.surge.sh
else
  echo
  echo "Editing your package.json to disable the pre-commit script (commenting it out with a # character)."
  echo
  sed -i '' 's/"test-pre-commit":\ "/"test-pre-commit":\ "#/g' package.json
fi
