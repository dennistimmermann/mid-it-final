app.controller('scanCtrl', function($scope, $location, $rootScope) {
    console.log('ScanCTRL');

    function startScan() {
        scanningFlag = true;
        //hideBigButtons();

        scanOptions = {
            "scanType": "auto",
            "image": true,
            "ean8": false,
            "ean13": false,
            "qrcode": false,
            "dmtx": false
        }
        scanFlags = {
            "useDeviceOrientation": true,
            "noPartialMatching": true,
            "smallTargetSupport": true,
            "returnQueryFrame": false
        }

        MS4Plugin.scan(scanSuccess, scanFailure, scanOptions, scanFlags);
    }

    //found node, switch view
    function returnHome() {
        $scope.$apply(function() {
            $location.path("/tab/home");
            console.log($location.path());
        });
        console.log("im going home")

        //$route.reload()
    }

    // w00t, found image
    function scanSuccess(resultObject) {
        if (typeof(resultObject.recognisedFrame) !== 'undefined') { // if a recognised Frame was returned
            if (resultObject.recognisedFrame.length > 5) { // and it has enough length to be an image
                console.log("stuff did happen")
            }
        }
        else {
            console.log("here it didn't happen")
        }
        //alert("Recognised a " + resultObject.format + " = " + resultObject.value);
        console.log("got something")
        //$scope.query = "tsecks"
        //$rootScope.$broadcast('setQuery', "tsecks")
        $rootScope.$emit('setQuery', resultObject.value)
        stopScan()
        returnHome()

        // in Moodstocks 4 an autoscan success pauses the scanner
        // this lets us resume it
    }

    function scanFailure() {
        console.log("could math images ... how did i get here?")
    }

    function stopScan() {
        scanningFlag = false;
        MS4Plugin.dismiss(dismissSuccess, dismissFail);
    }

    function dismissSuccess() {
        console.log("stopped scanning")
    }

    function dismissFail() {
        console.log("cant stop me naaaaaow")
    }

    function showBg() {
        document.getElementsByTagName('html')[0].className = "bg-view"
    }

    function hideBg() {
        document.getElementsByTagName('html')[0].className = "bg-view bg-vanish"
    }

    // activate/deactivate scan on view change
     $scope.$on('$ionicView.enter', function(){ //This is fired twice in a row
        console.log("App view (scan) entered.");
        console.log($scope.query)
        //qreturnHome()
        hideBg()
        startScan()
    });

    $scope.$on('$ionicView.leave', function(){ //This just one when leaving, which happens when I logout
        console.log("App view (scan) left.");
        showBg()
        stopScan()
    });

});
