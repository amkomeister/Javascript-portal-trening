# Verifikasjon – 21. oktober 2026

## Lokalt observert

| Kontroll                                 | Resultat            | Kva det viser                                                                                                                                                                                                   |
| ---------------------------------------- | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm test`                              | PASS, 74 testar     | API, revisjonar, ressursgrenser, sanitering, lagringskø, 50 oppdragsløysingar med alternative deklarasjonar, andre gyldige løysingsstrukturar og Snake-reglar                                                   |
| `pnpm test:e2e`                          | PASS, 11 testar     | Faktisk Chrome-flyt med Firestore-emulator: nybyrjarsti, DOM-hendingar, nettbrot, konflikt, konto- og gruppegrenser, utlogging med ulagrat arbeid i ei anna fane, ti samtidige elevar, Snake og offline eksport |
| `pnpm build`                             | PASS                | Vite-produksjonsbygg og pakkar for eksport                                                                                                                                                                      |
| `pnpm test:preview`                      | PASS, 2 testar      | Første oppdrag og interaktiv nettside gjennom dei ferdig bygde filene og Express-static                                                                                                                         |
| `pnpm test:emulator`                     | PASS                | Eksport, gjenoppretting i tom emulator og vern mot overskriving                                                                                                                                                 |
| Desktop og smal arbeidsflate             | PASS, inspisert     | Moduloversikt og arbeidsflate; skjermbilete under ignorerte `test-results`                                                                                                                                      |
| axe, tastatur, 720 px og redusert rørsle | PASS i prøvde sider | Ingen automatiske axe-funn i oversikta og arbeidsflata; Tab går ut av editoren; ingen vassrett sideskrolling                                                                                                    |
| Personleg Kodeverkstad                   | Uendra              | `git status --short` er tom i den opphavlege Javascript-mappa; port 5173 og mine-prosjekt er ikkje brukte                                                                                                       |

Nettlesartestane bruker syntetiske kontoar på same utviklingsmaskin. «Maskinbyte» er prøvd med separate nettlesarøkter, ikkje ti fysiske skulemaskiner. 720 px prøver omflyting tilsvarande halvert arbeidsbreidd; faktisk Chrome-forstørring, hjelpemiddel og skuleutstyr inngår også i lærarprøva. Første oppdrag er automatisert gjennomført, ikkje observert hjå ein ekte nybyrjar.

To kanttilfelle fekk eigne regresjonsprøver: feil i tastetrykk måtte publiserast før neste tidssteg, og tidlege klikk måtte køyrast etter at QuickJS var klar. Utlogging bruker Web Locks for å vente på lagring i alle innlogga faner. Ein lagringsfeil i ei anna fane stoppar utlogginga og bevarer arbeidet. Lærartilgang blir vurdert mot den aktive tillatingslista på kvar API-førespurnad.

Byggverktøyet varslar om store JavaScript-pakkar (CodeMirror og QuickJS). Dette er eit optimaliseringspunkt, ikkje ein byggfeil. QuickJS blir lasta i Worker, og offline-eksporten inkluderer nødvendige støttefiler og tredjepartslisensar.

## Ikkje utført her

- Ekte Google Workspace-innlogging med kommunen sitt domene.
- Containerbygg med Docker (Docker er ikkje installert i dette utviklingsmiljøet), Cloud Run-publisering eller kopling til billing.
- Kommunale kostnads-/feilvarsel og gjenoppretting i ekte skyprosjekt.
- Brukartest med lærar/elevar og dei ti fysiske skulemaskinene.

Sjå `DRIFT.md` og `UTPROVING.md` for dei konkrete opne kontrollane. Desse punkta er ikkje godkjende gjennom dei lokale automatiske testane.
