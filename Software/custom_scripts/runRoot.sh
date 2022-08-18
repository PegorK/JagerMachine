#!/bin/bash

#==========================================
# Title:  runRoot.sh
# Author: Pegor Karoglanian
# Date:   7/1/22
# Notes:  This script has root permissions.
#         It is used to call other scripts as root!
#==========================================

case $1 in

  updateWifiList)
    python3 /var/www/custom_scripts/checkWifi.py
    ;;

  loginWifi)
    /var/www/custom_scripts/connectToWifi.sh "$2" "$3" "$4"
    ;;
  
  getWifi)
    iwconfig wlan0 | sed -n 's/.*Access Point: \([0-9\:A-F]\{17\}\).*/\1/p'
    ;;
  
  clearMsg)
    rm -rf /var/www/flags/shot.flag
    rm -rf /var/www/flags/msg.txt
    ;;

  checkOnline)
    wget -q --spider -T 5 http://google.com
    if [ $? -eq 0 ]; then
      echo "True"
    else
      echo "False"
    fi
    ;;
  setLedState)
    if [ "$2" = true ]; then
      touch /var/www/flags/ledEnabled.flag
    else
      rm -rf /var/www/flags/ledEnabled.flag
    fi
    echo "Done"
    ;;
  runLed)
    python3 /var/www/custom_scripts/runLed.py $2
    ;;
  pourShot)
    python3 /var/www/custom_scripts/runLed.py pourShot &
    /var/www/custom_scripts/pourShot.sh &
    ;;
  systemReboot)
    shutdown -r now
    ;;
  *)
    echo -n "error: command not found"
    ;;
esac

exit 0