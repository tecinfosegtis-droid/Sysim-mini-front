'use client'
import './globals.css'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function RootLayout({ children }){
  const pathname = usePathname()
  return (
    <html lang="pt-BR"><body>
      <div className="container">
        <div className="header">
          <div style={{display:'flex', gap:8, alignItems:'center'}}>
            <span className="badge">Sysim Mini</span>
            <strong>Agenda & OS</strong>
          </div>
          <nav className="nav">
            <Link href="/">Login</Link>
            <Link href="/dashboard">Painel</Link>
            <Link href="/agenda">Agenda</Link>
            <Link href="/os">OS</Link>
          </nav>
        </div>
        {children}
        <p className="small">Usuários de teste: admin@sysim.com / equipe@sysim.com (senha 123456)</p>
      </div>
    </body></html>
  )
}
