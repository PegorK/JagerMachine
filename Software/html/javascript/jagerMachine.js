//==========================================
// Title:  jagerMachine.js
// Author: Pegor Karoglanian
// Date:   7/1/22
// Notes:  This javascript handles almost all the functions for the UI.
//==========================================

var _availableWifi = new Array();
var _pBoard = new PeyBoard_alpha("wifiKeyboard", "wifiPassword", opts = {});
var _time = null;

var _selectedWifi = {ssid:"", bssid:""};
var _connectedWifi = "";
var _ledState = false;
var _hasGlass = false;

var _screenSaverTimer = null;

const _screenSaverDelay       = 300000;// 5 min
const _checkOnlineTimeout     = 5000;  // 5 seconds
const _updateTimeTimeout      = 60000; // 60 seconds
const _checkEmailTimeout      = 1000;  // 1 second
const _checkGlassTimeout      = 1000;  // 1 second
const _pourShotTimeout        = 1000;  // 1 second
const _getPouringStateTimeout = 500;   // 0.5 second
const _touchActionTimeout     = 100;   // 0.1 second
const _connectSuccessTimeout  = 1500;  // 1.5 seconds
const _connectFailTimeout     = 2500;  // 2.5 seconds

// Drinks shall be had.
initPage();

function initPage() {
    getCurrentWifi();
    checkOnline();  // start network check if online
    updateTime();   // start clock
    checkEmail();   // start checking email
    checkGlass();   // start checking if shot glass is present
    getLedState();
    resetScreenSaverTimer();
}

function checkWifiPassword() {
    if($("#wifiPassword").val().length == 0) {
        $("#connectButton").prop( "disabled", true );
    } else {
        $("#connectButton").prop( "disabled", false );
    }
}

function createWifiList(availableWifiConnections) {
    _availableWifi = availableWifiConnections;
    var connectionList = "";

    if(_availableWifi == null) {
        return;
    }

    for (var x = 0; x<availableWifiConnections.length; x ++ ) {
        if (availableWifiConnections[x].essid == "") {
            continue;
        }
        var signal = Math.round((parseInt(availableWifiConnections[x].signal_quality) / parseInt(availableWifiConnections[x].signal_total)*100));        
        var signalClass = "weakWifiSignal";
        if (signal >= 70) {
            signalClass = "strongWifiSignal";
        } else if (signal >= 40) {
            signalClass = "mediumWifiSignal";
        }

        var wifiName = availableWifiConnections[x].essid;
        if(wifiName.length > 20) {
            wifiName = wifiName.substring(0, 17) + "...";
        }

        if(_connectedWifi == availableWifiConnections[x].mac) {
            var firstItem = ""; //Set the connected to top of list;
            firstItem += "<div id='connectedWifi' class='connectionItem activeConnection' onclick='expandWifiConnection("+ x +")'>";
            firstItem +=   "<div class='wifiSignalBase "+ signalClass +"'></div>";
            firstItem +=   "<div class='connectionName'>" + wifiName + "</div>";
            firstItem +=   "<div id='connectedWifiString' class='connectedString'>CONNECTED</div>";
            firstItem += "</div>";
            connectionList = firstItem + connectionList;
        } else {
            connectionList += "<div class='connectionItem' onclick='expandWifiConnection("+ x +")'>";
            connectionList +=   "<div class='wifiSignalBase "+ signalClass +"'></div>";
            connectionList +=   "<div class='connectionName'>" + wifiName + "</div>";
            connectionList += "</div>";
        }
    }
    var generateWifiListHtml = "<div class='connectionList'>";
    generateWifiListHtml += connectionList;
    generateWifiListHtml += "</div>";
    $("#availableConnections").html(generateWifiListHtml);
}

function expandWifiConnection(conn) {
    $("#wifiPassword").val('')
    var selectedWifi = _availableWifi[conn];
    var name = selectedWifi.essid;
    if (name.length > 20) {
        name = name.substring(0, 17) + "...";
    }
    $("#wifiSelectTitle").html(name);
    if (selectedWifi.frequency) {
        $("#freqTitle").show();
        $("#wifiSelectFreq").show();
        $("#wifiSelectFreq").html(selectedWifi.frequency + " " + selectedWifi.frequency_units);
    } else {
        $("#freqTitle").hide();
        $("#wifiSelectFreq").hide();
    }
    $("#wifiSelectMac").html(selectedWifi.mac);

    _selectedWifi.ssid = selectedWifi.essid;
    _selectedWifi.bssid = selectedWifi.mac;

    openSettings("wifi-select");
}

