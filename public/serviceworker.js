const version = 'v0.01' // Use to update cache when files change
const staticCacheName = version + 'staticfiles';
const imageCacheName = 'images';
const cacheList = [
     staticCacheName,
     imageCacheName
];

addEventListener('install', (installEvent) { // cache files
  skipWaiting(); // activate sw immediately
  installEvent.waitUntil(
    caches.open(staticCacheName) // Cache API
      .then( (staticCache) => { // Cache your files here
        // nice to have
        staticCache.addAll([
          '/path/to/font.woff', // if these names change, you need to manually update
          '/path/to/icon.svg'
        ]);
        // Must have
        return staticCache.addAll([
          '/path/to/stylesheet.css',
          '/path/to/javascript.js',
          '/offline.html', // fallback page
          '/fallback.svg' // fallback image
        ]);
      ]);
    })
  )
});
addEventListener('activate', function (event) { // delete old caches
  activateEvent.waitUntil(
     caches.keys()
       .then( cacheNames => {
         return Promise.all(
           cacheNames.map( cacheName => {
             if (!cacheList.includes(cacheName)) {
               return caches.delete(cacheName);
             }
             // if (cacheName != staticCacheName) {
             //   return caches.delete(cacheName);
             // }
           })
         );
       })
       .then( () => {
         return clients.claim(); // new sw takes over immediately in all open tabs
       })
  );
});
addEventListener('fetch', fetchEvent => { // entire code on page 76
   const request = fetchEvent.request;
   if (request.headers.get('Accept').includes('text/html')) {
     fetchEvent.respondWith(
       fetch(request) // Fetch that page from the network with Fetch API
       .catch( error => {
         return caches.match('/offline.html'); // Otherwise show the fallback page
       })
     );
     return; // Go no further
   } else if (request.headers.get('Accept').includes('image')) {
     fetchEvent.respondWith(
       caches.match(request) // Look for a cached version of the image
       .then( responseFromCache => {
         if (responseFromCache) {
           return responseFromCache;
         }
         return fetch(request) // Otherwise fetch the image from the network
         .then( responseFromFetch => {
           const copy = responseFromFetch.clone(); // Put a copy in the cache
           fetchEvent.waitUntil(
             caches.open(imageCacheName)
             .then( imageCache => {
               return imageCache.put(request, copy);
             })
           );
           return responseFromFetch;
         });
         .catch( error => {
           return caches.match('/fallback.svg'); // Otherwise show a fallback image
         })
       })
     );
   return; // Go no further
 } else {
   fetchEvent.respondWith(
     caches.match(request) // Look for a cached copy of the file
     .then( responseFromCache => {
       if (responseFromCache) {
         return responseFromCache;
       }
       return fetch(request); // Otherwise fetch the file from the network
     })
   );
 }
   // fetchEvent.respondWith(
   //   // fetch(request) // Fetch API
   //   // .then( responseFromFetch => {
   //   //   return responseFromFetch;
   //   // }
   //   // .catch(error => {
   //   //   return new Response(
   //   //     '<h1>Oops!</h1> <p>Something went wrong.</p>',
   //   //     {
   //   //       headers: {'Content-type': 'text/html; charset=utf-8'}
   //   //     }
   //   //   );
   //   // })
   //   caches.match(request)
   //    .then( responseFromCache => {
   //      if (responseFromCache) {
   //        return responseFromCache;
   //      }
   //      return fetch(request)
   //        .catch( error => {
   //          return caches.match('/offline.html'); // Show a fallback page instead
   //        });
   //    })
   // )
 });

 // page 81
