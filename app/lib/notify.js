'use client'
const KEY = 'sysim_notify_minutes'

export function getDefaultMinutes(){
  if (typeof window === 'undefined') return 15
  const v = Number(localStorage.getItem(KEY))
  return Number.isFinite(v) && v > 0 ? v : 15
}
export function setDefaultMinutes(n){
  if (typeof window === 'undefined') return
  localStorage.setItem(KEY, String(n || 15))
}

export async function ensureNotificationReady(){
  if (typeof window === 'undefined') return false
  try{
    if ('serviceWorker' in navigator){
      await navigator.serviceWorker.register('/sw.js')
    }
    if (Notification?.permission !== 'granted'){
      const perm = await Notification.requestPermission()
      return perm === 'granted'
    }
    return true
  }catch(e){
    console.error('notify setup', e)
    return false
  }
}

export async function sendNotification({ title, body }){
  try{
    const reg = await navigator.serviceWorker.getRegistration()
    if (reg && reg.showNotification){
      return reg.showNotification(title, { body, icon:'/favicon.png', tag: 'sysim-mini' })
    }
  }catch{}
  // fallback
  try{ new Notification(title, { body }) }catch{ alert(title + '\n' + body) }
}