function checkOnline() {
    //check the network status and update icon accordingly
    $.ajax({ url: 'backend.php',
        data: {function: 'checkOnline'},
        type: 'POST',
        success: function(output) {
                    if(output.trim() == "True") {
                        $("#wifiStatus").removeClass("statusBarWifiOffline");
                        $("#wifiStatus").addClass("statusBarWifiOn");

                        $("#connectedWifi").removeClass("networkIssues");
                        $("#connectedWifiString").html("CONNECTED");

                        $("#wifiStatusMenu").html("Connected");
                    } else if ((output.trim() == "False") && (_connectedWifi !="")) {
                        $("#wifiStatus").removeClass("statusBarWifiOn");
                        $("#wifiStatus").addClass("statusBarWifiOffline");

                        $("#connectedWifi").addClass("networkIssues");
                        $("#connectedWifiString").html("NO INTERNET");

                        $("#wifiStatusMenu").html("Connected - No Internet");
                    } else {
                        $("#wifiStatus").removeClass("statusBarWifiOn");
                        $("#wifiStatus").removeClass("statusBarWifiOffline");
                        $("#wifiStatusMenu").html("Not Connected");
                    }
                },
        error: function (ajaxContext) {
                console.error("Something bad happened");
            },
    });
    setTimeout(checkOnline, _checkOnlineTimeout);
}

function updateTime() {
    _time = new Date();
    $("#currentTime").html(_time.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }));
    $("#currentDate").html(_time.toLocaleDateString('en-US'));

    setTimeout(updateTime, _updateTimeTimeout);
}

function checkEmail() {
    $.ajax({ url: 'backend.php',
        data: {function: 'checkEmail'},
        type: 'POST',
        success: function(output) {
                    if(output == "False") {
                        // console.log("No msg..");
                        setTimeout(checkEmail, _checkEmailTimeout);
                    } else {
                        resetScreenSaverTimer();
                        getPouringState(false);
                        $("#msgText").html(output);
                        $("#msgTextDate").html(_time.toLocaleDateString('en-US') + "   " + _time.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }));
                        $("#shotMsg").show();
                    }
                },
        error: function (ajaxContext) {
                console.error("Something bad happened");
            },
    });
}

function checkGlass() {
    $.ajax({ url: 'backend.php',
        data: {function: 'checkGlass'},
        type: 'POST',
        success: function(output) {
                    if(output == "True") {
                        if(_hasGlass == false) {
                            $("#glassStatus").addClass("statusBarGlassOn");
                            resetScreenSaverTimer();
                            _hasGlass = true;
                        }
                    } else {
                        $("#glassStatus").removeClass("statusBarGlassOn");
                        _hasGlass = false;
                    }
                    setTimeout(checkGlass, _checkGlassTimeout);
                },
        error: function (ajaxContext) {
                console.error("Something bad happened");
            },
    });
}

function pourShot(pour) {
    $("#manualPourAlert").hide();
    if (pour) {
        $("#manualPourMsg").show();
        $.ajax({ url: 'backend.php',
            data: {function: 'pourShot'},
            type: 'POST',
            success: function(output) {
                        setTimeout(getPouringState, _pourShotTimeout, true);
                    },
            error: function (ajaxContext) {
                    console.error("Something bad happened");
                },
        });
    }
}

function checkManualPour() {
    if (_hasGlass) {
        $.ajax({ url: 'backend.php',
            data: {function: 'getIsShotPoured'},
            type: 'POST',
            success: function(output) {
                        var shotAlreadyPoured = output.trim() == "True" ? true:false;
                        if (shotAlreadyPoured) {
                            $("#pourAlertMsg").html("Please take the shot before pouring another!");
                            $("#shotPourAlert").show();
                        } else {
                            $("#manualPourAlert").show();
                        }
                    },
            error: function (ajaxContext) {
                    console.error("Something bad happened")
                },
        });
    } else {   
        $("#pourAlertMsg").html("Please insert shot glass first!");
        $("#shotPourAlert").show();
    }
}

