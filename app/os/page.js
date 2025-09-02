'use client'
import { useEffect, useState } from 'react'

export default function Page(){
  const [oss, setOs] = useState([])
  const [form, setForm] = useState({condominio:'', tarefas:'', obs:''})

  useEffect(()=>{ fetch('/api/os').then(r=>r.json()).then(setOs) },[])

  function add(){
    const entry = { id: Date.now(), condominio: form.condominio, tarefas: (form.tarefas||'').split(',').map(s=>s.trim()).filter(Boolean), status:'Pendente', obs: form.obs }
    setOs(prev=>[...prev, entry])
    setForm({condominio:'', tarefas:'', obs:''})
  }

  return (
    <div className="card">
      <h2>Ordens de Serviço</h2>
      <div style={{display:'grid', gap:8, margin:'10px 0 16px'}}>
        <label>Condomínio</label>
        <input value={form.condominio} onChange={e=>setForm({...form,condominio:e.target.value})}/>
        <label>Tarefas (separe por vírgula)</label>
        <input value={form.tarefas} onChange={e=>setForm({...form,tarefas:e.target.value})}/>
        <label>Observações</label>
        <input value={form.obs} onChange={e=>setForm({...form,obs:e.target.value})}/>
        <button onClick={add}>Adicionar</button>
      </div>
      <table className="table">
        <thead><tr><th>Condomínio</th><th>Tarefas</th><th>Status</th></tr></thead>
        <tbody>{oss.map(o=>(<tr key={o.id}><td>{o.condominio}</td><td>{o.tarefas.join(', ')}</td><td>{o.status}</td></tr>))}</tbody>
      </table>
    </div>
  )
}
