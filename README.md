# 🎧 Audioguida

Audioguida personale offline — un file audio per ogni attrazione.

## Come funziona

1. Scrivi il testo di ogni tappa in `scripts/<esperienza>/<città>/<slug>.txt`
2. Lanci `npm run generate` → gli MP3 vengono creati in `audio/`
3. Fai push su GitHub → il sito si aggiorna su GitHub Pages
4. Dal telefono apri il sito → "Scarica audio" → funziona offline

## Setup iniziale (una volta)

```bash
npm install
```

## Generare gli audio

```bash
npm run generate                                    # tutto
node generate-audio.mjs grecia-2026                  # un'esperienza
node generate-audio.mjs grecia-2026 atene            # una città
node generate-audio.mjs grecia-2026 atene partenone  # una tappa
```

Voce: **it-IT-IsabellaNeural** (Microsoft, gratis, nessuna API key).

## Aggiungere un'esperienza

1. Crea la cartella `scripts/<nuova-esperienza>/<città>/`
2. Aggiungi i file `.txt` (uno per tappa, nome = slug)
3. Aggiungi il blocco in `data/experiences.json`
4. `npm run generate`
5. Push

## Struttura

```
index.html                       ← la PWA
manifest.json / sw.js            ← offline support
data/experiences.json            ← elenco esperienze e tappe
scripts/<exp>/<city>/<slug>.txt  ← testi da convertire in audio
audio/<exp>/<city>/<slug>.mp3    ← audio generati
generate-audio.mjs               ← script TTS
```
