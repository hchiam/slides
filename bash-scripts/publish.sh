echo "Did you test manually on the test side?"
echo "(Some bugs only happen in prod site.)"
read -p "Confirm (y): " input

if [[ $input != "y" ]]
then
  exit
fi

rm -rf to-publish
mkdir to-publish

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
