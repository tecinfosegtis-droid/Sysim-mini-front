'use client'

import { useEffect, useState } from 'react'

export default function Page(){
  const [oss, setOs] = useState([])
  useEffect(()=>{ fetch('/api/os').then(r=>r.json()).then(setOs) },[])
  return (
    <div style={{padding:20}}>
      <h2>Ordens de Serviço</h2>
      <ul>{oss.map(o=> (<li key={o.id}>{o.condominio} — {o.status} — {o.tarefas.join(', ')}</li>))}</ul>
    </div>
  )
}
