/**
 * Service worker for cardweb. Should compile to a neat unique file.
 * Check webpack config for more info on how this wizardry is achieved.
 * Basic rundown is that webpack compiles a file that should always be there on install that is the emitted asset list.
 * This file allows us to precache webpack-generated files.
 * There is some other things to allow us to communicate more easily with the client(s) that this serviceworker works with and might allows us to 
 *  transmit data and other intresting bits.
 * 
 * Code is (partially) taken from:
 * - https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers
 *      For the base code and structure as well as the cache strategy.
 * - https://www.devextent.com/create-service-worker-typescript/
 *      For he typescript approach (esp. the declare at the top of this file)
 */

export type { };
declare const globalThis: ServiceWorkerGlobalScope;
interface assetJSON {
    assets: string[];
}

const cacheName = "::cwServiceWorker";
const cacheVersion = "v0.0.1";
/** Asset.json path from root (will be fetch'd) */
const assetPath = "/assets.json";

let assetList: assetJSON = { assets: [] };

console.debug("[SW] booted up?");

globalThis.addEventListener('install', event => {
    console.debug('[SW] Install event', event);
    globalThis.clients.claim();
    event.waitUntil(cacheAll().then(() => globalThis.skipWaiting()));
});

globalThis.addEventListener('activate', event => {
    console.debug('[SW] activate event', event);
    event.waitUntil(Promise.all([enableNavigationPreload(), globalThis.clients.claim(), verifyCache()]));
});

globalThis.addEventListener('message', event => {
    console.debug('[SW] message event:', event);
    sendMessageToClients("[SW] received a message: ", event);
});

globalThis.addEventListener('fetch', (event: FetchEvent) => {
    console.debug('[SW] fetch event:', event);
    event.respondWith(cacheFirst(event.request, event.preloadResponse, '/fallback.html'));
});

async function cacheFirst(request: RequestInfo | URL, preloadResponsePromise: Promise<Response>, fallbackUrl: RequestInfo | URL) {
    // First try to get the resource from the cache
    const responseFromCache = await caches.match(request);
    if (responseFromCache) {
        return responseFromCache;
    }

    // Next try to use (and cache) the preloaded response, if it's there
    const preloadResponse = await preloadResponsePromise;
    if (preloadResponse) {
        console.info('[SW] using preload response', preloadResponse);
        cachePut(request, preloadResponse.clone());
        return preloadResponse;
    }

    // Next try to get the resource from the network
    try {
        const responseFromNetwork = await fetch(request);
        // response may be used only once
        // we need to save clone to put one copy in cache
        // and serve second one
        cachePut(request, responseFromNetwork.clone());
        console.info("[SW] Ressource not cached, fetched from network:", responseFromNetwork);
        return responseFromNetwork;
    } catch (error) {
        const fallbackResponse = await caches.match(fallbackUrl);
        if (fallbackResponse) {
            console.warn("[SW] Network unavailble, falling back to:", fallbackResponse);
            return fallbackResponse;
        }
        // when even the fallback response is not available,
        // there is nothing we can do, but we must always
        // return a Response object
        console.error("[SW] No fallback in cache, sending plaintext error.");
        return new Response('Network error happened', {
            status: 408,
            headers: { 'Content-Type': 'text/plain' },
        });
    }
}

function cachePut(request: RequestInfo | URL, response: Response) {
    return new Promise<void>(async (resolve, reject) => {
        try {
            const cache = await caches.open(cacheVersion + cacheName);
            await cache.put(request, response);
            resolve();
        } catch (e) {
            console.error("Error putting ", request, "with response ", response, "in cache: ", e);
            reject();
        }
    });
}

// Enable navigation preload
async function enableNavigationPreload() {
    if (globalThis.registration.navigationPreload) {
        // Enable navigation preloads!
        await globalThis.registration.navigationPreload.enable();
    }
};

function cacheAll(): Promise<void> {
    console.info("Caching all assets...");
    return new Promise(async (resolve, reject) => {
        try {
            const r = await fetch(assetPath);
            assetList = JSON.parse(await r.text());
            console.debug("Retrived asset list: ", assetList);
            const cache = await caches.open(cacheVersion + cacheName);
            console.debug("Adding them to cache...");
            cache.addAll(assetList.assets).then(() => {
                console.info("Done caching.");
                sendMessageToClients(`[SW] Done caching:`, assetList.assets);
                resolve();
            });
        } catch (e) {
            console.error("Error caching assets: ", e);
            reject(`Error caching assets: ${e}`);
        }
    });
}

function verifyCache(): Promise<void> {
    console.info("Checking that the latest asset.json is the same as our...");
    return new Promise(async (resolve, reject) => {
        try {
            const r = await fetch(assetPath);
            assetList = JSON.parse(await r.text());
            console.debug("Retrived asset list: ", assetList);
            const cache = await caches.open(cacheVersion + cacheName);
            assetList.assets.forEach(async (asset) => {
                const response = await cache.match(asset);
                if(!response){
                    console.warn("Cache has changed, recaching everything...")
                    await cacheAll();
                    resolve();
                }
            })
            console.info("Cache was successfully validated.")
            resolve();

        } catch (error) {
            console.error("Error verifying cache: ", error);
            reject(`Error verifying cache: ${error}`);
        }

    });
}

async function sendMessageToClients(message: any, ...optionalParams: any[]) {
    console.debug("Sending message to clients: ", message, optionalParams);
    return globalThis.clients.matchAll().then(function (clients: any) {
        clients.forEach(function (client: Client) {
            console.debug("Sending to client:", client);
            client.postMessage({
                message: message,
                optionalParams: optionalParams
            });
        });
    });
}