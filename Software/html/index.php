<?php require "backend.php"; ?>
<!DOCTYPE html>
<html>
  <head>
    <title>
      JagerMachine
    </title>
    <link href="css/styles.css?v=3.31" rel="stylesheet">
    <link href="css/peyBoardStyles.css?v=128" rel="stylesheet">
    <script src="jquery/jquery.min.js" type="text/javascript"></script>
    <script src="jquery/jquery-ui.min.js" type="text/javascript"></script>
  </head>
  <body onclick="resetScreenSaverTimer()">
    <div id="statusBar">
      <div class="statusBarDate" id="currentDate"></div>
      <div class="statusBarTime" id="currentTime"></div>
      <div class="statusBarGlassOff" id="glassStatus"></div>
      <div class="statusBarWifiOff" id="wifiStatus"></div>
    </div>
    <div id="shotMsg" class="spinnerBackground">
      <div class="msgIcon"></div>
      <div id="msgText" class="emailMsg">No Messages</div>
      <div id="msgTextDate" class="emailMsgDate"></div>
      <button id="closeMsgButton" type="button" class="closeButton" onclick="closeMsg()">Close</button>
    </div>
    <div id="mainSettingsPage" class="settingsPage">
      <div class="menuHeader">
        <div class="backButton" onclick="closeSettings('main')"></div>
        <div class="menuTitle">Settings</div>
      </div>
      <div class="settingsItem" onclick="openSettings('wifi')">
        <div class="settingsItemTitle">Wi-Fi Setup</div>
        <div class="settingsItemStatus" style="font-weight: bold;" id="wifiStatusMenu">Not Connected</div>
      </div>
      <div class="settingsItem" onclick="setLedState()">
        <div class="settingsItemTitle">LEDs</div>
        <div class="settingsItemStatus buttonOff" id="ledStatusMenu"></div>
      </div>
      <div class="settingsItem" onclick="openSettings('about')">
        <div class="settingsItemTitle">About</div>
      </div>
      <div class="settingsItem" onclick="openSettings('reboot')">
        <div class="settingsItemTitle">Reboot</div>
      </div>
      <div class="settingsItem" onclick="refreshPage()">
        <div class="settingsItemTitle">Refresh</div>
      </div>
    </div>
    <div id="wifiSettingsPage" class="settingsPage">
      <div class="menuHeader">
        <div class="backButton" onclick="closeSettings('wifi')"></div>
        <div class="menuTitle">Wi-Fi Setup</div>
        <div class="refreshButton" onclick="refreshWifi()"></div>
      </div>
      <div id="loadingSpinnerWifi" class="spinnerBackground">
        <div class="loadingSpinner"></div>
        <div class="overlayMsg">Scanning...</div>
      </div>
      <div class="settingsItemList" id="availableConnections"></div>
    </div>
    <div id="selectedWifiPage" class="settingsPage">
      <div class="menuHeader">
        <div class="backButton" onclick="closeSettings('wifi-select')"></div>
        <div class="menuTitle" id="wifiSelectTitle"></div>
      </div>
      <div class="settingsItem">
        <div class="networkInfo">
          <div id="freqTitle">Frequency:</div>
          <div id="wifiSelectFreq"></div>
        </div>
        <div class="networkInfo">
          <div>MAC:</div>
          <div id="wifiSelectMac"></div>
        </div>
        <div class="settingsItemContent">    
          <label style="display: block; font-weight: bold; font-size:20px;" for="wifiPassword">Password:</label>
          <input style="display: block; font-size: 28px; user-select:none;" disabled type="password" id="wifiPassword" name="password" required>
          <input type="checkbox" id="showPassword" onclick="showPassword()">
          <label for="showPassword">Show Password</label>
        </div>
        <div class="settingsItemContent">
          <button id="connectButton" type="button" class="connectWifiButton" onclick="connectToWifi()" disabled>Connect</button>
        </div>
      </div>
      <div id="wifiKeyboard"></div>
    </div>
    <div id="aboutPage" class="settingsPage">
      <div class="menuHeader">
        <div class="backButton" onclick="closeSettings('about')"></div>
        <div class="menuTitle">About</div>
      </div>
      <div class="settingsItem">
        -- Made by Pegor Karoglanian (devPegor@gmail.com)
        <br>
        v.1.1.0
      </div>
    </div>
    <div id="loadingSpinner" class="spinnerBackground">
      <div class="loadingSpinner"></div>
    </div>
    <div id="successMsg" class="spinnerBackground">
      <div class="successIcon"></div>
      <div class="overlayMsg">SUCCESS!</div>
    </div>
    <div id="errorMsg" class="spinnerBackground">
      <div class="errorIcon"></div>
      <div class="overlayMsg">ERROR! <br> Please check credentials and try again.</div>
    </div>
    <div id="manualPourAlert" class="spinnerBackground">
      <div class="overlayMsgTop">Are you sure you would like to pour a shot?</div>
      <div class="buttonContainer">
          <button type="button" class="buttonAccept" onclick="pourShot(true)" >YES</button>
          <button type="button" class="buttonCancel" onclick="pourShot(false)" >CANCEL</button>
      </div>
    </div>
    <div id="rebootAlert" class="spinnerBackground">
      <div class="overlayMsgTop">Are you sure you would like to reboot the system?</div>
      <div class="buttonContainer">
          <button type="button" class="buttonAccept" onclick="systemReboot(true)" >YES</button>
          <button type="button" class="buttonCancel" onclick="systemReboot(false)" >CANCEL</button>
      </div>
    </div>
    <div id="shotPourAlert" class="spinnerBackground">
      <div id = "pourAlertMsg" class="overlayMsgTop">Please take the shot before pouring another!</div>
      <div class="buttonContainer">
          <button type="button" class="buttonAccept" onclick="hideShotPourAlert()" >Ok</button>
      </div>
    </div>
    <div id="manualPourMsg" class="spinnerBackground">
      <div class="loadingSpinner"></div>
      <div class="overlayMsg">POURING! <br> Please wait...</div>
    </div>
    <div id="screenSaver">
      <div id="screenSaverContent"></div>
    </div>
    <div id="mainScreen">
      <table id="buttonsTable">
        <tr>
          <td>
            <div class="icon" id="pour" onclick="touchAction('pour')">
              <span class="shotIcon"> </span>
            </div>
          </td>
        </tr>
        <tr>
          <td>
            <div class="icon" id="msgHistory" onclick="touchAction('history')">
              <span class="msgHistoryIcon"></span>
            </div>
          </td>
        </tr>
        <tr>
          <td>
            <div class="icon" id="settings" onclick="touchAction('settings')">
              <span class="settingsIcon"> </span>
            </div>
          </td>
        </tr>
      </table>
    </div>
  </body>
</html>
<script src="javascript/peyBoard_alpha.js" type="text/javascript"></script>
<script src="javascript/jagerMachine.js" type="text/javascript"></script>

