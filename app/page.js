'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Page(){
  const [email, setEmail] = useState('admin@sysim.com')
  const [password, setPassword] = useState('123456')
  const [error, setError] = useState('')
  const router = useRouter()

  async function onSubmit(e){
    e.preventDefault()
    setError('')
    const res = await fetch('/api/login',{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({email,password})})
    if(res.ok){ const d=await res.json(); localStorage.setItem('role', d.role); router.push('/dashboard') }
    else setError('Credenciais inválidas')
  }

  return (
    <section className="hero">
      <h1 style={{marginTop:0}}>Bem-vindo ao Sysim Mini</h1>
      <p className="small">Faça login para acessar sua agenda e ordens de serviço.</p>
      <form onSubmit={onSubmit} style={{display:'grid', gap:10, maxWidth:440}}>
        <label>E-mail</label>
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="voce@empresa.com"/>
        <label>Senha</label>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="******"/>
        <div style={{display:'flex', gap:10}}>
          <button type="submit">Entrar</button>
          <a className="badge" href="/dashboard">Explorar sem login</a>
        </div>
      </form>
      {error && <div style={{color:'#fca5a5', marginTop:10}}>{error}</div>}
    </section>
  )
}
