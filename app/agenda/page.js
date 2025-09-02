'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '../lib/useAuth'

export default function Page(){
  useAuth()
  const [agenda, setAgenda] = useState([])
  const [log, setLog] = useState([])

  useEffect(()=>{ fetch('/api/agenda').then(r=>r.json()).then(setAgenda) },[])

  function doCheckIn(id){
    const t = new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})
    setLog(prev=>[...prev, `Check-in ${id} às ${t}`])
  }
  function doCheckOut(id){
    const t = new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})
    setLog(prev=>[...prev, `Check-out ${id} às ${t}`])
  }

  return (
    <div className="card">
      <h2>Agenda do dia</h2>
      <table className="table">
        <thead><tr><th>Condomínio</th><th>Início</th><th>Fim</th><th>Ações</th></tr></thead>
        <tbody>
          {agenda.map(a=>(
            <tr key={a.id}>
              <td>{a.condominio}</td>
              <td>{a.horaInicio}</td>
              <td>{a.horaFim}</td>
              <td>
                <button onClick={()=>doCheckIn(a.id)}>Check-in</button>{' '}
                <button onClick={()=>doCheckOut(a.id)}>Check-out</button>{' '}
                <a className="badge" target="_blank" href={`https://waze.com/ul?ll=-23.55,-46.63&navigate=yes`}>Abrir Waze</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="small">Log: {log.join(' • ')}</div>
    </div>
  )
}
