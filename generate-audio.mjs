/**
 * generate-audio.mjs
 *
 * Legge i file .txt dalla cartella scripts/<experience>/<city>/
 * e genera MP3 in audio/<experience>/<city>/ usando edge-tts (voci Microsoft, gratis).
 *
 * Voce: it-IT-IsabellaNeural
 *
 * Uso:
 *   npm install
 *   node generate-audio.mjs                         # genera tutto
 *   node generate-audio.mjs grecia-2026              # solo un'esperienza
 *   node generate-audio.mjs grecia-2026 atene        # solo una città
 *   node generate-audio.mjs grecia-2026 atene acropoli-partenone  # solo una tappa
 */

import { EdgeTTS } from '@andresaya/edge-tts';
import { readdir, readFile, mkdir, access } from 'fs/promises';
import { join } from 'path';

const VOICE = 'it-IT-IsabellaNeural';
const RATE = '-5%';      // leggermente più lento, da audioguida
const PITCH = '+0Hz';
const SCRIPTS_DIR = 'scripts';
const AUDIO_DIR = 'audio';

const [,, filterExp, filterCity, filterSlug] = process.argv;

async function exists(path) {
  try { await access(path); return true; } catch { return false; }
}

async function generateOne(textFile, outputMp3) {
  const text = (await readFile(textFile, 'utf-8')).trim();
  if (!text) { console.log(`  ⏭  Vuoto: ${textFile}`); return; }

  // Salta se l'MP3 esiste già (per non rigenerare tutto ogni volta)
  if (await exists(outputMp3)) {
    console.log(`  ✓  Esiste già: ${outputMp3}`);
    return;
  }

  console.log(`  🎙  Genero: ${outputMp3}`);
  const tts = new EdgeTTS();
  await tts.synthesize(text, VOICE, { rate: RATE, pitch: PITCH });
  await tts.toFile(outputMp3);
  console.log(`  ✅ Fatto: ${outputMp3}`);
}

async function main() {
  if (!(await exists(SCRIPTS_DIR))) {
    console.error('❌ Cartella "scripts/" non trovata. Crea i file di testo prima.');
    process.exit(1);
  }

  const experiences = (await readdir(SCRIPTS_DIR, { withFileTypes: true }))
    .filter(d => d.isDirectory())
    .filter(d => !filterExp || d.name === filterExp);

  if (!experiences.length) {
    console.log('Nessuna esperienza trovata' + (filterExp ? ` con nome "${filterExp}"` : '') + '.');
    return;
  }

  for (const exp of experiences) {
    console.log(`\n📂 ${exp.name}`);
    const expScriptsDir = join(SCRIPTS_DIR, exp.name);
    const cities = (await readdir(expScriptsDir, { withFileTypes: true }))
      .filter(d => d.isDirectory())
      .filter(d => !filterCity || d.name === filterCity);

    for (const city of cities) {
      console.log(`\n  🏛  ${city.name}`);
      const cityScriptsDir = join(expScriptsDir, city.name);
      const cityAudioDir = join(AUDIO_DIR, exp.name, city.name);
      await mkdir(cityAudioDir, { recursive: true });

      const files = (await readdir(cityScriptsDir))
        .filter(f => f.endsWith('.txt'))
        .filter(f => !filterSlug || f.replace('.txt', '') === filterSlug)
        .sort();

      for (const file of files) {
        const slug = file.replace('.txt', '');
        const textPath = join(cityScriptsDir, file);
        const mp3Path = join(cityAudioDir, `${slug});
        await generateOne(textPath, mp3Path);
      }
    }
  }

  console.log('\n🎉 Generazione completata!');
}

main().catch(e => { console.error('Errore:', e); process.exit(1); });
