'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from './supabaseClient'

export function useAuth(requireLogin = false){
  const [session, setSession] = useState(null)
  const router = useRouter()

  useEffect(() => {
    let mounted = true

    async function init(){
      const { data } = await supabase.auth.getSession()
      if (mounted){
        setSession(data.session)
        if (requireLogin && !data.session) router.push('/')
      }
    }

    init()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_ev, s) => {
      if (!mounted) return
      setSession(s)
      if (requireLogin && !s) router.push('/')
    })

    return () => { mounted = false; subscription?.unsubscribe() }
  }, [requireLogin, router])

  return session
}
