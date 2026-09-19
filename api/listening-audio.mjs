const DEFAULT_VOICES=['JBFqnCBsd6RMkjVDRZzb','Aw4FAjKCGjjNkVhN1Xmq'];

export default async function handler(request){
  if(request.method!=='POST') return new Response('Method Not Allowed',{status:405,headers:{Allow:'POST'}});
  const key=process.env.ELEVENLABS_API_KEY;
  if(!key) return Response.json({error:'ELEVENLABS_API_KEY is not configured on Vercel.'},{status:503});
  try{
    const body=await request.json();
    const inputs=Array.isArray(body.inputs)?body.inputs:[];
    if(!inputs.length||inputs.length>10) return Response.json({error:'Invalid dialogue input.'},{status:400});
    const total=inputs.reduce((n,x)=>n+String(x.text||'').length,0);
    if(total>1800) return Response.json({error:'Recording is too long for one generation.'},{status:400});
    const voices=(process.env.ELEVENLABS_VOICE_IDS||DEFAULT_VOICES.join(',')).split(',').map(x=>x.trim()).filter(Boolean);
    const dialogue=inputs.map(x=>({text:String(x.text||''),voice_id:voices[Math.max(0,Math.min(Number(x.speaker)||0,voices.length-1))]}));
    const upstream=await fetch('https://api.elevenlabs.io/v1/text-to-dialogue?output_format=mp3_44100_128',{method:'POST',headers:{'xi-api-key':key,'Content-Type':'application/json'},body:JSON.stringify({inputs:dialogue,model_id:'eleven_v3'})});
    if(!upstream.ok){const detail=await upstream.text();return new Response(detail,{status:upstream.status,headers:{'Content-Type':'application/json'}})}
    const audio=await upstream.arrayBuffer();
    return new Response(audio,{status:200,headers:{'Content-Type':'audio/mpeg','Cache-Control':'private, max-age=3600'}});
  }catch(error){return Response.json({error:error?.message||'Audio generation failed.'},{status:500});}
}
