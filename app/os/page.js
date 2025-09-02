'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '../lib/useAuth'

const KEY='sysim_os_local'

function loadOs(){ if(typeof window==='undefined') return []; try{ return JSON.parse(localStorage.getItem(KEY)||'[]') }catch(e){ return [] } }
function saveOs(data){ if(typeof window==='undefined') return; localStorage.setItem(KEY, JSON.stringify(data)) }

export default function Page(){
  useAuth()
  const [oss, setOs] = useState([])
  const [form, setForm] = useState({condominio:'', tarefas:'', obs:''})

  useEffect(()=>{
    fetch('/api/os').then(r=>r.json()).then(data=>{
      const local = loadOs()
      setOs([...data, ...local])
    })
  },[])

  function add(){
    const entry = { id: Date.now(), condominio: form.condominio, tarefas: (form.tarefas||'').split(',').map(s=>s.trim()).filter(Boolean), status:'Pendente', obs: form.obs }
    const next=[...oss, entry]
    setOs(next); saveOs(next.filter(x=>x.id>=1e12)) // salva só os criados no cliente
    setForm({condominio:'', tarefas:'', obs:''})
  }

  function setStatus(id, status){
    const next = oss.map(o=> o.id===id ? {...o, status} : o)
    setOs(next); saveOs(next.filter(x=>x.id>=1e12))
  }

  return (
    <div className="card">
      <h2>Ordens de Serviço</h2>
      <div style={{display:'grid', gap:8, margin:'10px 0 16px', maxWidth:520}}>
        <label>Condomínio</label>
        <input value={form.condominio} onChange={e=>setForm({...form,condominio:e.target.value})}/>
        <label>Tarefas (separe por vírgula)</label>
        <input value={form.tarefas} onChange={e=>setForm({...form,tarefas:e.target.value})}/>
        <label>Observações</label>
        <input value={form.obs} onChange={e=>setForm({...form,obs:e.target.value})}/>
        <button onClick={add}>Adicionar</button>
      </div>
      <table className="table">
        <thead><tr><th>Condomínio</th><th>Tarefas</th><th>Status</th><th>Ações</th></tr></thead>
        <tbody>{oss.map(o=>(
          <tr key={o.id}>
            <td>{o.condominio}</td>
            <td>{o.tarefas.join(', ')}</td>
            <td>{o.status}</td>
            <td>
              <button onClick={()=>setStatus(o.id,'Pendente')}>Pendente</button>{' '}
              <button onClick={()=>setStatus(o.id,'Em andamento')}>Em andamento</button>{' '}
              <button onClick={()=>setStatus(o.id,'Concluído')}>Concluir</button>
            </td>
          </tr>
        ))}</tbody>
      </table>
      <p className="small">As OS criadas aqui ficam salvas neste dispositivo.</p>
    </div>
  )
}
