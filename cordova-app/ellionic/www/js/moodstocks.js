function init() {
    console.log("start init")
    // instant initialisation doesn't work on iOS
    setTimeout(function() {
        MS4Plugin.open(openSuccess, openFail, 'MS4Tom.bundle');
        MS4Plugin.sync(syncSuccess, syncFail);
    }, 1000);
}

function openSuccess(bundleLoaded) {
    console.log("successfully initialized MS4")
}

function openFail() {
    console.log("failed to initialize MS4")
}

function syncSuccess(count) {
    console.log(count + " images successfully synced");
    //startScan()
}

function syncFail() {
    console.log("could not sync target image library")
}
