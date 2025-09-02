export const metadata = { title: 'Sysim Mini – Painel' }
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
    <div className="vstack">
      <div className="card">
        <h2>Resumo</h2>
        <div className="grid">
          <div className="card vstack">
            <span className="small">Atendimentos de hoje</span>
            <strong>{agenda.length}</strong>
          </div>
          <div className="card vstack">
            <span className="small">OS concluídas</span>
            <strong>{oss.filter(x=>x.status==='Concluído').length}</strong>
          </div>
        </div>
      </div>
    </div>
  )
}
