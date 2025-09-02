'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { useAuth } from '../lib/useAuth'
import { supabase } from '../lib/supabaseClient'

function todayRange(){
  const d = new Date()
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0,0,0).toISOString()
  const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23,59,59).toISOString()
  return { start, end }
}

export default function Page(){
  useAuth(true)
  const [ag, setAg] = useState([])
  const [vis, setVis] = useState({})

  useEffect(()=>{ load() },[])

  async function load(){
    const { start, end } = todayRange()
    const { data: ags } = await supabase
      .from('agendamentos')
      .select('id, inicio, fim, condominio_id, condominios(nome)')
      .gte('inicio', start).lte('inicio', end)
      .order('inicio', { ascending:true })
    setAg(ags||[])

    const ids = (ags||[]).map(a=>a.id)
    if(ids.length){
      const { data: v } = await supabase.from('visitas')
        .select('id, agendamento_id, inicio, fim, duracao_min')
        .in('agendamento_id', ids)
      const map = {}; (v||[]).forEach(x=> map[x.agendamento_id] = x)
      setVis(map)
    } else {
      setVis({})
    }
  }

  async function checkIn(a){
    const { data } = await supabase.from('visitas').insert({
      condominio_id:a.condominio_id, agendamento_id:a.id, inicio: new Date().toISOString()
    }).select().single()
    setVis(prev=>({ ...prev, [a.id]: data }))
  }

  async function checkOut(a){
    const v = vis[a.id]; if(!v) return
    const { data } = await supabase.from('visitas').update({
      fim: new Date().toISOString()
    }).eq('id', v.id).select().single()
    setVis(prev=>({ ...prev, [a.id]: data }))
  }

  return (
    <div className="card">
      <h2>Agenda de hoje</h2>
      <table className="table">
        <thead><tr><th>Condomínio</th><th>Início</th><th>Fim</th><th>Check-in</th><th>Check-out</th><th>Duração</th><th>Ações</th></tr></thead>
        <tbody>
          {ag.map(a=>{
            const v = vis[a.id] || {}
            const nome = a.condominios?.nome || '--'
            return (
              <tr key={a.id}>
                <td>{nome}</td>
                <td>{new Date(a.inicio).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}</td>
                <td>{new Date(a.fim).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}</td>
                <td>{v.inicio ? new Date(v.inicio).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}) : '-'}</td>
                <td>{v.fim ? new Date(v.fim).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}) : '-'}</td>
                <td>{v.duracao_min ?? '-'}</td>
                <td>
                  <button onClick={()=>checkIn(a)} disabled={!!v.inicio}>Check-in</button>{' '}
                  <button onClick={()=>checkOut(a)} disabled={!v.inicio || !!v.fim}>Check-out</button>{' '}
                  <a className="badge" target="_blank" href={`https://waze.com/ul?ll=-23.55,-46.63&navigate=yes`}>Waze</a>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
