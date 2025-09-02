'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../lib/useAuth'
import { supabase } from '../lib/supabaseClient'

function monthRange(date=new Date()){
  const y = date.getFullYear(), m = date.getMonth()
  const start = new Date(y, m, 1, 0,0,0).toISOString()
  const end = new Date(y, m+1, 0, 23,59,59).toISOString()
  return { start, end }
}

export default function Page(){
  useAuth(true)
  const [condos, setCondos] = useState([])
  const [vis, setVis] = useState([])
  const [refDate, setRefDate] = useState(new Date())

  useEffect(()=>{ load() },[refDate])
  async function load(){
    const { data: c } = await supabase.from('condominios').select('id, nome, minutos_contratados_mes').order('nome')
    setCondos(c||[])
    const { start, end } = monthRange(refDate)
    const { data: v } = await supabase
      .from('visitas')
      .select('id, condominio_id, duracao_min, inicio, fim')
      .gte('inicio', start).lte('inicio', end)
    setVis(v||[])
  }

  const linhas = useMemo(()=>{
    const map = {}
    for(const c of condos){
      map[c.id] = { nome:c.nome, contratados:c.minutos_contratados_mes||0, realizados:0 }
    }
    for(const v of vis){
      if(map[v.condominio_id]) map[v.condominio_id].realizados += (v.duracao_min||0)
    }
    return Object.entries(map).map(([id, o])=>{
      const saldo = (o.contratados||0) - (o.realizados||0)
      return { id, ...o, saldo }
    }).sort((a,b)=> a.nome.localeCompare(b.nome))
  }, [condos, vis])

  function ym(val){ const d = new Date(val); const y = d.getFullYear(); const m = String(d.getMonth()+1).padStart(2,'0'); return `${y}-${m}` }

  return (
    <div className="card">
      <h2>Relatório — Horas contratadas x realizadas</h2>
      <div style={{margin:'10px 0 16px'}}>
        <label>Mês de referência:&nbsp;</label>
        <input type="month" value={ym(refDate)} onChange={e=>{ const [Y,M] = e.target.value.split('-'); setRefDate(new Date(Number(Y), Number(M)-1, 1)) }} />
      </div>
      <table className="table">
        <thead><tr><th>Condomínio</th><th>Min (contratados)</th><th>Min (realizados)</th><th>Saldo (min)</th><th>Saldo (horas)</th></tr></thead>
        <tbody>
        {linhas.map(l=>{
          const saldoHoras = (l.saldo/60).toFixed(2)
          return (
            <tr key={l.id}>
              <td>{l.nome}</td>
              <td>{l.contratados}</td>
              <td>{l.realizados}</td>
              <td>{l.saldo}</td>
              <td>{saldoHoras}</td>
            </tr>
          )
        })}
        </tbody>
      </table>
      <p className="small">A duração é calculada automaticamente quando a visita recebe Check-out.</p>
    </div>
  )
}
