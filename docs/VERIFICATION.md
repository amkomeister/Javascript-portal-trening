# Verifikasjon – oppdatert 22. oktober 2026

## Gjeldande resultat etter lærarguide og sluttkontroll

**Klar for teknisk overlevering og lokal lærarprøve. Kommunal produksjonsaksept står open.** Resultata nedanfor er frå ny køyring etter rettingane i `REVIEW-2026-10-22.md`, ikkje gjenbruk av oktober 21-resultata.

| Kontroll                | Resultat              | Kva som er prøvd                                                                                                                                     |
| ----------------------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm test`             | PASS, 91/91           | Alle 50 oppdragsløysingar, alternative svar, Snake, isolasjon/ressursgrenser, lagring, tilgangsmatrise, lærarguide og tilbakemeldingar               |
| `pnpm test:e2e`         | PASS, 20/20           | Elevflyt, ti samtidige nettlesarøkter, nettbrot, kontobyte, konfliktar, Snake/eksport, lærarguide, godkjenning/fjerning og vern for tilbakemeldingar |
| `pnpm build`            | PASS                  | Bygde appressursar og eksportmiljø                                                                                                                   |
| `pnpm test:preview`     | PASS, 6/6             | Første oppdrag, interaktiv nettside og alle fire lærarprøvene gjennom ferdig bygde filer                                                             |
| `pnpm test:emulator`    | PASS                  | Sikkerheitskopi, gjenoppretting og avvising av overskriving på eigen port 8087                                                                       |
| Produksjons-HTTP lokalt | PASS                  | Bygde ressursar, Secure/HttpOnly-cookie, verna API og stengde lokale testkontoar; syntetisk konfigurasjon                                            |
| `pnpm audit --json`     | 0 kjende sårbarheiter | Avhengigheitene er uendra gjennom lærarrettingane; dette er ikkje eit prov på at alle sårbarheiter er fråverande                                     |
| Personleg Kodeverkstad  | Uendra                | Rein git-status i den opphavlege Javascript-mappa; port 5173 og læringsdata er ikkje endra                                                           |

Linux-/containerkontrollen for `f7daef6b206b3ec5f5ace2df904d4c31e4760aad` bestod i [GitHub Actions](https://github.com/amkomeister/Javascript-portal-trening/actions/runs/39852473560), inkludert testane, Docker-bygg og produksjonsoppstart. Dei to siste UI-rettingane og dei tilhøyrande regresjonane blir kontrollerte på ny PR-revisjon. **Bruk statusen på den aktuelle commiten i [PR 1](https://github.com/amkomeister/Javascript-portal-trening/pull/1) før kommunal bygging; den eldre køyringa godkjenner ikkje seinare endringar.**

Lærarguiden er også opna og visuelt kontrollert i vanleg Chrome på port 5175. Automatiske axe-, tastatur-, omflytings- og redusert-rørsleprøver består på dei prøvde sidene; guiden er prøvd ved 390 px breidd. Dette er ikkje full hjelpemiddel- eller klasseromsaksept. Faktisk 200 % Chrome-forstørring og skulemaskiner står i `UTPROVING.md`.

Éin ny uavhengig granskar fann to feil i lærararbeidet. Begge er reproduserte og retta i éin samla runde: tekst kunne gå tapt under medlemsendring, og eit eldre feilvarsel stod att etter vellukka lagring. Ingen mindre funn er utsette. Sjå `REVIEW-2026-10-22.md` for avgrensingar og vurderingar.

Kommunen har enno ikkje sendt skyopplysningane. Ekte Google-innlogging, IAM/Firestore i kommunen, publisering, varsling og gjenoppretting i skyen er **NOT_RUN**. Ti samtidige nettlesarøkter er ikkje ti fysiske skulemaskiner. Automatiske kontrollar stadfestar ikkje læringsutbytte. Sjå `KOMMUNAL-OVERLEVERING.md` for neste steg.

## Historisk verifikasjon før den nye lærarbestillinga

Den attståande prøva av bygde filer og ein ny lokal produksjonsbygg/oppstart vart utførte 22. oktober. Resultata frå dei samla einings-, nettlesar- og emulatorprøvene nedanfor er frå 21. oktober på same appkode; berre statusdokumentasjon er endra sidan.

## Lokalt observert

| Kontroll                                 | Resultat                  | Kva det viser                                                                                                                                                                              |
| ---------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `pnpm test`                              | PASS, 80 testar           | API, revisjonar og bevaring av begge konfliktversjonar, same-konto-fornying, ressursgrenser, sanitering, lagringskø, 50 oppdragsløysingar med alternativ og Snake-reglar                   |
| `pnpm test:e2e`                          | PASS, 16 testar           | Chrome og Firestore-emulator: nybyrjarsti, DOM/tastatur, nettbrot, konfliktarkiv, kontogrenser, utgått økt og gjeninnlogging i fleire faner, ti samtidige elevar, Snake og offline eksport |
| `pnpm build`                             | PASS                      | Vite-produksjonsbygg og pakkar for eksport                                                                                                                                                 |
| `pnpm test:preview`                      | PASS, 2/2 den 22. oktober | Første oppdrag og interaktiv nettside gjennom dei ferdig bygde filene etter alle rettingane frå sluttgjennomgangen.                                                                        |
| `pnpm test:emulator`                     | PASS                      | Eksport, gjenoppretting i tom emulator og vern mot overskriving                                                                                                                            |
| Desktop og smal arbeidsflate             | PASS, inspisert           | Moduloversikt og arbeidsflate; skjermbilete under ignorerte `test-results`                                                                                                                 |
| axe, tastatur, 720 px og redusert rørsle | PASS i prøvde sider       | Ingen automatiske axe-funn i oversikta og arbeidsflata; Tab går ut av editoren; ingen vassrett sideskrolling                                                                               |
| Personleg Kodeverkstad                   | Uendra                    | `git status --short` er tom i den opphavlege Javascript-mappa; port 5173 og mine-prosjekt er ikkje brukte                                                                                  |

Nettlesartestane bruker syntetiske kontoar på same utviklingsmaskin. «Maskinbyte» er prøvd med separate nettlesarøkter, ikkje ti fysiske skulemaskiner. 720 px prøver omflyting tilsvarande halvert arbeidsbreidd; faktisk Chrome-forstørring, hjelpemiddel og skuleutstyr inngår også i lærarprøva. Første oppdrag er automatisert gjennomført, ikkje observert hjå ein ekte nybyrjar.

To kanttilfelle fekk eigne regresjonsprøver: feil i tastetrykk måtte publiserast før neste tidssteg, og tidlege klikk måtte køyrast etter at QuickJS var klar. Utlogging bruker Web Locks for å vente på lagring i alle innlogga faner. Ein lagringsfeil i ei anna fane stoppar utlogginga og bevarer arbeidet. Lærartilgang blir vurdert mot den aktive tillatingslista på kvar API-førespurnad.

Byggverktøyet varslar om store JavaScript-pakkar (CodeMirror og QuickJS). Dette er eit optimaliseringspunkt, ikkje ein byggfeil. QuickJS blir lasta i Worker, og offline-eksporten inkluderer nødvendige støttefiler og tredjepartslisensar.

Fem funn frå den uavhengige gjennomgangen er retta og regresjonsprøvde; sjå REVIEW.md. Siste samla nettlesarkøyring gav 16/16 PASS. Den første samla køyringa etter rettingane hadde éin feil i testoppsettet: to testtilfelle skreiv identisk kode til same syntetiske konto, slik at den siste ikkje laga ei ny endring. Unike testverdiar rettar opp dette utan å endre appen.

**Oppstart att 22. oktober:** Eigaren gav meldinga «Iverksett videre arbeid». Pausen er oppheva. Attståande lokal automatisk kontroll er fullført, og appen er starta med testkontoar for eigaren si utprøving. Sjå RESUME.md og UTPROVING.md.

## Ikkje utført her

- Ekte Google Workspace-innlogging med kommunen sitt domene.
- Containerbygg med Docker (Docker er ikkje installert i dette utviklingsmiljøet), Cloud Run-publisering eller kopling til billing.
- Kommunale kostnads-/feilvarsel og gjenoppretting i ekte skyprosjekt.
- Brukartest med lærar/elevar og dei ti fysiske skulemaskinene.

Sjå `DRIFT.md` og `UTPROVING.md` for dei konkrete opne kontrollane. Desse punkta er ikkje godkjende gjennom dei lokale automatiske testane.
