'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from './lib/supabaseClient'

export default function Page(){
  const [email, setEmail] = useState('admin@sysim.com')
  const [password, setPassword] = useState('123456')
  const [error, setError] = useState('')
  const router = useRouter()

  async function onSubmit(e){
    e.preventDefault()
    setError('')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if(error){ setError(error.message); return }
    router.push('/dashboard')
  }

  return (
    <section className="hero" style={{textAlign:'center'}}>
      <div style={{marginBottom:20}}>
        <img src="/logo-horizontal.png" alt="Sysim Mini" style={{maxWidth:320, margin:'0 auto'}} />
      </div>
      <form onSubmit={onSubmit} style={{display:'grid', gap:10, maxWidth:440, margin:'0 auto'}}>
        <label>E-mail</label>
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="voce@empresa.com"/>
        <label>Senha</label>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="******"/>
        <div style={{display:'flex', gap:10, justifyContent:'center'}}>
          <button type="submit">Entrar</button>
          <a className="badge" href="/dashboard">Explorar sem login</a>
        </div>
      </form>
      {error && <div style={{color:'#fca5a5', marginTop:10}}>{error}</div>}
      <p className="small" style={{marginTop:10}}>Crie os usuários no Supabase Auth para usar o login.</p>
    </section>
  )
}
