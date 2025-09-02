'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '../lib/useAuth'

// Helpers simples para persistir no localStorage
const KEY='sysim_agenda_track'

function loadTrack(){
  if(typeof window==='undefined') return {}
  try{ return JSON.parse(localStorage.getItem(KEY)||'{}') }catch(e){ return {} }
}
function saveTrack(data){
  if(typeof window==='undefined') return
  localStorage.setItem(KEY, JSON.stringify(data))
}
function now(){
  return new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})
}

export default function Page(){
  useAuth()
  const [agenda, setAgenda] = useState([])
  const [track, setTrack] = useState({})

  useEffect(()=>{
    fetch('/api/agenda').then(r=>r.json()).then(data=>{
      setAgenda(data)
      setTrack(loadTrack())
    })
  },[])

  function checkIn(id){
    const t = now()
    const next = { ...track, [id]: { ...(track[id]||{}), inicio: t } }
    setTrack(next); saveTrack(next)
  }

  function checkOut(id){
    const t = now()
    const current = track[id]||{}
    const next = { ...track, [id]: { ...current, fim: t } }
    setTrack(next); saveTrack(next)
  }

  return (
    <div className="card">
      <h2>Agenda do dia</h2>
      <table className="table">
        <thead><tr><th>Condomínio</th><th>Previsto</th><th>Check-in</th><th>Check-out</th><th>Ações</th></tr></thead>
        <tbody>
          {agenda.map(a=>{
            const t = track[a.id]||{}
            return (
              <tr key={a.id}>
                <td>{a.condominio}</td>
                <td>{a.horaInicio} – {a.horaFim}</td>
                <td>{t.inicio||'-'}</td>
                <td>{t.fim||'-'}</td>
                <td>
                  <button onClick={()=>checkIn(a.id)}>Check-in</button>{' '}
                  <button onClick={()=>checkOut(a.id)}>Check-out</button>{' '}
                  <a className="badge" target="_blank" href={`https://waze.com/ul?ll=-23.55,-46.63&navigate=yes`}>Abrir Waze</a>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <p className="small">Os horários de check-in/out ficam salvos neste dispositivo.</p>
    </div>
  )
}
