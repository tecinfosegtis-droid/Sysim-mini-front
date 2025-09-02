'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function useAuth(){
  const router = useRouter()
  useEffect(()=>{
    const role = typeof window !== 'undefined' ? localStorage.getItem('role') : null
    if(!role){ router.push('/') }
  },[router])
}
