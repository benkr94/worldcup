#!/bin/bash

SIZE=23;
count=0;

for i in BR HR MX CM ES NL CL AU CO GR CI JP UY CR England IT CH EC FR HN AR BA IR NG DE PT GH US BE DZ RU KR; do
    if [ "$i" = "England" ] ; then
	url="http://upload.wikimedia.org/wikipedia/en/thumb/b/be/Flag_of_England.svg/25px-Flag_of_England.svg.png"
    else
	url="http://www.bigee.net/static/content/flags/24x16/$i.png"
    fi	
    `wget -O $count.png $url`;
    ((count++))
done
