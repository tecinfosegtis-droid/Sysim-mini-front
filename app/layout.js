'use client'
import './globals.css'
import Link from 'next/link'
import { theme } from './theme'
import { useAuth } from './lib/useAuth'
import { supabase } from './lib/supabaseClient'
// Se ainda não criou o VersionBadge, você pode comentar as 2 linhas abaixo temporariamente:
// import VersionBadge from './components/VersionBadge'

export default function RootLayout({ children }){
  const session = useAuth(false)

  async function doLogout(){
    await supabase.auth.signOut()
    if (typeof window !== 'undefined') window.location.href = '/'
  }

  return (
    <html lang="pt-BR">
      <head>
        <link rel="icon" href="/favicon.png" sizes="any" />
        <title>Sysim Mini</title>
      </head>
      <body>
        <div className="container">
          <header className="header">
            <div style={{display:'flex',gap:10,alignItems:'center'}}>
              <img src="/logo.png" width="36" height="36" alt="logo" style={{borderRadius:8}}/>
              <div>
                <div style={{fontWeight:900, letterSpacing:.3}}>{theme?.name || 'Sysim Mini'}</div>
                <div className="small">Atendimento • Agenda • OS</div>
              </div>
            </div>
            <nav className="nav">
              <Link href="/">Login</Link>
              <Link href="/dashboard">Painel</Link>
              <Link href="/agenda">Agenda</Link>
              <Link href="/os">OS</Link>
              <Link href="/condominios">Condomínios</Link>
              <Link href="/relatorios">Relatórios</Link>
              {session ? <button onClick={doLogout}>Sair</button> : null}
            </nav>
          </header>

          {/* conteúdo das páginas */}
          {children}

          {/* rodapé / badge de versão (opcional) */}
          {/* <div style={{marginTop:16, display:'flex', justifyContent:'flex-end'}}>
            <VersionBadge/>
          </div> */}
        </div>
      </body>
    </html>
  )
}
