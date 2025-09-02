'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '../lib/useAuth'
import { supabase } from '../lib/supabaseClient'

export default function Page(){
  useAuth(true)
  const [oss, setOs] = useState([])
  const [form, setForm] = useState({condominio_id:'', tarefas:'', obs:''})
  const [condos, setCondos] = useState([])

  useEffect(()=>{ load() },[])

  async function load(){
    const { data: c } = await supabase.from('condominios').select('id, nome').order('nome')
    setCondos(c||[])
    const { data: o } = await supabase.from('os').select('id, condominio_id, tarefas, status, obs, created_at, condominios(nome)').order('created_at', { ascending:false })
    setOs(o||[])
  }

  async function add(){
    const tarefasArray = (form.tarefas||'').split(',').map(s=>s.trim()).filter(Boolean)
    const { error } = await supabase.from('os').insert({ condominio_id: form.condominio_id, tarefas: tarefasArray, obs: form.obs })
    if(error){ console.error(error); return }
    setForm({condominio_id:'', tarefas:'', obs:''})
    load()
  }

  async function setStatus(id, status){
    const { error } = await supabase.from('os').update({ status }).eq('id', id)
    if(error){ console.error(error); return }
    load()
  }

  return (
    <div className="card">
      <h2>Ordens de Serviço</h2>
      <div style={{display:'grid', gap:8, margin:'10px 0 16px', maxWidth:620}}>
        <label>Condomínio</label>
        <select value={form.condominio_id} onChange={e=>setForm({...form,condominio_id:e.target.value})}>
          <option value="">Selecione...</option>
          {condos.map(c=>(<option key={c.id} value={c.id}>{c.nome}</option>))}
        </select>
        <label>Tarefas (separe por vírgula)</label>
        <input value={form.tarefas} onChange={e=>setForm({...form,tarefas:e.target.value})}/>
        <label>Observações</label>
        <input value={form.obs} onChange={e=>setForm({...form,obs:e.target.value})}/>
        <button onClick={add} disabled={!form.condominio_id}>Adicionar</button>
      </div>
      <table className="table">
        <thead><tr><th>Condomínio</th><th>Tarefas</th><th>Status</th><th>Ações</th></tr></thead>
        <tbody>{oss.map(o=>(
          <tr key={o.id}>
            <td>{o.condominios?.nome || o.condominio_id}</td>
            <td>{(o.tarefas||[]).join(', ')}</td>
            <td>{o.status}</td>
            <td>
              <button onClick={()=>setStatus(o.id,'Pendente')}>Pendente</button>{' '}
              <button onClick={()=>setStatus(o.id,'Em andamento')}>Em andamento</button>{' '}
              <button onClick={()=>setStatus(o.id,'Concluído')}>Concluir</button>
            </td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  )
}
