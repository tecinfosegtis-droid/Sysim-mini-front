export const metadata = { title: 'Sysim Mini – Agenda' }
'use client'
import { useEffect, useState } from 'react'

export default function Page(){
  const [agenda, setAgenda] = useState([])
  useEffect(()=>{ fetch('/api/agenda').then(r=>r.json()).then(setAgenda) },[])

  return (
    <div className="card">
      <h2>Agenda do dia</h2>
      <table className="table">
        <thead><tr><th>Condomínio</th><th>Início</th><th>Fim</th></tr></thead>
        <tbody>
          {agenda.map(a=>(<tr key={a.id}><td>{a.condominio}</td><td>{a.horaInicio}</td><td>{a.horaFim}</td></tr>))}
        </tbody>
      </table>
    </div>
  )
}
