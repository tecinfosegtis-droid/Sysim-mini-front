'use client'
// Helper de PDF para OS
// Usa imports dinâmicos para não pesar o bundle inicial.
export async function gerarOsPdf({ os, condominioNome, logoPath='/logo-horizontal.png' }){
  const { jsPDF } = await import('jspdf')
  const autoTable = (await import('jspdf-autotable')).default

  const doc = new jsPDF({ unit:'pt', format:'a4' })
  const mm = n => n * 2.83465

  // Header
  if (logoPath){
    try{
      const img = await fetch(logoPath).then(r=>r.blob())
      const reader = await blobToDataURL(img)
      doc.addImage(reader, 'PNG', mm(20), mm(16), mm(60), mm(20), '', 'FAST')
    }catch{}
  }
  doc.setFont('helvetica','bold')
  doc.setFontSize(16)
  doc.text('Ordem de Serviço', mm(20), mm(55))
  doc.setFontSize(10)
  doc.setFont('helvetica','normal')
  doc.text(`Condomínio: ${condominioNome||'-'}`, mm(20), mm(65))
  doc.text(`Criada em: ${new Date(os.created_at||Date.now()).toLocaleString('pt-BR')}`, mm(20), mm(78))
  doc.text(`Status: ${os.status}`, mm(20), mm(90))

  // Tarefas
  const tarefas = (os.tarefas||[]).map((t,i)=> [i+1, t])
  autoTable(doc, {
    startY: mm(100),
    head: [['#','Tarefa']],
    body: tarefas.length ? tarefas : [[ '-', '—' ]],
    styles: { font:'helvetica', fontSize: 10, cellPadding: 6 },
    headStyles: { fillColor: [30,58,138], textColor: 255 }
  })

  // Observações
  const y = doc.lastAutoTable ? doc.lastAutoTable.finalY + mm(8) : mm(100)
  doc.setFont('helvetica','bold')
  doc.text('Observações', mm(20), y)
  doc.setFont('helvetica','normal')
  const obsText = (os.obs||'—')
  const obsLines = doc.splitTextToSize(obsText, mm(170))
  doc.text(obsLines, mm(20), y + mm(6))

  // Assinatura (se houver)
  let y2 = y + mm(6) + (obsLines.length * 12)
  y2 = Math.max(y2, mm(160))
  doc.setLineWidth(0.5)
  if (os.assinatura_base64){
    try{
      doc.addImage(os.assinatura_base64, 'PNG', mm(20), y2, mm(60), mm(30), '', 'FAST')
      doc.line(mm(20), y2 + mm(34), mm(90), y2 + mm(34))
      doc.text(os.assinante_nome || 'Assinante', mm(20), y2 + mm(40))
    }catch(e){
      doc.line(mm(20), y2 + mm(34), mm(90), y2 + mm(34))
      doc.text(os.assinante_nome || 'Assinante', mm(20), y2 + mm(40))
    }
  }else{
    doc.line(mm(20), y2 + mm(34), mm(90), y2 + mm(34))
    doc.text(os.assinante_nome || 'Assinante', mm(20), y2 + mm(40))
  }

  doc.save(`OS-${(condominioNome||'condominio')}.pdf`)
}

function blobToDataURL(blob){
  return new Promise((resolve,reject)=>{
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}
