touch temp.html

awk '/start of automated script paste/ { t=1; print; } 
     /end of automated script paste/   { t=0 } 
     t==0 { print } ' index.html > temp.html

mv temp.html index.html

awk '/start of automated style paste/ { t=1; print; } 
     /end of automated style paste/   { t=0 } 
     t==0 { print } ' index.html > temp.html

mv temp.html index.html
