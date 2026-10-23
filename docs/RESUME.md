# Status etter oppstart att – 22. oktober 2026

## Gjeldande overlevering etter lærarguide og kvalitetskontroll

Den nye bestillinga om lærarinnføring og grundig kontroll er implementert. Lærarar får ei seks stegs innføring, kan opne henne att, oppdatere elevlistene og gi tilbakemeldingar med vern mot ulagret arbeid og samtidige endringar. Tilgang er prøvd for eigne/andre grupper, ventande/fjerna medlemskap og ulike roller. To funn frå éin ny granskar er retta i éin samla runde; sjå `REVIEW-2026-10-22.md`.

Ny sluttkøyring: **91/91 einingstestar, 20/20 nettlesartestar, 6/6 prøver av bygde filer, bygg og emulator-backup/gjenoppretting PASS**. Produksjons-HTTP er prøvd med syntetisk konfigurasjon. Linux/container bestod for `f7daef6`; sjå status på aktuell commit i [utkast PR 1](https://github.com/amkomeister/Javascript-portal-trening/pull/1) for sluttversjonen. Ingen samanslåing eller publisering er utført.

Appen er open i Chrome på http://127.0.0.1:5175 med lokale testkontoar. Han bruker emulatorport 8085; testane bruker 8086/8087 og forstyrrar ikkje denne prøva. Om prosessane er avslutta seinare, bruk `Start-skule.cmd`. `.local/data.json` bevarer syntetiske lokale data. Den personlege appen og læringsdata på 5173 er uendra.

Eigaren svarte **«ikkje enno»** på spørsmålet om kommunale skyopplysningar. Neste eksterne steg er lokal lærar-/elevprøve etter `UTPROVING.md` og teknisk overlevering etter `KOMMUNAL-OVERLEVERING.md`. Kommunen må deretter konfigurere og godkjenne sitt miljø før elevbruk. Ikkje gjett prosjekt-ID, domene, region eller læraridentitetar. Ingen nye hjelpetrådar treng å haldast aktive.

## Historisk oppstart før den nye bestillinga

Eigaren skreiv **Iverksett videre arbeid** 22. oktober. Pausen er oppheva. Prosjektgreina var rein og samsvarte med GitHub ved oppstart. Den attståande `pnpm test:preview` er no køyrd på dei ferdig bygde filene: **2/2 PASS**. `pnpm preview` bygde og starta appen på nytt for lokal utprøving på http://127.0.0.1:5175. Berre dokumentasjonen er endra sidan den førre samla testkøyringa.

Neste steg er at eigaren prøver elevflyten og lærarrommet med lokale testkontoar etter UTPROVING.md. Appen er levert for lokal vurdering; faktisk læringsutbytte, skulemaskiner og produksjonsdrift er framleis opne kontrollar. Om førehandsvisinga ikkje lenger køyrer, bruk Start-skule.cmd. Ingen samanslåing til main eller Cloud-publisering er utført.

## Historisk stoppunkt – 21. oktober

Eigaren bad 21. oktober 2026 om pause ved eit naturleg stoppunkt, oppdatering av GitHub og ingen vidare arbeid før meldinga **iverksett**. Dette vart oppfylt. Meldinga er ikkje i seg sjølv godkjenning av produksjonspublisering.

## Lagret arbeid ved pausen

- Eige lokalt prosjekt: `C:\Users\47909\Documents\ChatGPT\Javascript-skule`.
- Rett privat repo: https://github.com/amkomeister/Javascript-portal-trening.
- Grein: `codex/kodeverkstad-skule`. Arbeidet skal liggje på denne greina; ingen samanslåing med main eller Cloud-publisering er utført.
- Åtte modular / 50 oppdrag, arbeidsflate, QuickJS-isolasjon, Google-kodeveg, Firestore-lagring, grupper/lærarside, kumulativ Snake og sjølvstendig eksport er implementerte.
- Éin uavhengig sluttgjennomgang fann fem feil. Alle er retta og prøvde i éin samla rettingsrunde; sjå REVIEW.md. Ingen ny uavhengig kontroll av rettingane er utført.
- `pnpm test`: 80/80 PASS. `pnpm test:e2e`: 16/16 PASS. `pnpm build`: PASS. `pnpm test:emulator`: PASS.
- `pnpm test:preview`: tidlegare 2/2 PASS før sluttkontrollrettingane; ikkje køyrt på nytt etter dei.
- Personleg Kodeverkstad i `Javascript`, læringsdata og `mine-prosjekt` er uendra; git-status var tom ved pausen.
- Lokale app- og emulatorprosessar er stoppa. URL-en på port 5175 er derfor ikkje tilgjengeleg under pausen. `.local/data.json` held dei syntetiske lokale prøvedataa utanfor Git.
- Hjelparagentane `final_review` og `inspect_learning_app` er ferdige. Ingen andre aktive prosjekttrådar vart funne ved kontrollen.

## Arbeidsrekkjefølgje etter «iverksett»

1. **Utført 22. oktober:** lese prosjektstatus og kontrollert rein grein og lik lokal/remote HEAD. Personleg Kodeverkstad er uendra.
2. **Utført 22. oktober:** `pnpm test:preview`, 2/2 PASS; ingen programrettingar var nødvendige.
3. **Starta 22. oktober:** `pnpm preview` på http://127.0.0.1:5175, med lokale testkontoar og Firestore-emulator.
4. **Neste:** lokal elev-/lærarprøve med eigaren. Behald skiljet mellom automatisk kontroll, faktisk brukartest og produksjonsaksept. Noter konkrete observasjonar før vidare endringar.

Kommunale Google-kontoar/domene, skyprosjekt/billing, region, lagringstid/sletting, driftsansvar, Docker/Cloud Run, kostnads-/feilvarsel, gjenoppretting i skyen og faktiske skulemaskiner står framleis opne i DRIFT.md og UTPROVING.md. Ingen ekte elevbruk eller publisering før desse er handterte.
