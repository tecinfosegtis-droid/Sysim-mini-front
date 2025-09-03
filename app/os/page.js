'use client'
export const metadata = { title: 'Sysim Mini – OS' }

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

function fmt(dt) { if (!dt) return '-'; const d = new Date(dt); return d.toLocaleString() }

export default function Page() {
  const [condos, setCondos] = useState([])
  const [lista, setLista] = useState([])

  const [condominioId, setCondominioId] = useState('')
  const [tarefasStr, setTarefasStr] = useState('')
  const [observacoes, setObservacoes] = useState('')

  async function carregarCondos() {
    const { data, error } = await supabase.from('condominios').select('id, nome').order('nome')
    if (error) alert(error.message)
    setCondos(data || [])
    if (data?.[0] && !condominioId) setCondominioId(data[0].id)
  }

  async function carregarOS() {
    const { data, error } = await supabase
      .from('os')
      .select('id, condominio_id, tarefas, observacoes, status, criada_em, concluida_em, condominios ( nome )')
      .order('criada_em', { ascending: false })
    if (error) alert(error.message)
    setLista(data || [])
  }

  async function adicionar(e) {
    e.preventDefault()
    if (!condominioId) return alert('Selecione o condomínio')
    const tarefas = tarefasStr
      .split(',')
      .map(t => t.trim())
      .filter(Boolean)

    const { error } = await supabase.from('os').insert([{
      condominio_id: condominioId,
      tarefas,
      observacoes: observacoes || null,
      status: 'pendente'
    }])
    if (error) return alert(error.message)

    setTarefasStr(''); setObservacoes('')
    carregarOS()
  }

  async function setStatus(id, status) {
    const patch = { status }
    if (status === 'concluida') patch.concluida_em = new Date().toISOString()
    const { error } = await supabase.from('os').update(patch).eq('id', id)
    if (error) return alert(error.message)
    carregarOS()
  }

  useEffect(() => { carregarCondos(); carregarOS() }, [])

  return (
    <div className="page">
      <h1>Ordens de Serviço</h1>

      <form onSubmit={adicionar} className="card" style={{ marginBottom: 24 }}>
        <div className="grid">
          <label>Condomínio
            <select value={condominioId} onChange={e=>setCondominioId(e.target.value)}>
              {condos.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </label>
          <label>Tarefas (separe por vírgula)
            <input value={tarefasStr} onChange={e=>setTarefasStr(e.target.value)} placeholder="Ex.: Verificar portaria, Checar bombas" />
          </label>
          <label>Observações
            <input value={observacoes} onChange={e=>setObservacoes(e.target.value)} placeholder="Opcional" />
          </label>
        </div>
        <button type="submit">Adicionar</button>
      </form>

      <div className="card">
        <h2>Lista</h2>
        {lista.length === 0 && <p>Nenhuma OS.</p>}
        <table className="table">
          <thead>
            <tr>
              <th>Condomínio</th><th>Tarefas</th><th>Status</th><th>Criada</th><th>Concluída</th><th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {lista.map(o => (
              <tr key={o.id}>
                <td>{o.condominios?.nome || o.condominio_id}</td>
                <td>{Array.isArray(o.tarefas) ? o.tarefas.join(' • ') : '-'}</td>
                <td>{o.status}</td>
                <td>{fmt(o.criada_em)}</td>
                <td>{fmt(o.concluida_em)}</td>
                <td style={{ display:'flex', gap:8 }}>
                  <button onClick={() => setStatus(o.id, 'pendente')}>Pendente</button>
                  <button onClick={() => setStatus(o.id, 'em_andamento')}>Em andamento</button>
                  <button onClick={() => setStatus(o.id, 'concluida')}>Concluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .page { padding: 24px; }
        .card { background: #111820; border-radius: 12px; padding: 16px; }
        .grid { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 12px; }
        @media (max-width: 700px){ .grid{ grid-template-columns: 1fr } }
        label { display: grid; gap: 6px; font-size: 14px; }
        input, button, select, textarea { background: #0b131a; border: 1px solid #223; color: #e5f3ff; padding: 10px; border-radius: 8px; }
        button { cursor: pointer; }
        .table { width: 100%; border-collapse: collapse; margin-top: 12px; }
        .table th, .table td { border-top: 1px solid #223; padding: 8px; text-align: left; }
      `}</style>
    </div>
  )
}
