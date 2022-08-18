#!/usr/bin/env python3

#==========================================
# Title:  runLed.py
# Author: Pegor Karoglanian
# Date:   7/1/22
# Notes:  This script handles what LED show to put on.
#==========================================

import os
import sys
import board
import neopixel
import time
import random
from pathlib import Path

def glassRemoved():
    for y in range(20):
        for x in range(LEDs):
            ledRing[x]    = ((y*13), 0, 0)
        time.sleep(0.02)
    time.sleep(1)
    for y in range(20):
        for x in range(LEDs):
            ledRing[x]    = (255 - (y*13), 0, 0)
        time.sleep(0.02)
    for x in range(LEDs):
        ledRing[x] = (0, 0, 0)

def glassDetected():
    for y in range(20):
        for x in range(LEDs):
            ledRing[x]    = (0, (y*13), 0)
        time.sleep(0.02)
    time.sleep(1)
    for y in range(20):
        for x in range(LEDs):
            ledRing[x]    = (0, 255-(y*13), 0)
    for x in range(LEDs):
        ledRing[x] = (0, 0, 0)

def pourShot():
    ledTail_1 = 0
    ledTail_2 = 0
    ledOff = 0
    
    for t in range(135):
        for x in range(LEDs):
            if(os.path.exists(glassFlag)):
                r_r = random.randint(0, 200)
                r_g = random.randint(0, 200)
                r_b = random.randint(0, 200)
                ledRing[x]    = (r_r, r_g, r_b)
                time.sleep(0.01)
            else:
                os.remove(ledInUseFlag)
                quit()


    time.sleep(1)
    for y in range(20):
        for x in range(LEDs):
            ledRing[x] = (100-(y*5), 255-(y*13), 100-(y*5))
        time.sleep(0.02)
    for x in range(LEDs):
        ledRing[x] = (0, 0, 0)



# only one argument for now.
try:
    ledCmd = sys.argv[1]
    # print(ledCmd)
except:
    print("Command not passed in!")
    quit()


ledEnabledFlag = '/var/www/flags/ledEnabled.flag'

ledInUseFlag = '/var/www/flags/ledInUse.flag'

glassFlag = '/var/www/flags/glass.flag'

# Check whether leds are enabled.
ledEnabledCheck = os.path.exists(ledEnabledFlag)

# check if an LED display is already in progress,
# if it is don't bother to start a new sequence.
ledInUseCheck = os.path.exists(ledInUseFlag)

if not ledEnabledCheck:
    # print("LED NOT ENABLED!")
    quit()

if ledInUseCheck:
    # print("LED IN USE!")
    quit()


#set flag that it is in use.
Path(ledInUseFlag).touch()

LEDs = 12
ledRing = neopixel.NeoPixel(board.D18, LEDs)
# make sure all are off.
for x in range(LEDs):
    ledRing[x]    = (0, 0, 0)   

if ledCmd == "glassRemoved":
    glassRemoved()
elif ledCmd == "glassDetected":
    glassDetected()
elif ledCmd == "pourShot":
    pourShot()
else:
    print("What. You can't be here.")
    #hmm how'd ya get here?!

# clear flag to allow other sequences.
os.remove(ledInUseFlag)