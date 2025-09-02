'use client'
import { useEffect, useState } from 'react'

export default function VersionBadge(){
  const [info, setInfo] = useState(null)
  useEffect(()=>{ fetch('/api/version').then(r=>r.json()).then(setInfo).catch(()=>setInfo({ok:false})) },[])
  const style = { fontSize:12, opacity:.8 }
  if(!info) return <div className="small" style={style}>verificando…</div>
  return (
    <div className="small" style={style}>
      build: {info.now || '–'} • supabase: {info.supabaseUrl ? 'ok' : 'faltando vars'}
    </div>
  )
}