function hideShotPourAlert() {
    $("#pourAlertMsg").html("");
    $("#shotPourAlert").hide();
}

function openSettings(page) {
    _pBoard.hide();
    switch (page) {
        case 'wifi':
            $("#wifiSettingsPage").show();
        break;
        case 'wifi-select':
            $("#selectedWifiPage").show();
            _pBoard.show();
        break;
        case 'about':
            $("#aboutPage").show();
        break;
        case 'reboot':
            $("#rebootAlert").show();
        break;
        case 'main':
        default:
            $("#mainSettingsPage").show('slide', {direction: 'down'});
        break;
    }
}

function closeSettings(page) {
    _selectedWifi.ssid = "";
    _selectedWifi.bssid = "";

    switch (page) {
        case 'wifi':
            $("#wifiSettingsPage").hide();
        break;
        case 'wifi-select':
            $("#selectedWifiPage").hide();
        break;
        case 'about':
            $("#aboutPage").hide();
        break;
        case 'main':
        default:
            $("#mainSettingsPage").hide('slide', { direction: "down" });
        break;
    }
}

function refreshPage() {
    location.reload();
}

function systemReboot(reboot) {
    $("#rebootAlert").hide();
    if (reboot) {
        $("#loadingSpinner").show();
        $.ajax({ url: 'backend.php',
            data: {function: 'systemReboot'},
            type: 'POST',
            success: function(output) {
                        console.log("Goodbye!");
                    },
            error: function (ajaxContext) {
                    console.error("Something bad happened")
                },
        });
    }
}

// for animations on touchscreen.
function touchAction(action) {
    switch (action) {
        case 'pour':
            $("#pour").addClass("iconActive");
            checkManualPour();
        break;
        case 'settings':
            $("#settings").addClass("iconActive");
            openSettings("main");
        break;
        case 'history':
            $("#info").addClass("iconActive");
            $("#shotMsg").show();
        break;
        case 'refresh':
            refreshPage();
        break;
        default:
            refreshPage();
        break;
    }

    setTimeout(clearActiveIcon, _touchActionTimeout);
}

function clearActiveIcon() {
    $("#pour").removeClass("iconActive");
    $("#settings").removeClass("iconActive");
    $("#info").removeClass("iconActive");
}

function closeMsg() {
    $("#shotMsg").hide();
    $.ajax({ url: 'backend.php',
        data: {function: 'clearMsg'},
        type: 'POST',
        success: function(output) {
                    console.log(output);
                    //Start checking again!
                    checkEmail();
                },
        error: function (ajaxContext) {
                console.error("Something bad happened")
            },
    });
}


async function getWifi() {
    $('#loadingSpinnerWifi').show();
    var connections = new Array();
    $.ajax({ url: 'backend.php',
        data: {function: 'getAvailableWifi'},
        type: 'POST',
        success: function(output) {
                        connections=JSON.parse(output);
                        createWifiList(connections);
                        $('#loadingSpinnerWifi').hide();
                },
        error: function (ajaxContext) {
                console.error("Something went wrong...");
                $('#loadingSpinnerWifi').hide();
            },
        dataType: 'json'
    });
}

async function refreshWifi() {
    $('#loadingSpinnerWifi').show();
    $.ajax({ url: 'backend.php',
        data: {function: 'refreshAvailableWifi'},
        type: 'POST',
        success: function(output) {
                    getCurrentWifi();
                },
        error: function (ajaxContext) {
                console.error("Something went wrong...");
            },
    });
}

