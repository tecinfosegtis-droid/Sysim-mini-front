export const metadata = { title: 'Sysim Mini – OS' }
'use client'
import { useEffect, useState } from 'react'

export default function Page(){
  const [oss, setOs] = useState([])
  useEffect(()=>{ fetch('/api/os').then(r=>r.json()).then(setOs) },[])

  return (
    <div className="card">
      <h3>Ordens de Serviço</h3>
      <table className="table">
        <thead><tr><th>Condomínio</th><th>Tarefas</th><th>Status</th></tr></thead>
        <tbody>
          {oss.map(o=>(<tr key={o.id}><td>{o.condominio}</td><td>{o.tarefas.join(', ')}</td><td>{o.status}</td></tr>))}
        </tbody>
      </table>
    </div>
  )
}
