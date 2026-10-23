# Kodeverkstad Skule – overlevering til kommunen

## Kva blir levert?

Ei nynorsk læringsplattform for 8.–10. trinn med 50 opne oppdrag, trygg køyring av elevkode, automatisk lagring, elevgrupper, lærartilbakemeldingar og ei seks stegs lærarinnføring. Leveransen er eit eige prosjekt og bruker ikkje data frå den personlege Kodeverkstad-appen.

Kjeldekode: det private repoet `amkomeister/Javascript-portal-trening`, greina `codex/kodeverkstad-skule`. Kontroller aktuell commit og testresultat før de byggjer. Pakken inneheld ingen kommunale kontoar, nøklar eller elevdata.

**Status:** klar for teknisk gjennomgang og lokal utprøving. Produksjon er ikkje sett opp eller godkjend. Eigaren stadfesta 22. oktober 2026 at kommunen enno ikkje har sendt skyopplysningane.

## Dette må kommunen fylle ut

| Opplysning | Kommunen si stadfesting |
| --- | --- |
| Google Cloud prosjekt-ID og billing-konto | Ikkje motteke |
| Firestore-region og Cloud Run-region | Ikkje motteke |
| Endeleg HTTPS-adresse og tillatne Google Workspace-domene | Ikkje motteke |
| OAuth web-klient-ID og godkjende læraridentitetar | Ikkje motteke |
| Driftsansvarleg og mottakarar for kostnads-/feilvarsel | Ikkje motteke |
| Lagringstid, sletting og sikkerheitskopiar | Ikkje motteke |

Passord, private nøklar og elevdata skal ikkje leggjast i repoet. Cloud Run bruker ei eiga tenesteidentitet for Firestore. Miljøvariablane er dokumenterte i `.env.example` og `DRIFT.md`.

## Bygg og kontroll

Køyr frå prosjektmappa, med Node.js 24, pnpm 11.25 og Java 21:

```sh
pnpm install --frozen-lockfile
node scripts/setup.mjs
pnpm exec playwright install chromium
pnpm test
pnpm build
pnpm test:e2e
pnpm test:preview
pnpm test:emulator
docker build --tag kodeverkstad-skule .
```

GitHub-kontrollen i `.github/workflows/verify.yml` køyrer testane og byggjer containeren på Linux. Han prøver også produksjonsoppstart og at lokale testkontoar er stengde. Det blir ikkje publisert eit containerbilete eller ei skyteneste. Ei bestått containerprøve er ikkje ei prøve av kommunen sine Google-kontoar eller Firestore-rettar.

Containeren lyttar på `0.0.0.0` og porten i `PORT`, slik Cloud Run krev. Google-ID-token blir verifiserte på serveren, og `hd` blir kontrollert mot skuledomene. Sjå [Cloud Run-kontrakten](https://docs.cloud.google.com/run/docs/container-contract) og [Google si tokenrettleiing](https://developers.google.com/identity/gsi/web/guides/verify-google-id-token).

## Akseptanse før elevbruk

1. Konfigurer eit kommunalt testmiljø med avklarte regionar, tenesteidentitet og Google-innlogging.
2. Prøv ein lærar, ein elev og ein konto frå feil domene. Stadfest innlogging, utlogging og at feil domene blir avvist.
3. Læraren fullfører innføringa, lagar ei gruppe, deler koden og godkjenner rett elev. Ein annan lærar skal ikkje kunne lese gruppa.
4. Eleven lagrar kode og forklaring. Læraren les og gir tilbakemelding. Prøv nettbrot og to samtidige maskiner; begge utgåver skal bevarast ved konflikt.
5. Prøv 10 faktiske skulemaskiner, Chrome, tastatur, 200 % forstørring og redusert rørsle. Be ein nybyrjar fullføre første oppdrag og forklare endringa.
6. Prøv kostnadsvarsel, feilvarsel og gjenoppretting av sikkerheitskopi i eit tomt testprosjekt. Registrer ansvarleg, dato, resultat og eventuelle avvik i `DRIFT.md`.
7. Godkjenn elevbruk og publisering særskilt. Hald førre Cloud Run-revisjon tilgjengeleg for tilbakerulling.

Automatiske kontrollar er støtte for denne gjennomgangen. Dei erstattar ikkje lærar-/elevprøving eller kommunen sine driftsavgjerder.
