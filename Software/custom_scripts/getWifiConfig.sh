#!/bin/bash

#==========================================
# Title:  getWifiConfig.sh
# Author: Pegor Karoglanian
# Date:   7/1/22
# Notes:  This script is called from wifi-check.service on startup.
#         It is used to see if a wifi configuration is saved on the usb flash drive.
#==========================================

sudo cp /mnt/usb0/wpa_supplicant.conf /etc/wpa_supplicant/
if [ $? -eq 0 ]; then
    sudo wpa_supplicant -B -c /etc/wpa_supplicant/wpa_supplicant.conf -i wlan0  > /dev/null 2>&1
else
   logger "No config file found on storage."
fi

exit 0