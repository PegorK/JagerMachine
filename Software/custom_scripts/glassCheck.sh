#!/bin/bash

#==========================================
# Title:  glassCheck.sh
# Author: Pegor Karoglanian
# Date:   7/1/22
# Notes:  This script runs continuously and is started by glass_check.service
#==========================================

# select pin
GPIO=14
currentState=false

# prepare the pin
if [ ! -d /sys/class/gpio/gpio${GPIO} ]; then
  echo "${GPIO}" > /sys/class/gpio/export
fi
echo "in" > /sys/class/gpio/gpio"${GPIO}"/direction

# set initial state
if [ 1 == "$(</sys/class/gpio/gpio"${GPIO}"/value)" ]; then
  currentState=false
else
  currentState=true
fi

# continuously monitor current value
while true; do
  if [ 1 == "$(</sys/class/gpio/gpio"${GPIO}"/value)" ]; then
    rm -rf /var/www/flags/glass.flag
    rm -rf /var/www/flags/shot_removed.flag
    if [ "$currentState" = true ] ; then
      python3 /var/www/custom_scripts/runLed.py glassRemoved
      currentState=false
      # logger "Glass Removed"
      # echo "Glass Removed"
    fi
  else
    touch /var/www/flags/glass.flag
    if [ "$currentState" = false ] ; then
      python3 /var/www/custom_scripts/runLed.py glassDetected
      currentState=true
      # logger "Glass Detected"
      # echo "Glass Detected"
    fi
  fi

  sleep 0.25
done