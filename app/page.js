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
    const res = await fetch('/api/login', { 
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ email, password })
    })
    if(res.ok){
      const data = await res.json()
      if(typeof window!=='undefined') localStorage.setItem('role', data.role)
      router.push('/dashboard')
    } else {
      setError('Credenciais inválidas')
    }
  }

  return (
    <div className="card">
      <h1>Entrar</h1>
      <form onSubmit={onSubmit}>
        <label>E-mail</label>
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="seu@email.com"/>
        <label>Senha</label>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="******"/>
        <div style={{display:'flex', gap:10, marginTop:14}}>
          <button type="submit">Entrar</button>
          <a className="badge" href="/dashboard">Ver demo sem login</a>
        </div>
      </form>
      {error && <div style={{color:'#fca5a5', marginTop:10}}>{error}</div>}
    </div>
  )
}
