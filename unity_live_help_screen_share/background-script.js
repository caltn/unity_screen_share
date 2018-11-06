//unity connect desktop capture

chrome.runtime.onMessageExternal.addListener(
    function(request, sender, sendResponse) {
        console.log("Got request", request, sender);
        if(request.getVersion) {
            sendResponse({ version: chrome.runtime.getManifest().version });
            return false; // Dispose of sendResponse
        } else if(request.getStream) {
            // Desktop video stream sources
            var sources = ["screen", "window"];
            if (request.sources) {
                // Default
                sources = request.sources;
            }

            // Tab for which the stream will be created (passed to
            // chrome.desktopCapture.chooseDesktopMedia).
            var tab = sender.tab;

            // If the streamId is requested from frame with different url than
            // its parent according to the documentation (
            // https://developer.chrome.com/extensions/desktopCapture ) -
            // "The stream can only be used by frames in the given tab whose
            // security origin matches tab.url." That's why we need to change
            // the url to the url of the frame (the frame is the sender).
            // Related ticket:
            // https://bugs.chromium.org/p/chromium/issues/detail?id=425344
            tab.url = sender.url;
            
            // Gets chrome media stream token and returns it in the response.
            chrome.desktopCapture.chooseDesktopMedia(
                sources, tab,
                function(streamId) {
                    sendResponse({ streamId: streamId });
                });
            return true; // Preserve sendResponse for future use
        } else {
            console.error("Unknown request");
            sendResponse({ error : "Unknown request" });
            return false;
        }
    }
);
