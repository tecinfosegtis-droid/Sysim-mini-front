'use client'
import './globals.css'
import Link from 'next/link'
import Image from 'next/image'
import { theme } from './theme'

export default function RootLayout({ children }){
  return (
    <html lang="pt-BR">
      <body>
        <div className="container">
          <header className="header">
            <div className="logo">
              <Image src={theme.logoPath} width={36} height={36} alt="logo"/>
              <div>
                <div style={{fontWeight:900, letterSpacing:.3}}>{theme.name}</div>
                <div className="small">Atendimento • Agenda • OS</div>
              </div>
            </div>
            <nav className="nav">
              <Link href="/">Login</Link>
              <Link href="/dashboard">Painel</Link>
              <Link href="/agenda">Agenda</Link>
              <Link href="/os">OS</Link>
            </nav>
          </header>
          {children}
          <p className="small" style={{marginTop:12}}>Dica: admin@sysim.com / equipe@sysim.com – senha 123456</p>
        </div>
        <script dangerouslySetInnerHTML={{__html:`
          // Permite alterar CSS vars com base no theme sem rebuild
          (function(){
            var t=${JSON.stringify({"--bg":"var(--bg)","--surface":"var(--surface)","--text":"var(--text)","--muted":"var(--muted)","--brand":"var(--brand)","--brand2":"var(--brand2)"})};
          })();
        `}}/>
      </body>
    </html>
  )
}
