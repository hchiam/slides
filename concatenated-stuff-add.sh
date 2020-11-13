touch concatenated.js concatenated.css temp.js temp.html

cat other-js/makeElementDraggable.js other-js/makeElementDraggableAndEditable.js other-js/debug.js other-js/texts.js other-js/images.js other-js/memory.js slides.js > concatenated.js
cat other-css/boilerplate.css slides.css > concatenated.css

# startWith='console.log("concatenated script ran")'
# echo -e $startWith >> temp.js
# cat concatenated.js >> temp.js
# mv temp.js concatenated.js

minify concatenated.js > minified.txt
# cp concatenated.js minified.txt

startWith='<textarea id="saved_script_only">console.log("concatenated script ran");'
endWith='</textarea>\n'
echo -e -n $startWith >> temp.js
cat minified.txt >> temp.js
echo -e -n $endWith >> temp.js
mv temp.js minified.txt

awk '/start of automated script paste/ { t=1; print; system("cat minified.txt"); } 
     /end of automated script paste/   { t=0; } 
     t==0 { print } ' index.html > temp.html

mv temp.html index.html

awk '/start of automated style paste/ { t=1; print; system("cat concatenated.css"); } 
     /end of automated style paste/   { t=0 } 
     t==0 { print } ' index.html > temp.html

mv temp.html index.html

rm concatenated.js minified.txt concatenated.css
