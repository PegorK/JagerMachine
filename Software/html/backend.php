<?php
  //==========================================
  // Title:  backend.php
  // Author: Pegor Karoglanian
  // Date:   7/1/22
  // Notes:  All ajax calls get routed through here.
  //==========================================

  // Call function depending on what frontend wants.
  if(isset($_POST['function']) && !empty($_POST['function'])) {
    $function = $_POST['function'];
    if(isset($_POST['parameter']) && !empty($_POST['parameter'])) {
      $parameter = $_POST['parameter'];
    }
    if(isset($_POST['parameter2']) && !empty($_POST['parameter2'])) {
      $parameters2 = $_POST['parameter2'];
    }
    switch($function) {
        case 'checkEmail': checkEmail();break;
        case 'checkGlass': checkGlass();break;
        case 'getAvailableWifi': getAvailableWifi();break;
        case 'refreshAvailableWifi': refreshAvailableWifi();break;
        case 'connectToWifi': connectToWifi($parameter);break;
        case 'getCurrentWifi': getCurrentWifi(); break;
        case 'clearMsg': clearMsg(); break;
        case 'checkOnline': checkOnline(); break;
        case 'setLedState': setLedState($parameter); break;
        case 'getLedState': getLedState(); break;
        case 'getPouringState': getPouringState(); break;
        case 'getIsShotPoured': getIsShotPoured(); break;
        case 'pourShot': pourShot(); break;
        case 'systemReboot': systemReboot(); break;
    }
  }

  function checkEmail() {
    $emailFlag = '/var/www/flags/shot.flag';

    if (file_exists($emailFlag)) {
      $command = escapeshellcmd('cat /var/www/flags/msg.txt');
      $output = shell_exec($command);
      echo $output;
    } else {
      echo "False";
    }
  }

  function checkGlass() {
    $glassFlag = '/var/www/flags/glass.flag';

    if (file_exists($glassFlag)) {
      echo "True";
    } else {
      echo "False";
    }
  }

  function getAvailableWifi() {
    $command = escapeshellcmd('cat ../custom_scripts/wifiNames.json');
    $output = shell_exec($command);
    echo json_encode($output);
  }

  function refreshAvailableWifi() {
    $command = escapeshellcmd('sudo ../custom_scripts/runRoot.sh updateWifiList');
    $output = shell_exec($command);
    echo $output;
  }

  function connectToWifi($options) {
    $command = escapeshellcmd("sudo ../custom_scripts/runRoot.sh loginWifi \"$options[ssid]\" \"$options[bssid]\" \"$options[psk]\"");
    $output = shell_exec($command);
    echo $output;
    // echo  $command;
  }

  function getCurrentWifi() {
    $command = escapeshellcmd("sudo ../custom_scripts/runRoot.sh getWifi");
    $output = shell_exec($command);
    echo $output;
  }

  function clearMsg() {
    $command = escapeshellcmd("sudo ../custom_scripts/runRoot.sh clearMsg");
    $output = shell_exec($command);
    echo "Done";
  }

  function checkOnline() {
    $command = escapeshellcmd("sudo ../custom_scripts/runRoot.sh checkOnline");
    $output = shell_exec($command);
    echo $output;
  }

  function setLedState($parameter) {
    $command = escapeshellcmd("sudo ../custom_scripts/runRoot.sh setLedState \"$parameter\"");
    $output = shell_exec($command);
    echo $output;
  }

  function getLedState() {
    $ledFlag = '/var/www/flags/ledEnabled.flag';

    if (file_exists($ledFlag)) {
      echo "True";
    } else {
      echo "False";
    }
  }

  function getPouringState() {
    $pouringFlag = '/var/www/flags/pouring.flag';

    if (file_exists($pouringFlag)) {
      echo "True";
    } else {
      echo "False";
    }
  }

  function getIsShotPoured() {
    $flag = '/var/www/flags/shot_removed.flag';

    if (file_exists($flag)) {
      echo "True";
    } else {
      echo "False";
    }
  }

  function pourShot() {
    system("sudo ../custom_scripts/runRoot.sh pourShot > /dev/null 2>&1 &");
    echo "Done";
  }

  function systemReboot() {
    system("sudo ../custom_scripts/runRoot.sh systemReboot");
    echo "Done";
  }
?>
