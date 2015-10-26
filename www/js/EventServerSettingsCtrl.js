/* jshint -W041 */
/* jslint browser: true*/
/* global cordova,StatusBar,angular,console */

angular.module('zmApp.controllers').controller('zmApp.EventServerSettingsCtrl', ['$scope', '$ionicSideMenuDelegate', 'zm', '$stateParams', 'EventServer', '$ionicHistory', '$rootScope', '$state', 'message', 'ZMDataModel', function ($scope, $ionicSideMenuDelegate, zm, $stateParams, EventServer, $ionicHistory, $rootScope, $state, message, ZMDataModel) {
    $scope.openMenu = function () {
        $ionicSideMenuDelegate.toggleLeft();
    };


    $scope.openMenu = function () {
        $ionicSideMenuDelegate.toggleLeft();
    };


    //----------------------------------------------------------------
    // Alarm notification handling
    //----------------------------------------------------------------
    $scope.handleAlarms = function () {
        $rootScope.isAlarm = !$rootScope.isAlarm;
        if (!$rootScope.isAlarm) {
            $rootScope.alarmCount = "0";
            $ionicHistory.nextViewOptions({
                disableBack: true
            });


            $state.go("events", {
                "id": 0
            }, {
                reload: true
            });
        }
    };
    
    //----------------------------------------------------------------
    // Save anyway when you exit
    //----------------------------------------------------------------
    
     $scope.$on('$ionicView.beforeLeave', function () {
        saveItems();


    });
    
    //----------------------------------------------------------------
    // Accordion list show/hide
    //----------------------------------------------------------------

    $scope.toggleGroup = function (group) {
        if ($scope.isGroupShown(group)) {
            $scope.shownGroup = null;
        } else {
            $scope.shownGroup = group;
        }
    };
    $scope.isGroupShown = function (group) {
        return $scope.shownGroup === group;
    };

    $scope.saveItems = function () {
        saveItems();
    };
    
    //----------------------------------------------------------------
    // Saves ES data
    //----------------------------------------------------------------

    function saveItems() {
        ZMDataModel.zmDebug("Saving Event Server data");
        var monstring = "";
        var intervalstring = "";
        for (var i = 0; i < $scope.monitors.length; i++) {
            if (isNaN($scope.monitors[i].Monitor.reportingInterval)) {
                $scope.monitors[i].Monitor.reportingInterval = 0;
            }
            if ($scope.monitors[i].Monitor.isChecked) {
                monstring = monstring + $scope.monitors[i].Monitor.Id + ",";
                var tint =  parseInt($scope.monitors[i].Monitor.reportingInterval);
                if (isNaN(tint)) tint = 0;
                intervalstring = intervalstring + tint + ",";
            }

        }

        if (monstring.charAt(monstring.length - 1) == ',')
            monstring = monstring.substr(0, monstring.length - 1);

        if (intervalstring.charAt(intervalstring.length - 1) == ',')
            intervalstring = intervalstring.substr(0, intervalstring.length - 1);

        $scope.loginData.eventServerMonitors = monstring;
        $scope.loginData.eventServerInterval = intervalstring;

        $scope.loginData.isUseEventServer = ($scope.check.isUseEventServer) ? "1" : "0";

        ZMDataModel.setLogin($scope.loginData);
        console.log("**** EVENT MONSTRING " + monstring);
        console.log("**** EVENT INTERVALSTRING " + intervalstring);

        if ($scope.loginData.isUseEventServer) {
            EventServer.init()
                .then(function (data) {
                    console.log("Sending control filter");
                    ZMDataModel.zmDebug("Sending Control message 'filter' with monlist="+monstring+" and interval="+intervalstring);
                    EventServer.sendMessage("control", {
                        type: 'filter',
                        monlist: monstring,
                        intlist: intervalstring
                    });
                });
        }
        ZMDataModel.displayBanner('info', ['settings saved']);
    }

    //----------------------------------------------------------------
    // returns domain name in string - 
    // http://stackoverflow.com/questions/8498592/extract-root-domain-name-from-string
    //----------------------------------------------------------------
    function extractDomain(url) {
    var domain;
    //find & remove protocol (http, ftp, etc.) and get domain
    if (url.indexOf("://") > -1) {
        domain = url.split('/')[2];
    }
    else {
        domain = url.split('/')[0];
    }

    //find & remove port number
    domain = domain.split(':')[0];

    return domain;
}

    
    //----------------------------------------------------------------
    // returns reporting interval for monitor ID
    //----------------------------------------------------------------
    function getInterval(id) {
        // means no interval, should only happen one time
        // till we save
        if ($scope.loginData.eventServerInterval == "")
            return 0;
        var retval = 0;
        for (var i = 0; i < res.length; i++) {
            if (res[i] == id) {
                retval = parseInt(minterval[i]);
                break;
            }
        }
        return retval;
    }

    //----------------------------------------------------------------
    // Returns true/false if monitor ID is in event monitor list
    //----------------------------------------------------------------
    function isEnabled(id) {
        if ($scope.loginData.eventServerMonitors == "")
            return true;

        var isThere = false;
        for (var i = 0; i < res.length; i++) {
            if (res[i] == id) {
                isThere = true;
                console.log("isRes found: " + id);
                break;
            }
        }
        return isThere;
    }

    //-------------------------------------------------------------------------
    // Controller Main
    //------------------------------------------------------------------------
    $scope.monitors = [];
    $scope.monitors = message;

    $scope.loginData = ZMDataModel.getLogin();
    
    if ($scope.loginData.eventServer == "")
    {
        $scope.loginData.eventServer = "wss://"+extractDomain($scope.loginData.url)+":9000";
    }
    

    $scope.check = {
        isUseEventServer: ""
    };
    $scope.check.isUseEventServer = ($scope.loginData.isUseEventServer == '1') ? true : false;

    var res = $scope.loginData.eventServerMonitors.split(",");
    var minterval = $scope.loginData.eventServerInterval.split(",");


    for (var i = 0; i < $scope.monitors.length; i++) {


        if (!isEnabled($scope.monitors[i].Monitor.Id)) {
            // if the filter list has IDs and this is not part of it, uncheck it
            $scope.monitors[i].Monitor.isChecked = false;
            console.log("Marking false");
            $scope.monitors[i].Monitor.reportingInterval = 0;
        } else {
            console.log("Marking true");
            $scope.monitors[i].Monitor.isChecked = true;
            $scope.monitors[i].Monitor.reportingInterval = getInterval($scope.monitors[i].Monitor.Id);
        }

    }






}]);