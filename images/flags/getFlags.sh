#!/bin/bash

SIZE=23;
count=0;

for i in Brazil Croatia Mexico Cameroon Spain the_Netherlands Chile Australia Colombia Greece Côte_d\'Ivoire Japan Uruguay Costa_Rica England Italy Switzerland Ecuador France Honduras Argentina Bosnia_and_Herzegovina Iran Nigeria Germany Portugal Ghana the_United_States "Belgium_(civil)" Algeria Russia South_Korea; do
    case $i in
        Brazil)
            size=22
            ;;
        Switzerland)
            size=16
            ;;
        *)
            size=$SIZE
            ;;
    esac
    flag="Flag_of_$i.svg"
    md5=`echo -n $flag | md5sum`
    url="http://upload.wikimedia.org/wikipedia/commons/thumb/${md5:0:1}/${md5:0:2}/$flag/${size}px-$flag.png"
    `wget -O $count.png $url`;
    ((count++))
done
