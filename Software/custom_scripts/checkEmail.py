#!/usr/bin/env python

#==========================================
# Title:  checkEmail.py
# Author: Pegor Karoglanian + https://bc-robotics.com/tutorials/sending-email-using-python-raspberry-pi/ (For Emailer class)
# Date:   7/1/22
# Notes:  This script runs continuously and is started by the email-check.service on boot.
#==========================================

import smtplib
import imaplib
import email
import time
import os

import emailConfig as CONFIG

from datetime import datetime, timezone
from urllib.request import urlopen
from pathlib import Path

#Email Variables
SMTP_SERVER         = 'smtp.gmail.com' #Email Server (don't change!)
SMTP_PORT           = 587 #Server Port (don't change!)

GMAIL_USERNAME      = CONFIG.GMAIL_USERNAME
GMAIL_PASSWORD      = CONFIG.GMAIL_PASSWORD
ALLOWED_ADDRESS     = CONFIG.ALLOWED_ADDRESS
SECRET_PHRASE       = CONFIG.SECRET_PHRASE

TIME_THRESHOLD      = 10
RESPONSE_SUBJECT    = "GOT YOUR REQUEST"
RESPONSE_POUR       = "Pouring a shot now :)"
RESPONSE_WAIT       = "Looks like a shot has already been poured and waiting to be cleared. Try again later!"
RESPONSE_NOCUP      = "Look like the shot glass is not in place :( .Try again later!"
RESPONSE_UNK        = "UNKNOWN ERROR >:("

class Emailer:
    def checkNetwork(self):
        try:
            sysWifi = os.popen('sudo /var/www/custom_scripts/runRoot.sh checkOnline')
            return (sysWifi.read().split('\n')[0] == 'True')
        except: 
            return False

    def sendResponse(self, resp):
        #Create Headers
        headers = ["From: " + GMAIL_USERNAME, "Subject: " + RESPONSE_SUBJECT, "To: " + ALLOWED_ADDRESS,
        "MIME-Version: 1.0", "Content-Type: text/html"]
        headers = "\r\n".join(headers)

        #Connect to Gmail Server
        sendSession = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        sendSession.ehlo()
        sendSession.starttls()
        sendSession.ehlo()

        #Login to Gmail
        sendSession.login(GMAIL_USERNAME, GMAIL_PASSWORD)

        #Send Email & Exit
        sendSession.sendmail(GMAIL_USERNAME, ALLOWED_ADDRESS, headers + "\r\n\r\n" + resp)
        sendSession.quit

    def checkMail(self):
        readSession = imaplib.IMAP4_SSL('imap.gmail.com')
        readSession.login(GMAIL_USERNAME, GMAIL_PASSWORD)
        readSession.list()

        # Out: list of "folders" aka labels in gmail.
        readSession.select("inbox") # connect to inbox.
        result, data = readSession.uid('search', None, "UNSEEN") # search and return uids instead only for unread email.
        unread_count = len(data[0].split())
        if (unread_count == 0):
            # print("NO UNREAD MESSAGES")
            return False

        latest_email_uid = data[0].split()[-1]
        result, data = readSession.uid('fetch', latest_email_uid, '(RFC822)')

        raw_email = data[0][1]
        email_raw_message = email.message_from_bytes(raw_email)
        email_time = datetime.strptime(email_raw_message['Date'], "%a, %d %b %Y %H:%M:%S %z")
        right_now = datetime.now(timezone.utc)
        time_difference = right_now - email_time

        if ((time_difference.seconds/60) > TIME_THRESHOLD):
            # print("ERROR: Email is old!")
            return False
        
        from_address = email.utils.parseaddr(email_raw_message['From'])[1]

        if (from_address != ALLOWED_ADDRESS):
            # print("ERROR: Received email from invalid sender!")
            return False

        email_subject = email.utils.parseaddr(email_raw_message['Subject'])[1]

        if (email_subject != SECRET_PHRASE):
            # print("ERROR: Email doesn't have right secret phrase!")
            return False

        email_content = email_raw_message.get_payload(0).get_payload().split('\r\n')
        return(email_content[0])

#####################################################################################################################


emailChecker = Emailer()
delayBetweenChecks = 30  # seconds

while True:
    try:
        if (emailChecker.checkNetwork()):
            delayBetweenChecks = 30  # seconds
            newEmail = emailChecker.checkMail()
            respone = ""
            if (newEmail == False):
                print(False)
            else:
                shotFlag = '/var/www/flags/shot.flag'
                shotRemovedFlag = '/var/www/flags/shot_removed.flag'
                msgFile  = '/var/www/flags/msg.txt'
                glassFlag = '/var/www/flags/glass.flag'

                # Check whether the shot flag exists or not
                # this flag gets cleared when the displayed message is cleared.
                shotCheck = os.path.exists(shotFlag)

                #this flag gets cleared when the shot glass is taken out of the tray.
                shotCheck_2 = os.path.exists(shotRemovedFlag)

                # Check whether the shot glass is present
                glassCheck = os.path.exists(glassFlag)

                if not glassCheck:
                    emailChecker.sendResponse(RESPONSE_NOCUP)
                    print(False)
                elif not shotCheck and not shotCheck_2:
                    # Looks like a shot hasn't been poured yet so go ahead and pour and set the two flags
                    # and write the message to a file to be read by webui.
                    os.popen('sudo /var/www/custom_scripts/runRoot.sh pourShot &')

                    text_file = open(msgFile, "w")
                    newMsg = text_file.write(newEmail)
                    text_file.close()

                    Path(shotFlag).touch()

                    emailChecker.sendResponse(RESPONSE_POUR)
                    # start pouring shot!
                    # print("POURING A SHOT!")
                    print(newEmail)
                else:
                    emailChecker.sendResponse(RESPONSE_WAIT)
                    # print("Looks like a shot has already been poured. Waiting to clear the flag.")
        else:
            print("No network detected. Increasing delay before checking again.")
            delayBetweenChecks = 60 # seconds
    except OSError as err:
        print("OS error: {0}".format(err))
    except BaseException as err:
        print(f"Unexpected {err=}, {type(err)=}")

    time.sleep(delayBetweenChecks)