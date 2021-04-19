importScripts('serviceworker-cache-polyfill.js');

// 1. Save the files to the user's device
// The "install" event is called when the ServiceWorker starts up.
// All ServiceWorker code must be inside events.

const targetUrl = [
                '',
                'index.html',
                'templates/about.min.html',
                'templates/detail.min.html',
                'templates/home.min.html',
                'templates/info.min.html',
                'templates/install.min.html',
                'templates/privacy.min.html',
                'templates/term.min.html',
                'templates/third.min.html',
                'js/data.min.js',
                'js/xlsx.full.min.js',
                'js/script-obfuscated.min.js',
                'css/style.min.css',
                'ionic/angular/angular.min.js',
                'ionic/angular/angular-animate.min.js',
                'ionic/angular/angular-sanitize.min.js',
                'ionic/ionic.min.js',
                'ionic/ionic-angular.min.js',
                'ionic/angular-ui/angular-ui-router.min.js',
                'ionic/ionic.min.css',
                'ionic/ionic.filter.bar.min.js',
                'ionic/fonts/ionicons.eot',
                'ionic/fonts/ionicons.svg',
                'ionic/fonts/ionicons.ttf',
                'ionic/fonts/ionicons.woff',
                'images/barcode.gif',
                'images/logo/mail.svg',
                'images/logo/facebook.svg',
                'images/logo/twitter.svg',
                'images/icons/icon-32x32.png',
                'images/icons/icon-128x128.png',
                'images/icons/icon-144x144.png',
                'images/icons/icon-152x152.png',
                'images/icons/icon-192x192.png',
                'images/icons/icon-256x256.png',
                'images/icons/icon-512x512.png',
                'images/icons/icon-1024x1024.png',
                'images/logo/logo.png'
            ];
self.addEventListener('install', function (e) {
    console.log('install');

    // waitUntil tells the browser that the install event is not finished until we have
    // cached all of our files
    e.waitUntil(
        // Here we call our cache "myonsenuipwa", but you can name it anything unique
        caches.open('ctcae5-cache').then(cache => {
            // If the request for any of these resources fails, _none_ of the resources will be
            // added to the cache.
            return cache.addAll(targetUrl);
        })
    );
});

// 2. Intercept requests and return the cached version instead
self.addEventListener("fetch", function (event) {
    console.log("Request -->", event.request.url);

    //To tell browser to evaluate the result of event
    event.respondWith(
        caches.match(event.request) //To match current request with cached request it
        .then(function (response) {
            //If response found return it, else fetch again.
            return response || fetch(event.request);
        })
        .catch(function (error) {
            console.log("Error: ", error);
        })
    );
});

self.addEventListener('activate', function (event) {
    var cacheKeeplist = ['manager-cache'];

    event.waitUntil(
        caches.keys().then(function (keyList) {
            return Promise.all(keyList.map(function (key) {
                if (cacheKeeplist.indexOf(key) === -1) {
                    return caches.delete(key);
                }
            }));
        })
    );
});
