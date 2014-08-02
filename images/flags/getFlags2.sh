#!/bin/bash

SIZE=24;
count=0;

for i in Brazil Croatia Mexico Cameroon Spain Netherlands Chile Australia Colombia Greece Cote-dIvoire Japan Uruguay Costa-Rica England Italy Switzerland Ecuador France Honduras Argentina Bosnia-and-Herzegovina Iran Nigeria Germany Portugal Ghana United-States Belgium Algeria Russia South-Korea; do
    cp ~/Documents/flags/shiny/$SIZE/$i.png $count.png
    ((count++))
done
