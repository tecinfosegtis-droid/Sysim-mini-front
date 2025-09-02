'use client'
import { useEffect, useState } from 'react'

export default function Page(){
  const [agenda, setAgenda] = useState([])
  const [oss, setOs] = useState([])

  useEffect(()=>{
    fetch('/api/agenda').then(r=>r.json()).then(setAgenda)
    fetch('/api/os').then(r=>r.json()).then(setOs)
  },[])

  return (
    <div className="card">
      <h2>Painel</h2>
      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:14, marginTop:8}}>
        <div className="card"><div className="small">Atendimentos de hoje</div><strong>{agenda.length}</strong></div>
        <div className="card"><div className="small">OS concluídas</div><strong>{oss.filter(x=>x.status==='Concluído').length}</strong></div>
      </div>
    </div>
  )
}
