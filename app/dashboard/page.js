'use client'

import { useEffect, useState } from 'react'

export default function Page(){
  const [agenda, setAgenda] = useState([])
  const [oss, setOs] = useState([])

  useEffect(()=>{
    fetch('/api/agenda').then(r=>r.json()).then(setAgenda)
    fetch('/api/os').then(r=>r.json()).then(setOs)
  },[])

  return (
    <div style={{padding:20}}>
      <h2>Painel</h2>
      <div>Atendimentos de hoje: <strong>{agenda.length}</strong></div>
      <div>OS concluídas: <strong>{oss.filter(x=>x.status==='Concluído').length}</strong></div>
    </div>
  )
}
