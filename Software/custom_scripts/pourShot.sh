#!/bin/bash

#==========================================
# Title:  pourShot.sh
# Author: Pegor Karoglanian
# Date:   7/1/22
# Notes:  This script gets called when a shot is going to be poured.
#         It can either be called from the checkEmail.py script or when a user clicks to manually pour a shot.
#==========================================

# select pin
GPIO=15
GLASS_FLAG=/var/www/flags/glass.flag
POURING_FLAG=/var/www/flags/pouring.flag
SHOT_REMOVED_FLAG=/var/www/flags/shot_removed.flag

on=0;
off=1;

setPump()
{
  echo "$1" > /sys/class/gpio/gpio"${GPIO}"/value
}

stopAndQuit()
{
  setPump $off
  rm -rf $POURING_FLAG
  echo "Cancelled"
  exit 0
}

trap stopAndQuit SIGINT

if test -f "$POURING_FLAG"; then
  exit 0
fi

if test -f "$SHOT_REMOVED_FLAG"; then
  exit 0
fi

# prepare the pin
if [ ! -d /sys/class/gpio/gpio${GPIO} ]; then
  echo "${GPIO}" > /sys/class/gpio/export
fi

# set as output
echo "out" > /sys/class/gpio/gpio"${GPIO}"/direction

# make sure it's off!
setPump $off

# set the flag that it's pouring
touch $POURING_FLAG

# set the flag that a shot has been poured. (This one gets cleared when the glass is removed)
touch $SHOT_REMOVED_FLAG

for (( t=1; t<= 190; t++ ))
do  
    if test -f "$GLASS_FLAG"; then
        setPump $on
        sleep 0.1
    else
        stopAndQuit
    fi
done


setPump $off
rm -rf $POURING_FLAG
echo "Done"
exit 0