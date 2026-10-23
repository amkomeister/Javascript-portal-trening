# Kodeverkstad Skule

Ein nynorsk kodeverkstad for 8.–10. trinn: åtte opne modular, 50 oppdrag, visuell JavaScript, HTML/CSS, quiz, små spel og eit samanhengande Snake-prosjekt.

Dette er eit **separat prosjekt**. Den personlege Kodeverkstad-appen på port 5173, `mine-prosjekt` og lokale læringsdata blir ikkje brukte eller endra. Skuleoppdraga har ID-ar med `skule-v1-`, og serverdata har `schemaVersion: 1`.

## Prøv lokalt på Windows

1. Dobbeltklikk **Start-skule.cmd**. Første oppstart hentar avhengigheiter og kontrollsumverifiserte lokale emulatorverktøy. Node.js 22 eller nyare og pnpm må vere tilgjengelege; startfila finn også Codex-runtime på denne maskina.
2. Opne **http://127.0.0.1:5175** i Chrome.
3. Vel **Prøv som elev**, vel trinn og opne den første roboten. **Prøv som lærar** opnar lærarrolla. Fleire syntetiske kontoar finst under «Fleire testkontoar».
4. Hald kommandovindauget ope. Avslutt med Ctrl+C. Testdata blir kopierte til `.local/data.json` kvart 30. sekund og ved vanleg avslutning.

Lokal utprøving bruker ein Firestore-emulator på 127.0.0.1:8085 og berre oppdikta kontoar. Denne modusen lyttar berre på maskina di. Bruk ikkje ekte elevdata før kommunen har konfigurert drift og skuleinnlogging.

For utvikling:

```sh
pnpm install --frozen-lockfile
node scripts/setup.mjs
pnpm dev
```

På Linux/macOS krev emulatoren Java 21 eller nyare på PATH. Windows-oppsettet legg ein portabel JRE under `.local/tools`; det endrar ikkje systeminnstillingar.

## Kva er med?

| Modul                   | Oppdrag |
| ----------------------- | ------: |
| Kom i gang med kode     |       6 |
| Pikselkunst og mønster  |       6 |
| Animasjon og styring    |       6 |
| Bygg di eiga nettside   |       8 |
| Gjer nettsida levande   |       6 |
| Små spel og eksperiment |       6 |
| Bygg Snake              |       8 |
| Mitt eige prosjekt      |       4 |

Kvart oppdrag har mål, forklaring, fagord, døme, startkode, tre steg med hint, forklart løysing og frivillig utviding. Støtteval endrar hjelpa utan å skrive over koden. Snake og «Mitt eige prosjekt» bruker kvar sitt prosjekt gjennom heile modulen; dei andre oppdraga har eigne utkast.

Automatiske sjekkar, eigensjekkar og lærarvurdering står kvar for seg. Sjekkane er avgrensa læringsstøtte og kan ikkje brukast som karakter eller prov på forståing. Lærarar ser berre godkjende medlemer i eigne grupper.

Lærarar kjem rett til lærarrommet. Første gong opnar ei innføring med seks korte steg: opprett gruppe, del kode, godkjenn elevar, les arbeid, gi tilbakemelding og hjelp elevane vidare. **Opne lærarguiden** viser henne på nytt. Fullføring blir hugsa på lærarkontoen, også på ei anna maskin. Ulagrede tilbakemeldingar blir verna ved navigering og kontobyte; samtidige endringar gir eit synleg val og bevarer begge utgåvene.

Autosave viser lagringsstatus, held kode open ved nettbrot og oppdagar revisjonskonfliktar. Konfliktkopiar blir lagra på serveren før eleven vel vidare versjon. «Kodekopi» verkar utan nett. ZIP-eksport inkluderer eit sjølvstendig køyringsmiljø: pakk ut og opne `index.html` i Chrome. Kopien sender ikkje data til appen.

Når innlogginga går ut, vel **Logg inn på nytt** og bruk same skulekonto. Open kode blir bevart i alle faner. Du kan også laste ned ein kodekopi frå innloggingsvindauget. Vil du byte elevkonto, lagre arbeidet og bruk **Logg ut** først.

## Kontrollar

```sh
pnpm test
pnpm build
pnpm exec playwright install chromium
pnpm test:e2e
pnpm test:preview
pnpm test:emulator
```

Nettlesartestane startar eigen emulator på 8086 og app på 5176. Dei prøver blant anna samtidige elevar, kontoavgrensing, nettbrot, revisjonskonflikt, DOM-isolasjon, heile Snake og eksport. `test:emulator` prøver sikkerheitskopi/gjenoppretting og nektar overskriving av ein database med eksisterande data.

Gjenopprettingsprøva bruker port 8087 og kan køyrast medan den lokale utprøvinga på 5175/8085 er open. For kommunal overlevering, sjå [KOMMUNAL-OVERLEVERING.md](docs/KOMMUNAL-OVERLEVERING.md), [DRIFT.md](docs/DRIFT.md) og [den nye kvalitetskontrollen](docs/QUALITY-2026-10-22.md).

## Teknisk oversikt

- `src/content`: dei 50 oppdraga og avgrensa kontrollar av resultat.
- `src/workspace.js`: CodeMirror, hint, sjekkar, utkast og eksport.
- `src/runtime`: QuickJS i ein Web Worker, 32 MiB minnegrense, tidsgrense og validert teikne-/DOM-grensesnitt. Elevkode blir aldri evaluert på appen sin hovudtråd.
- `server`: Express, verifisering av Google-ID-token, HttpOnly-økter, tilgangskontroll og Firestore-transaksjonar.
- `scripts`: lokalt oppsett, emulator, bygg, sikkerheitskopi og gjenoppretting.
- `docs/DRIFT.md`: overlevering til kommunen. `docs/UTPROVING.md`: konkret prøveopplegg for lærar og elevar.

**Før skulebruk:** ekte Google-innlogging, kommunalt skyprosjekt/billing, region, lagringstid, sletting, driftsansvar og prøving på skulemaskinene må stadfestast. Docker-oppsettet er klart for kommunal gjennomgang; det er ikkje publisert eller kopla til fakturering.

Stickman-kurs, KI-chat og offentleg prosjektgalleri er vidare utvidingar. Dei er ikkje med i denne utgåva.
