#!/usr/bin/env python3

#==========================================
# Title:  bootLed.py
# Author: Pegor Karoglanian
# Date:   7/1/22
# Notes:  This script starts up the boot LED sequence until boot is complete.
#==========================================


import sys
import board
import neopixel
import time
import os 
import random

LEDs = 12
ledRing = neopixel.NeoPixel(board.D18, LEDs)

ledTail_1 = 0
ledTail_2 = 0
ledOff = 0

bootComplete = os.popen('systemctl is-system-running')
bootComplete = bootComplete.read().strip()
if bootComplete == "degraded" or bootComplete == "running":
    for y in range(10):
        for x in range(LEDs):
            r_r = random.randint(0, 200)
            r_g = random.randint(0, 200)
            r_b = random.randint(0, 200)
            ledRing[x]    = (r_r, r_g, r_b)
            time.sleep(0.01)

    for y in range(20):
        for x in range(LEDs):
            ledRing[x]    = (0, 255-(y*13), 0)
        time.sleep(0.03)
    for x in range(LEDs):
        ledRing[x] = (0, 0, 0) 
else:
    while True:
        for x in range(LEDs):
            ledRing[ledOff]    = (0, 0, 0)
            ledRing[ledTail_2] = (0, 102, 0)
            ledRing[ledTail_1] = (0, 153, 0)
            ledRing[x]         = (0, 204, 0)

            ledTail_1 = x
            ledTail_2 = x - 1
            if (ledTail_1 == -1):
                ledTail_1 = 11

            ledOff = x - 2
            if (ledTail_2 == -1):
                ledTail_2 = 11
            elif (ledTail_2 == -2):
                ledTail_2 = 10
            time.sleep(0.06)