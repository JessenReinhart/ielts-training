const DEFAULT_VOICES=['JBFqnCBsd6RMkjVDRZzb','Aw4FAjKCGjjNkVhN1Xmq'];
module.exports=async function(request,response){
 if(request.method!=='POST') return response.status(405).json({error:'Method Not Allowed'});
 const key=process.env.ELEVENLABS_API_KEY;
 if(!key) return response.status(503).json({error:'ELEVENLABS_API_KEY is not configured on Vercel.'});
 try{
  const body=request.body||{};const inputs=Array.isArray(body.inputs)?body.inputs:[];
  if(!inputs.length||inputs.length>10)return response.status(400).json({error:'Invalid dialogue input.'});
  const total=inputs.reduce((n,x)=>n+String(x.text||'').length,0);
  if(total>1800)return response.status(400).json({error:'Recording is too long for one generation.'});
  const voices=(process.env.ELEVENLABS_VOICE_IDS||DEFAULT_VOICES.join(',')).split(',').map(x=>x.trim()).filter(Boolean);
  const dialogue=inputs.map(x=>({text:String(x.text||''),voice_id:voices[Math.max(0,Math.min(Number(x.speaker)||0,voices.length-1))]}));
  const r=await fetch('https://api.elevenlabs.io/v1/text-to-dialogue?output_format=mp3_44100_128',{method:'POST',headers:{'xi-api-key':key,'Content-Type':'application/json'},body:JSON.stringify({inputs:dialogue,model_id:'eleven_v3'})});
  if(!r.ok)return response.status(r.status).send(await r.text());
  const buf=Buffer.from(await r.arrayBuffer());response.setHeader('Content-Type','audio/mpeg');response.setHeader('Cache-Control','private, max-age=3600');return response.status(200).send(buf);
 }catch(e){return response.status(500).json({error:e?.message||'Audio generation failed.'})}
};