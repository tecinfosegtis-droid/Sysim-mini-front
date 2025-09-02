export default function handler(req, res){
  if(req.method !== 'POST') return res.status(405).end()
  const { email, password } = req.body || {}
  if((email==='admin@sysim.com' && password==='123456')) return res.json({ success:true, role:'admin' })
  if((email==='equipe@sysim.com' && password==='123456')) return res.json({ success:true, role:'equipe' })
  return res.status(401).json({ success:false, message:'Credenciais inválidas' })
}
