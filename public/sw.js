
self.addEventListener('install', (e) => { self.skipWaiting() })
self.addEventListener('activate', (e) => { self.clients.claim() })

self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {}
  event.waitUntil(
    self.registration.showNotification(data.title || 'Lembrete', {
      body: data.body || '',
      icon: data.icon || '/favicon.png',
      tag: data.tag || 'sysim-mini',
      requireInteraction: !!data.requireInteraction
    })
  )
})