async function connectToWifi() {

    if ((_selectedWifi.ssid == "") || (_selectedWifi.bssid == "") || ($("#wifiPassword").val().length == 0)) {
        console.error("Wifi configuration not selected or password not entered.");
        return;
    }

    $('#loadingSpinner').show();

    var options = {
        ssid: _selectedWifi.ssid,
        bssid: _selectedWifi.bssid,
        psk: $("#wifiPassword").val()
    };
    
    // escape any quote and apostrophes so database doesn't break.
    options.ssid = options.ssid.replace(/'/g,"\\'");
    options.psk = options.psk.replace(/'/g,"\\'");

    $.ajax({ url: 'backend.php',
        data: {function: 'connectToWifi', parameter: options},
        type: 'POST',
        success: function(output) {
                    if(output.trim()=="SUCCESS") {
                        $('#loadingSpinner').hide();
                        $('#successMsg').show();
                        getCurrentWifi();
                        setTimeout(function() {
                            $('#successMsg').hide();
                            closeSettings('wifi-select');
                        }, _connectSuccessTimeout)
                    } else {
                        $('#loadingSpinner').hide();
                        $('#errorMsg').show();
                        getCurrentWifi();
                        setTimeout(function() {$('#errorMsg').hide();}, _connectFailTimeout);
                    }
                    console.log(output)
                },
        error: function (ajaxContext) {
                console.error("Something went wrong...");
                $('#loadingSpinner').hide();
                $('#errorMsg').show();
                setTimeout(function() {$('#errorMsg').hide();}, _connectFailTimeout);
            },
    });
}

function getCurrentWifi() {
    $.ajax({ url: 'backend.php',
        data: {function: 'getCurrentWifi'},
        type: 'POST',
        success: function(output) {
                    _connectedWifi = output.trim();
                    getWifi();   // get all the available networks
                },
        error: function (ajaxContext) {
                console.error("Something went wrong...");
                _connectedWifi = "";
                getWifi();   // get all the available networks
            },
    });
}

function showPassword() {
    var x = document.getElementById("wifiPassword");
    if (x.type === "password") {
        x.type = "text";
    } else {
        x.type = "password";
    }
}

function getLedState() {
    $.ajax({ url: 'backend.php',
        data: {function: 'getLedState'},
        type: 'POST',
        success: function(output) {
                    _ledState = output.trim() == "True" ? true:false;
                    if (_ledState) {
                        $("#ledStatusMenu").removeClass("buttonOff");
                        $("#ledStatusMenu").addClass("buttonOn");
                    } else {
                        $("#ledStatusMenu").removeClass("buttonOn");
                        $("#ledStatusMenu").addClass("buttonOff");
                    }
                },
        error: function (ajaxContext) {
                console.error("Something bad happened")
            },
    });
}

function setLedState() {
    if (_ledState == false) {
        $("#ledStatusMenu").removeClass("buttonOff");
        $("#ledStatusMenu").addClass("buttonOn");
        _ledState = true;
    } else {
        $("#ledStatusMenu").removeClass("buttonOn");
        $("#ledStatusMenu").addClass("buttonOff");
        _ledState = false;
    }

    $.ajax({ url: 'backend.php',
        data: {function: 'setLedState', parameter: _ledState},
        type: 'POST',
        success: function(output) {
                    console.log(output)
                },
        error: function (ajaxContext) {
                console.error("Something bad happened")
            },
    });
}

function getPouringState(manualShot) {
    $.ajax({ url: 'backend.php',
        data: {function: 'getPouringState'},
        type: 'POST',
        success: function(output) {
                    var pouringState = output.trim() == "True" ? true:false;
                    if(manualShot) {
                        if (pouringState) {
                            setTimeout(getPouringState, _getPouringStateTimeout, true);
                        } else {
                           $("#manualPourMsg").hide();
                        }
                    } else {
                        if (pouringState) {
                            $("#closeMsgButton").prop( "disabled", true );
                            $("#closeMsgButton").html( "POURING...");
                            setTimeout(getPouringState, _getPouringStateTimeout, false);
                        } else {
                            $("#closeMsgButton").prop( "disabled", false );
                            $("#closeMsgButton").html( "Close");
                        }
                    }
                },
        error: function (ajaxContext) {
                console.error("Something bad happened")
            },
    });
}

function screenSaverTimer() {
    $("#screenSaver").fadeIn(3000);
}

function resetScreenSaverTimer() {
    clearTimeout(_screenSaverTimer);
    $("#screenSaver").fadeOut();
    _screenSaverTimer = setTimeout(screenSaverTimer, _screenSaverDelay);
}