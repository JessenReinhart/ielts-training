from pathlib import Path
import re
import subprocess
import html

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'audio'
OUT.mkdir(exist_ok=True)

# Piper is a good local neural-TTS option, but GitHub-hosted generation can use
# espeak as a zero-credential fallback. The resulting MP3s are static assets;
# learners never call a TTS service.

for n in range(1, 5):
    src = ROOT / f'listening-part-{n}.js'
    raw = src.read_text(encoding='utf-8')
    texts = re.findall(r"text:'((?:\\.|[^'])*)'", raw)
    if not texts:
        raise SystemExit(f'No dialogue found in {src}')

    def unescape_js(s: str) -> str:
        return (s.replace("\\'", "'")
                 .replace('\\"', '"')
                 .replace('\\n', '\n')
                 .replace('\\r', '\r')
                 .replace('\\t', '\t')
                 .replace('\\\\', '\\'))

    script = '\n\n'.join(unescape_js(x) for x in texts)
    # Keep speaker labels out of the spoken audio. Part 1/3 naturally contain
    # speaker names in the source text, so we use a neutral continuous voice.
    script = re.sub(r'(?m)^(Staff|Maya|Tutor|Daniel|Priya):\s*', '', script)
    script = html.unescape(script)

    tmp_wav = OUT / f'.listening-part-{n:02d}.wav'
    final_mp3 = OUT / f'listening-part-{n:02d}.mp3'
    tmp_txt = OUT / f'.listening-part-{n:02d}.txt'
    tmp_txt.write_text(script, encoding='utf-8')

    subprocess.run([
        'espeak', '-s', '148', '-v', 'en-us', '-f', str(tmp_txt),
        '-w', str(tmp_wav)
    ], check=True)
    subprocess.run([
        'ffmpeg', '-y', '-loglevel', 'error', '-i', str(tmp_wav),
        '-ac', '1', '-ar', '22050', '-codec:a', 'libmp3lame', '-b:a', '24k',
        str(final_mp3)
    ], check=True)
    tmp_wav.unlink(missing_ok=True)
    tmp_txt.unlink(missing_ok=True)
    print(f'Generated {final_mp3} ({final_mp3.stat().st_size:,} bytes)')
