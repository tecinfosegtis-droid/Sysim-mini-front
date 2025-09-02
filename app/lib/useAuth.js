'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from './supabaseClient'

export function useAuth(requireAuth=true){
  const [session, setSession] = useState(null)
  const router = useRouter()

  useEffect(()=>{
    supabase.auth.getSession().then(({ data })=>{
      setSession(data.session)
      if(requireAuth && !data.session){ router.push('/') }
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s)=>{
      setSession(s)
      if(requireAuth && !s){ router.push('/') }
    })
    return () => { sub?.subscription?.unsubscribe?.() }
  }, [router, requireAuth])

  return session
}
