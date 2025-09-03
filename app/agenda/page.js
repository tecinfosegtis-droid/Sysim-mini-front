'use client'
export const metadata = { title: 'Sysim Mini – Agenda' }

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

function iso(dt) { return new Date(dt).toISOString() }
function fmt(dt) { if (!dt) return '-'; const d = new Date(dt); return d.toLocaleString() }

export default function Page() {
  const [condos, setCondos] = useState([])
  const [lista, setLista] = useState([])
  const [condominioId, setCondominioId] = useState('')
  const [prevDe, setPrevDe] = useState('')
  const [prevAte, setPrevAte] = useState('')
  const [obs, setObs] = useState('')

  async function carregarCondos() {
    const { data, error } = await supabase.from('condominios').select('id, nome').order('nome')
    if (error) alert(error.message)
    setCondos(data || [])
    if (data?.[0] && !condominioId) setCondominioId(data[0].id)
  }

  async function carregarAgenda() {
    // join para trazer nome do condomínio
    const { data, error } = await supabase
      .from('agenda')
      .select('id, condominio_id, previsto_de, previsto_ate, checkin_at, checkout_at, observacoes, condominios ( nome )')
      .order('previsto_de', { ascending: true })
    if (error) alert(error.message)
    setLista(data || [])
  }

  async function agendar(e) {
    e.preventDefault()
    if (!condominioId || !prevDe || !prevAte) return alert('Preencha condomínio e horários')
    const { error } = await supabase.from('agenda').insert([{
      condominio_id: condominioId,
      previsto_de: iso(prevDe),
      previsto_ate: iso(prevAte),
      observacoes: obs || null
    }])
    if (error) return alert(error.message)
    setPrevDe(''); setPrevAte(''); setObs('')
    carregarAgenda()
  }

  async function checkin(id) {
    const { error } = await supabase.from('agenda').update({ checkin_at: new Date().toISOString() }).eq('id', id)
    if (error) return alert(error.message)
    carregarAgenda()
  }

  async function checkout(id) {
    const { error } = await supabase.from('agenda').update({ checkout_at: new Date().toISOString() }).eq('id', id)
    if (error) return alert(error.message)
    carregarAgenda()
  }

  useEffect(() => { carregarCondos(); carregarAgenda() }, [])

  return (
    <div className="page">
      <h1>Agenda</h1>

      <form onSubmit={agendar} className="card" style={{ marginBottom: 24 }}>
        <div className="grid">
          <label>Condomínio
            <select value={condominioId} onChange={e=>setCondominioId(e.target.value)}>
              {condos.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </label>
          <label>Previsto de
            <input type="datetime-local" value={prevDe} onChange={e=>setPrevDe(e.target.value)} />
          </label>
          <label>Previsto até
            <input type="datetime-local" value={prevAte} onChange={e=>setPrevAte(e.target.value)} />
          </label>
          <label>Observações
            <input value={obs} onChange={e=>setObs(e.target.value)} placeholder="Opcional" />
          </label>
        </div>
        <button type="submit">Agendar</button>
      </form>

      <div className="card">
        <h2>Agendas</h2>
        {lista.length === 0 && <p>Nenhum item.</p>}
        <table className="table">
          <thead>
            <tr>
              <th>Condomínio</th><th>Previsto</th><th>Check-in</th><th>Check-out</th><th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {lista.map(a => (
              <tr key={a.id}>
                <td>{a.condominios?.nome || a.condominio_id}</td>
                <td>{fmt(a.previsto_de)} → {fmt(a.previsto_ate)}</td>
                <td>{fmt(a.checkin_at)}</td>
                <td>{fmt(a.checkout_at)}</td>
                <td style={{ display:'flex', gap:8 }}>
                  <button onClick={() => checkin(a.id)}>Check-in</button>
                  <button onClick={() => checkout(a.id)}>Check-out</button>
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
