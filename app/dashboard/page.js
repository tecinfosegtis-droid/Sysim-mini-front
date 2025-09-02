'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { useAuth } from '../lib/useAuth'
import { supabase } from '../lib/supabaseClient'

export default function Page(){
  useAuth(true)
  const [agenda, setAgenda] = useState([])
  const [oss, setOs] = useState([])

  useEffect(()=>{
    supabase.from('agendamentos')
      .select('id')
      .then(({data})=> setAgenda(data||[]))
    supabase.from('os')
      .select('id, status')
      .then(({data})=> setOs(data||[]))
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
