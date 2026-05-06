// Service Worker for PWA offline support and background push notifications
const CACHE_NAME = "tradeo-v2"
const urlsToCache = [
  "/",
  "/learn",
  "/trading",
  "/leaderboard",
  "/shop",
  "/profile",
  "/icon.svg",
  "/apple-icon.png",
  "/images/bull-mascot.png",
  "/models/mascot.glb",
]

// Install event - cache essential assets
self.addEventListener("install", (event) => {
  console.log("[SW] Installing service worker v2")
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("[SW] Caching app shell")
        return cache.addAll(urlsToCache)
      })
      .then(() => self.skipWaiting()),
  )
})

// Activate event - clean up old caches and take control immediately
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating service worker v2")
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log("[SW] Deleting old cache:", cacheName)
              return caches.delete(cacheName)
            }
          }),
        )
      })
      .then(() => self.clients.claim()),
  )
})

// Push notification event - handle incoming push messages EVEN WHEN APP IS CLOSED
self.addEventListener("push", (event) => {
  console.log("[SW] Push notification received")
  
  const defaultData = {
    title: "Tradeo",
    body: "Ta lecon du jour t'attend !",
    icon: "/icon.svg",
    badge: "/icon.svg",
    url: "/learn",
  }

  let data = defaultData
  if (event.data) {
    try {
      data = { ...defaultData, ...event.data.json() }
    } catch {
      data.body = event.data.text()
    }
  }

  // Show notification - this works even when the app is closed!
  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    vibrate: [200, 100, 200],
    tag: data.tag || "tradeo-notification",
    renotify: true,
    requireInteraction: true, // Keep notification visible until user interacts
    data: { url: data.url },
    actions: [
      { action: "open", title: "Ouvrir Tradeo" },
      { action: "dismiss", title: "Plus tard" },
    ],
  }

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})

// Handle notification click - open the app
self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification clicked:", event.action)
  event.notification.close()

  const url = event.notification.data?.url || "/learn"

  if (event.action === "dismiss") return

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(url)
          return client.focus()
        }
      }
      // Otherwise, open a new window
      return self.clients.openWindow(url)
    }),
  )
})

// Periodic background sync for daily reminders - works even when app is closed
self.addEventListener("periodicsync", (event) => {
  console.log("[SW] Periodic sync:", event.tag)
  
  if (event.tag === "daily-lesson-reminder") {
    event.waitUntil(
      self.registration.showNotification("Tradeo", {
        body: "N'oublie pas ta lecon du jour ! Ta serie est en jeu.",
        icon: "/icon.svg",
        badge: "/icon.svg",
        vibrate: [200, 100, 200],
        tag: "daily-reminder",
        requireInteraction: true,
        data: { url: "/learn" },
        actions: [
          { action: "open", title: "Faire ma lecon" },
          { action: "dismiss", title: "Plus tard" },
        ],
      }),
    )
  }
  
  if (event.tag === "streak-reminder") {
    event.waitUntil(
      self.registration.showNotification("Tradeo", {
        body: "Ta serie est en danger ! Fais une lecon maintenant.",
        icon: "/icon.svg",
        badge: "/icon.svg",
        vibrate: [300, 100, 300],
        tag: "streak-reminder",
        requireInteraction: true,
        data: { url: "/learn" },
        actions: [
          { action: "open", title: "Sauver ma serie" },
          { action: "dismiss", title: "Plus tard" },
        ],
      }),
    )
  }
})

// Background sync for offline actions
self.addEventListener("sync", (event) => {
  console.log("[SW] Background sync:", event.tag)
  
  if (event.tag === "sync-progress") {
    event.waitUntil(syncProgress())
  }
})

// Sync user progress when back online
async function syncProgress() {
  // This would sync any offline progress to the server
  console.log("[SW] Syncing progress...")
}

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests
  if (event.request.method !== "GET") return
  
  // Skip API requests (we want these to always go to network)
  if (event.request.url.includes("/api/")) return
  
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache hit - return response
      if (response) {
        return response
      }

      // Clone the request
      const fetchRequest = event.request.clone()

      return fetch(fetchRequest)
        .then((response) => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response
          }

          // Clone the response
          const responseToCache = response.clone()

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache)
          })

          return response
        })
        .catch(() => {
          // Network failed, return offline page if available
          return caches.match("/learn")
        })
    }),
  )
})

// Message handler for communication with the app
self.addEventListener("message", (event) => {
  console.log("[SW] Message received:", event.data)
  
  if (event.data.type === "SKIP_WAITING") {
    self.skipWaiting()
  }
  
  if (event.data.type === "SCHEDULE_NOTIFICATION") {
    // Schedule a notification for later
    const { delay, title, body, url } = event.data
    setTimeout(() => {
      self.registration.showNotification(title || "Tradeo", {
        body: body || "Tu as un nouveau message !",
        icon: "/icon.svg",
        badge: "/icon.svg",
        vibrate: [200, 100, 200],
        tag: "scheduled-notification",
        data: { url: url || "/learn" },
      })
    }, delay || 0)
  }
})
