'use client'

import { useEffect, useState } from 'react'

export default function Page(){
  const [agenda, setAgenda] = useState([])
  useEffect(()=>{ fetch('/api/agenda').then(r=>r.json()).then(setAgenda) },[])
  return (
    <div style={{padding:20}}>
      <h2>Agenda</h2>
      <ul>{agenda.map(a=> (<li key={a.id}>{a.condominio}: {a.horaInicio} - {a.horaFim}</li>))}</ul>
    </div>
  )
}
