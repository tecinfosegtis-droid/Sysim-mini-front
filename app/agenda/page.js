'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '../lib/useAuth'
import { supabase } from '../lib/supabaseClient'
import { ensureNotificationReady, getDefaultMinutes, setDefaultMinutes, sendNotification } from '../lib/notify'

function todayRange(){
  const d = new Date()
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0,0,0).toISOString()
  const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23,59,59).toISOString()
  return { start, end }
}

function toTime(ts){
  return new Date(ts).toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' })
}

export default function Page(){
  useAuth(true)
  const [ag, setAg] = useState([])
  const [vis, setVis] = useState({})
  const [minutes, setMinutes] = useState(getDefaultMinutes())
  const triggeredRef = useRef({}) // evita notificar duas vezes

  useEffect(()=>{ load(); ensureNotificationReady() },[])
  useEffect(()=>{ setDefaultMinutes(minutes) },[minutes])

  async function load(){
    const { start, end } = todayRange()
    const { data: ags } = await supabase
      .from('agendamentos')
      .select('id, inicio, fim, condominio_id, condominios(nome,endereco)')
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

  // checagem de lembretes a cada 30s
  useEffect(()=>{
    const t = setInterval(()=>{
      const now = Date.now()
      for(const a of ag){
        const start = new Date(a.inicio).getTime()
        const diffMin = Math.round((start - now) / 60000)
        if (diffMin <= minutes && diffMin >= (minutes-1)) {
          if(!triggeredRef.current[a.id]){
            triggeredRef.current[a.id] = true
            const nome = a.condominios?.nome || 'Condomínio'
            const body = `Começa às ${toTime(a.inicio)} • ${nome}`
            sendNotification({ title: 'Lembrete de atendimento', body })
          }
        }
      }
    }, 30000)
    return ()=> clearInterval(t)
  }, [ag, minutes])

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

      <div style={{display:'flex', gap:12, alignItems:'center', margin:'8px 0 14px'}}>
        <label className="small">Lembrar antes (min):</label>
        <input type="number" min={1} max={240} value={minutes} onChange={e=>setMinutes(Number(e.target.value||15))} style={{width:100}} />
        <span className="small">Ative as notificações do navegador para receber os alertas.</span>
      </div>

      <table className="table">
        <thead><tr><th>Condomínio</th><th>Início</th><th>Fim</th><th>Check-in</th><th>Check-out</th><th>Duração</th><th>Ações</th></tr></thead>
        <tbody>
          {ag.map(a=>{
            const v = vis[a.id] || {}
            const nome = a.condominios?.nome || '--'
            return (
              <tr key={a.id}>
                <td>{nome}</td>
                <td>{toTime(a.inicio)}</td>
                <td>{toTime(a.fim)}</td>
                <td>{v.inicio ? toTime(v.inicio) : '-'}</td>
                <td>{v.fim ? toTime(v.fim) : '-'}</td>
                <td>{v.duracao_min ?? '-'}</td>
                <td>
                  <button onClick={()=>checkIn(a)} disabled={!!v.inicio}>Check-in</button>{' '}
                  <button onClick={()=>checkOut(a)} disabled={!v.inicio || !!v.fim}>Check-out</button>{' '}
                  <a className="badge" target="_blank" href={`https://waze.com/ul?q=${encodeURIComponent(a.condominios?.endereco || nome)}`}>Waze</a>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
