# concatenate so parcel works
cat other-css/*.css slides.css > concatenated.css 
cat other-js/*.js slides.js > concatenated.js

# mv concatenated.css minified.css
# mv concatenated.js minified.js

minify concatenated.css > minified.css
minify concatenated.js > minified.js
rm concatenated.css
rm concatenated.js
