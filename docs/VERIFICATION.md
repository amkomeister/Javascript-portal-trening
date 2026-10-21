# Verifikasjon – 21. oktober 2026

## Lokalt observert

| Kontroll                                 | Resultat            | Kva det viser                                                                                                                                                                                                   |
| ---------------------------------------- | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm test`                              | PASS, 80 testar     | API, revisjonar og bevaring av begge konfliktversjonar, same-konto-fornying, ressursgrenser, sanitering, lagringskø, 50 oppdragsløysingar med alternativ og Snake-reglar |
| `pnpm test:e2e`                          | PASS, 16 testar     | Chrome og Firestore-emulator: nybyrjarsti, DOM/tastatur, nettbrot, konfliktarkiv, kontogrenser, utgått økt og gjeninnlogging i fleire faner, ti samtidige elevar, Snake og offline eksport |
| `pnpm build`                             | PASS                | Vite-produksjonsbygg og pakkar for eksport                                                                                                                                                                      |
| `pnpm test:preview`                      | Tidlegare PASS, 2 testar; ikkje køyrt på nytt etter sluttgjennomgangen | Første oppdrag og interaktiv nettside gjennom bygde filer. Står som neste lokale kontroll etter pausen. |
| `pnpm test:emulator`                     | PASS                | Eksport, gjenoppretting i tom emulator og vern mot overskriving                                                                                                                                                 |
| Desktop og smal arbeidsflate             | PASS, inspisert     | Moduloversikt og arbeidsflate; skjermbilete under ignorerte `test-results`                                                                                                                                      |
| axe, tastatur, 720 px og redusert rørsle | PASS i prøvde sider | Ingen automatiske axe-funn i oversikta og arbeidsflata; Tab går ut av editoren; ingen vassrett sideskrolling                                                                                                    |
| Personleg Kodeverkstad                   | Uendra              | `git status --short` er tom i den opphavlege Javascript-mappa; port 5173 og mine-prosjekt er ikkje brukte                                                                                                       |

Nettlesartestane bruker syntetiske kontoar på same utviklingsmaskin. «Maskinbyte» er prøvd med separate nettlesarøkter, ikkje ti fysiske skulemaskiner. 720 px prøver omflyting tilsvarande halvert arbeidsbreidd; faktisk Chrome-forstørring, hjelpemiddel og skuleutstyr inngår også i lærarprøva. Første oppdrag er automatisert gjennomført, ikkje observert hjå ein ekte nybyrjar.

To kanttilfelle fekk eigne regresjonsprøver: feil i tastetrykk måtte publiserast før neste tidssteg, og tidlege klikk måtte køyrast etter at QuickJS var klar. Utlogging bruker Web Locks for å vente på lagring i alle innlogga faner. Ein lagringsfeil i ei anna fane stoppar utlogginga og bevarer arbeidet. Lærartilgang blir vurdert mot den aktive tillatingslista på kvar API-førespurnad.

Byggverktøyet varslar om store JavaScript-pakkar (CodeMirror og QuickJS). Dette er eit optimaliseringspunkt, ikkje ein byggfeil. QuickJS blir lasta i Worker, og offline-eksporten inkluderer nødvendige støttefiler og tredjepartslisensar.

Fem funn frå den uavhengige gjennomgangen er retta og regresjonsprøvde; sjå REVIEW.md. Siste samla nettlesarkøyring gav 16/16 PASS. Den første samla køyringa etter rettingane hadde éin feil i testoppsettet: to testtilfelle skreiv identisk kode til same syntetiske konto, slik at den siste ikkje laga ei ny endring. Unike testverdiar rettar opp dette utan å endre appen.

**Pause etter eigaren si melding:** Ingen vidare utvikling eller kontrollkøyring før «iverksett». Sjå RESUME.md. Dei lokale app-/emulatorprosessane er stoppa.

## Ikkje utført her

- Ekte Google Workspace-innlogging med kommunen sitt domene.
- Containerbygg med Docker (Docker er ikkje installert i dette utviklingsmiljøet), Cloud Run-publisering eller kopling til billing.
- Kommunale kostnads-/feilvarsel og gjenoppretting i ekte skyprosjekt.
- Brukartest med lærar/elevar og dei ti fysiske skulemaskinene.

Sjå `DRIFT.md` og `UTPROVING.md` for dei konkrete opne kontrollane. Desse punkta er ikkje godkjende gjennom dei lokale automatiske testane.
