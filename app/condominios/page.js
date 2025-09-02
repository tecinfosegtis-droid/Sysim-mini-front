'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { useAuth } from '../lib/useAuth'
import { supabase } from '../lib/supabaseClient'

export default function Page(){
  useAuth(true)
  const [items, setItems] = useState([])
  const [form, setForm] = useState({nome:'', endereco:'', minutos_contratados_mes: 0})

  useEffect(()=>{ load() },[])
  async function load(){
    const { data } = await supabase.from('condominios').select('*').order('nome')
    setItems(data||[])
  }

  async function add(){
    const { error } = await supabase.from('condominios').insert({
      nome: form.nome,
      endereco: form.endereco,
      minutos_contratados_mes: Number(form.minutos_contratados_mes||0)
    })
    if(!error){ setForm({nome:'', endereco:'', minutos_contratados_mes: 0}); load() }
  }

  async function update(campo, id, valor){
    const payload = {}; payload[campo] = campo==='minutos_contratados_mes' ? Number(valor||0) : valor
    const { error } = await supabase.from('condominios').update(payload).eq('id', id)
    if(!error){ load() }
  }

  async function del(id){
    const { error } = await supabase.from('condominios').delete().eq('id', id)
    if(!error){ load() }
  }

  return (
    <div className="card">
      <h2>Condomínios</h2>
      <div style={{display:'grid', gap:8, margin:'10px 0 16px', maxWidth:720}}>
        <label>Nome</label>
        <input value={form.nome} onChange={e=>setForm({...form,nome:e.target.value})}/>
        <label>Endereço</label>
        <input value={form.endereco} onChange={e=>setForm({...form,endereco:e.target.value})}/>
        <label>Minutos contratados (mês)</label>
        <input type="number" value={form.minutos_contratados_mes} onChange={e=>setForm({...form,minutos_contratados_mes:e.target.value})}/>
        <button onClick={add} disabled={!form.nome}>Adicionar</button>
      </div>

      <table className="table">
        <thead><tr><th>Nome</th><th>Endereço</th><th>Minutos/mês</th><th>Ações</th></tr></thead>
        <tbody>
        {items.map(i=>(
          <tr key={i.id}>
            <td><input value={i.nome||''} onChange={e=>update('nome', i.id, e.target.value)} /></td>
            <td><input value={i.endereco||''} onChange={e=>update('endereco', i.id, e.target.value)} /></td>
            <td style={{width:140}}><input type="number" value={i.minutos_contratados_mes||0} onChange={e=>update('minutos_contratados_mes', i.id, e.target.value)} /></td>
            <td><button onClick={()=>del(i.id)}>Excluir</button> {' '} <a className="badge" target="_blank" href={`https://waze.com/ul?q=${encodeURIComponent(i.endereco||i.nome)}`}>Waze</a></td>
          </tr>
        ))}
        </tbody>
      </table>
    </div>
  )
}
