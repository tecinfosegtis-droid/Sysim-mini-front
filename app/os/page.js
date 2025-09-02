'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { useAuth } from '../lib/useAuth'
import { supabase } from '../lib/supabaseClient'
import { gerarOsPdf } from '../lib/pdf'

export default function Page(){
  useAuth(true)
  const [oss, setOs] = useState([])
  const [form, setForm] = useState({condominio_id:'', tarefas:'', obs:''})
  const [condos, setCondos] = useState([])
  const [sigOpen, setSigOpen] = useState(null) // id da OS aberta para assinatura
  const [assinante, setAssinante] = useState('')
  const [sigData, setSigData] = useState('')   // base64

  useEffect(()=>{ load() },[])

  async function load(){
    const { data: c } = await supabase.from('condominios').select('id, nome').order('nome')
    setCondos(c||[])
    const { data: o } = await supabase.from('os').select('id, condominio_id, tarefas, status, obs, created_at, assinante_nome, assinatura_base64, condominios(nome)').order('created_at', { ascending:false })
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

  function openSig(os){
    setAssinante(os.assinante_nome||'')
    setSigData(os.assinatura_base64||'')
    setSigOpen(os.id)
    setTimeout(()=>{
      const c = document.getElementById('sigpad')
      if(!c) return
      const ctx = c.getContext('2d')
      ctx.fillStyle = '#fff'; ctx.fillRect(0,0,c.width,c.height)
      if (os.assinatura_base64){
        const img = new Image()
        img.onload = ()=> ctx.drawImage(img, 0,0, c.width, c.height)
        img.src = os.assinatura_base64
      }
      let drawing = false, last = null
      c.onmousedown = e => { drawing = true; last = pos(e) }
      c.onmouseup = () => drawing = false
      c.onmouseleave = () => drawing = false
      c.onmousemove = e => { if(!drawing) return; const p=pos(e); ctx.strokeStyle='#000'; ctx.lineWidth=2; ctx.lineCap='round'; ctx.beginPath(); ctx.moveTo(last.x,last.y); ctx.lineTo(p.x,p.y); ctx.stroke(); last=p }
      c.ontouchstart = e => { e.preventDefault(); drawing=true; last=posTouch(e) }
      c.ontouchend = e => { drawing=false }
      c.ontouchmove = e => { e.preventDefault(); if(!drawing) return; const p=posTouch(e); ctx.strokeStyle='#000'; ctx.lineWidth=2; ctx.lineCap='round'; ctx.beginPath(); ctx.moveTo(last.x,last.y); ctx.lineTo(p.x,p.y); ctx.stroke(); last=p }
      function pos(ev){ const r=c.getBoundingClientRect(); return {x:ev.clientX-r.left, y:ev.clientY-r.top} }
      function posTouch(ev){ const t=ev.touches[0]; const r=c.getBoundingClientRect(); return {x:t.clientX-r.left, y:t.clientY-r.top} }
    }, 50)
  }

  async function saveSig(){
    const c = document.getElementById('sigpad')
    const dataUrl = c.toDataURL('image/png')
    const { error } = await supabase.from('os').update({ assinante_nome: assinante, assinatura_base64: dataUrl }).eq('id', sigOpen)
    if(!error){ setSigOpen(null); load() }
  }

  async function gerarPdf(os){
    const nome = os.condominios?.nome || condos.find(c=>c.id===os.condominio_id)?.nome || 'Condomínio'
    await gerarOsPdf({ os, condominioNome: nome })
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
              <button onClick={()=>setStatus(o.id,'Concluído')}>Concluir</button>{' '}
              <button onClick={()=>openSig(o)}>Assinar</button>{' '}
              <button onClick={()=>gerarPdf(o)}>Gerar PDF</button>
            </td>
          </tr>
        ))}</tbody>
      </table>

      {sigOpen && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,.6)', display:'grid', placeItems:'center', zIndex:50}}>
          <div className="card" style={{width:'min(96vw,720px)'}}>
            <h3>Assinatura</h3>
            <label>Nome do assinante</label>
            <input placeholder="Responsável" value={assinante} onChange={e=>setAssinante(e.target.value)} />
            <div style={{border:'1px solid #333', borderRadius:8, overflow:'hidden', background:'#fff', margin:'10px 0'}}>
              <canvas id="sigpad" width="680" height="220" style={{width:'100%', height:220, display:'block', background:'#fff'}}></canvas>
            </div>
            <div style={{display:'flex', gap:8, justifyContent:'flex-end'}}>
              <button onClick={()=>{ const c=document.getElementById('sigpad'); const ctx=c.getContext('2d'); ctx.fillStyle='#fff'; ctx.fillRect(0,0,c.width,c.height) }}>Limpar</button>
              <button onClick={saveSig} disabled={!assinante}>Salvar</button>
              <button onClick={()=>setSigOpen(null)}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
