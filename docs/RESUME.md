# Status etter oppstart att – 22. oktober 2026

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
