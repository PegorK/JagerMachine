#!/bin/bash

#==========================================
# Title:  bootCheck.sh
# Author: Pegor Karoglanian
# Date:   7/1/22
# Notes:  This script is called from boot_complete.service on startup.
#==========================================

while $(sleep 1); do
  if systemctl is-system-running | grep -qE "running|degraded"; then
    break
  fi
done

logger "systemd finished booting..."

sleep 16 #wait a little more and kill the led ring
sudo systemctl stop led_boot.service

#start the service again to turn off all LEDs
sudo systemctl start led_boot.service

# other stuff to perform.
# clear LED in use flag if set.
rm -rf /var/www/flags/ledInUse.flag

exit 0