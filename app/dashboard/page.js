'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '../lib/useAuth'

export default function Page(){
  useAuth()
  const [agenda, setAgenda] = useState([])
  const [oss, setOs] = useState([])

  useEffect(()=>{
    fetch('/api/agenda').then(r=>r.json()).then(setAgenda)
    fetch('/api/os').then(r=>r.json()).then(setOs)
  },[])

  return (
    <div className="card">
      <h2>Painel</h2>
      <div className="grid" style={{marginTop:8}}>
        <div className="card"><div className="small">Atendimentos de hoje</div><strong style={{fontSize:28}}>{agenda.length}</strong></div>
        <div className="card"><div className="small">OS concluídas</div><strong style={{fontSize:28}}>{oss.filter(x=>x.status==='Concluído').length}</strong></div>
        <div className="card"><div className="small">Pendentes</div><strong style={{fontSize:28}}>{oss.filter(x=>x.status!=='Concluído').length}</strong></div>
      </div>
    </div>
  )
}
