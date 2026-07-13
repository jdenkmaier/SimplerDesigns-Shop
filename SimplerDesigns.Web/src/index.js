import Application from "./application.js";
import '.././css/custom-style.css';

new Application();

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        .then(function() {
            console.log('Service Worker Registered');
        });
}