import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';

const API_KEY = process.env.ELEVENLABS_API_KEY;
if (!API_KEY) throw new Error('Missing ELEVENLABS_API_KEY');

const voiceA = process.env.ELEVENLABS_VOICE_A || 'JBFqnCBsd6RMkjVDRZzb';
const voiceB = process.env.ELEVENLABS_VOICE_B || 'Aw4FAjKCGjjNkVhN1Xmq';
const outputDir = path.resolve('audio');
const sourceFiles = [1, 2, 3, 4].map(n => path.resolve(`listening-part-${n}.js`));

function loadInputs(source) {
  const sandbox = { window: { IELTS_LISTENING_AUDIO: {} } };
  vm.runInNewContext(source, sandbox);
  return sandbox.window.IELTS_LISTENING_AUDIO[Object.keys(sandbox.window.IELTS_LISTENING_AUDIO)[0]];
}

function splitTurns(text) {
  const matches = [...text.matchAll(/(^|\\s)([A-Za-z][A-Za-z ]{0,30}):\\s*/g)];
  if (!matches.length) return [{ speaker: 0, text: text.trim() }];
  const turns = [];
  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index + matches[i][0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index : text.length;
    const label = matches[i][2].trim();
    const body = text.slice(start, end).trim();
    if (body) turns.push({ speaker: label, text: body });
  }
  return turns;
}

async function generate(partNumber) {
  const out = path.join(outputDir, `listening-part-${String(partNumber).padStart(2, '0')}.mp3`);
  try { await fs.access(out); console.log(`skip: ${out}`); return; } catch {}

  const source = await fs.readFile(sourceFiles[partNumber - 1], 'utf8');
  const groups = loadInputs(source);
  const raw = groups.flatMap(x => splitTurns(x.text));
  const speakers = new Map();
  let nextVoice = 0;
  const inputs = raw.map(turn => {
    const key = turn.speaker;
    if (!speakers.has(key)) speakers.set(key, nextVoice++ % 2);
    const voice = speakers.get(key) === 0 ? voiceA : voiceB;
    return { text: turn.text, voice_id: voice };
  });

  const chars = inputs.reduce((n, x) => n + x.text.length, 0);
  if (chars > 2000) throw new Error(`Part ${partNumber} is ${chars} characters; keep dialogue requests <= 2000 characters.`);

  const response = await fetch('https://api.elevenlabs.io/v1/text-to-dialogue?output_format=mp3_44100_128', {
    method: 'POST',
    headers: { 'xi-api-key': API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ inputs, model_id: 'eleven_v3', seed: 1000 + partNumber })
  });
  if (!response.ok) throw new Error(`ElevenLabs Part ${partNumber}: ${response.status} ${await response.text()}`);
  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(out, Buffer.from(await response.arrayBuffer()));
  console.log(`generated: ${out} (${chars} chars)`);
}

for (const n of [1, 2, 3, 4]) await generate(n);
console.log('Listening audio generation complete. Existing files were not regenerated.');
