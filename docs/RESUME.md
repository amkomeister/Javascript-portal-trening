# Pausa – vent på «iverksett»

Eigaren bad 21. oktober 2026 om pause ved eit naturleg stoppunkt, oppdatering av GitHub og ingen vidare arbeid før meldinga **iverksett**. Denne meldinga er nødvendig for å ta opp att arbeidet. Ho er ikkje i seg sjølv godkjenning av produksjonspublisering.

## Lagret arbeid

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

## Første steg etter «iverksett»

1. Les AGENTS.md, denne fila, PROGRESS.md og VERIFICATION.md; kontroller git-status og HEAD på prosjektgreina utan å endre personleg Kodeverkstad.
2. Køyr `pnpm test:preview` for siste kontroll av dei bygde filene. Rett eventuelle reelle feil med ei avgrensa regresjonsprøve.
3. Start `pnpm preview` eller Start-skule.cmd dersom eigaren skal prøve appen; opne http://127.0.0.1:5175 i Chrome og bruk berre testkontoar.
4. Gå gjennom lokal elev-/lærarprøve med eigaren. Behald skiljet mellom automatisk kontroll, faktisk brukartest og produksjonsaksept.

Kommunale Google-kontoar/domene, skyprosjekt/billing, region, lagringstid/sletting, driftsansvar, Docker/Cloud Run, kostnads-/feilvarsel, gjenoppretting i skyen og faktiske skulemaskiner står framleis opne i DRIFT.md og UTPROVING.md. Ingen ekte elevbruk eller publisering før desse er handterte.
