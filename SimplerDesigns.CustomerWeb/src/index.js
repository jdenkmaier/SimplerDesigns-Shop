import Application from "./application.js";

new Application();

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        .then(function() {
            console.log('Service Worker Registered');
        });
}