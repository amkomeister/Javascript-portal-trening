import { zipSync, strToU8 } from 'fflate';
export function download(name, bytes, type = 'application/octet-stream') {
  const url = URL.createObjectURL(new Blob([bytes], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
export function exportCopy(data, name = 'kodeverkstad-kopi') {
  download(
    name + '.json',
    JSON.stringify({ format: 'kodeverkstad-skule-project', version: 1, data }, null, 2),
    'application/json',
  );
}
export async function exportProject(data, name = 'mitt-prosjekt') {
  const responses = await Promise.all(
    ['host.js', 'worker-source.js', 'THIRD-PARTY.txt'].map((n) => fetch('/export/' + n)),
  );
  if (responses.some((r) => !r.ok))
    throw Error('Støttefilene er ikkje tilgjengelege. Bruk Last ned kodekopi utan nett.');
  const [host, worker, notices] = await Promise.all(responses.map((r) => r.text()));
  const entries = {
    'THIRD-PARTY.txt': notices,
    'index.html':
      '<!doctype html><html lang="nn"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Mitt kodeprosjekt</title><style>body{font:18px system-ui;background:#f5f5ed;color:#172b37;max-width:900px;margin:32px auto;padding:20px}button{font:inherit;padding:12px 24px;margin:8px}canvas,iframe{display:block;border:2px solid #172b37;width:100%;max-width:720px;min-height:320px}canvas{height:auto}iframe{height:460px}[hidden]{display:none}:focus-visible{outline:4px solid #2453db;outline-offset:4px}pre{white-space:pre-wrap}</style><h1>Mitt kodeprosjekt</h1><button id="run">Køyr</button><button id="stop">Stopp</button><p id="status" role="status"></p><canvas width="480" height="320" tabindex="0" aria-label="Spelscene. Trykk her og bruk tastaturet."></canvas><iframe sandbox="allow-scripts" title="Nettsida mi"></iframe><pre id="output"></pre><script src="data.js"></script><script src="worker-source.js"></script><script src="host.js"></script></html>',
    'host.js': host,
    'worker-source.js': worker,
    'data.js': 'window.KV_FILES=' + JSON.stringify(data.files) + ';',
    'elevkode.js': data.files.js,
    'side.html': data.files.html,
    'stil.css': data.files.css,
    'prosjekt.json': JSON.stringify(
      { format: 'kodeverkstad-skule-project', version: 1, data },
      null,
      2,
    ),
    'LES-MEG.txt':
      'KODEVERKSTAD SKULE – DITT PROSJEKT\n\nPakk ut heile mappa. Opne index.html i Chrome. Ingen konto eller internett er nødvendig.\n\nSpelreglane dine står i elevkode.js; side.html og stil.css er nettsida di. Køyringa bruker ein kopi i data.js. Rediger helst prosjektet i Kodeverkstad og last ned på nytt. Importer prosjekt.json med Hent kodekopi.\n\nHjelpefilene host.js og worker-source.js køyrer koden i QuickJS i ein Worker med dei same grensene som verkstaden. Ingen elevkode blir evaluert på appen sin hovudtråd. Teiknefunksjonane clear, rect, circle og text tek posisjon/tekst og farge. every og after bruker millisekund. onKey tek imot tastetrykk.\n\nKopien inneheld ditt arbeid og forklaringa di. Han blir ikkje delt automatisk. Sjå tredjepartslisensane i kjeldeprosjektet.\n',
  };
  download(
    name + '.zip',
    zipSync(Object.fromEntries(Object.entries(entries).map(([n, s]) => [n, strToU8(s)])), {
      level: 6,
    }),
    'application/zip',
  );
}
