'use client'
export const metadata = { title: 'Sysim Mini – Condomínios' }

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Page() {
  const [lista, setLista] = useState([])
  const [loading, setLoading] = useState(false)
  const [nome, setNome] = useState('')
  const [endereco, setEndereco] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')

  async function carregar() {
    setLoading(true)
    const { data, error } = await supabase
      .from('condominios')
      .select('id, nome, endereco, latitude, longitude, created_at')
      .order('created_at', { ascending: false })
    if (error) alert('Erro ao carregar: ' + error.message)
    setLista(data || [])
    setLoading(false)
  }

  async function salvar(e) {
    e.preventDefault()
    if (!nome) return alert('Informe o nome')
    const { error } = await supabase.from('condominios').insert([{
      nome,
      endereco: endereco || null,
      latitude: latitude ? Number(latitude) : null,
      longitude: longitude ? Number(longitude) : null
    }])
    if (error) return alert('Erro ao salvar: ' + error.message)
    setNome(''); setEndereco(''); setLatitude(''); setLongitude('')
    carregar()
  }

  async function remover(id) {
    if (!confirm('Excluir este condomínio?')) return
    const { error } = await supabase.from('condominios').delete().eq('id', id)
    if (error) return alert('Erro ao excluir: ' + error.message)
    carregar()
  }

  useEffect(() => { carregar() }, [])

  return (
    <div className="page">
      <h1>Condomínios</h1>

      <form onSubmit={salvar} className="card" style={{ marginBottom: 24 }}>
        <div className="grid">
          <label>Nome
            <input value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex.: Residencial Sol" />
          </label>
          <label>Endereço
            <input value={endereco} onChange={e => setEndereco(e.target.value)} placeholder="Rua X, 123" />
          </label>
          <label>Latitude
            <input value={latitude} onChange={e => setLatitude(e.target.value)} type="number" step="0.000001" />
          </label>
          <label>Longitude
            <input value={longitude} onChange={e => setLongitude(e.target.value)} type="number" step="0.000001" />
          </label>
        </div>
        <button type="submit">Adicionar</button>
      </form>

      <div className="card">
        <h2>Lista {loading && '…'}</h2>
        {lista.length === 0 && <p>Nenhum condomínio cadastrado ainda.</p>}
        <table className="table">
          <thead>
            <tr><th>Nome</th><th>Endereço</th><th>Lat/Lon</th><th>Ações</th></tr>
          </thead>
          <tbody>
            {lista.map(c => (
              <tr key={c.id}>
                <td>{c.nome}</td>
                <td>{c.endereco || '-'}</td>
                <td>{[c.latitude, c.longitude].filter(v=>v!==null).join(', ') || '-'}</td>
                <td>
                  <button onClick={() => remover(c.id)}>Excluir</button>
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


