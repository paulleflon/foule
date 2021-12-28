/* eslint-disable no-restricted-globals */
import {clientsClaim} from 'workbox-core';
import {createHandlerBoundToURL, precacheAndRoute} from 'workbox-precaching';
import {registerRoute} from 'workbox-routing';

clientsClaim();
precacheAndRoute(self.__WB_MANIFEST);

const fileExtensionRegexp = new RegExp('/[^/?]+\\.[^/]+$');
registerRoute(
	({request, url}) => {
		if (request.mode !== 'navigate') {
			return false;
		}
		if (url.pathname.startsWith('/_')) {
			return false;
		}
		if (url.pathname.match(fileExtensionRegexp)) {
			return false;
		}
		return true;
	},
	createHandlerBoundToURL(process.env.PUBLIC_URL + '/index.html')
);

self.addEventListener('message', (event) => {
	if (event.data && event.data.type === 'SKIP_WAITING') {
		self.skipWaiting();
	}
});

self.addEventListener('install', (e) => {
	console.log('[Service Worker] Install');
});

self.addEventListener('fetch', (e) => {
	// I have no idea what this does
	// but it's required for the app to be installable lol
	e.respondWith((async () => {
		const r = await caches.match(e.request);
		console.log(`[Service Worker] Fetching resource: ${e.request.url}`);
		if (r) {return r;}
		const response = await fetch(e.request);
		return response;
	})());

});