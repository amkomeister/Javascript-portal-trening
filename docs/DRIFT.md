# Overlevering til kommunen

## Før tenesta får verkelege elevar

Fyll ut og godkjenn: prosjekt-ID, billing-konto, tillatne Google Workspace-domene, datalagringsregion, godkjent lagringstid for arbeid og sikkerheitskopiar, sletting ved skuleslutt/avslutta konto, teknisk eigar og mottakarar for driftsvarsel. Dette er opne avgjerder, ikkje verdiar appen gjetter.

Kontoopplysningar er namn, e-postadresse, SHA-256 av Google `sub`, rolle og valt trinn. Vidare blir kode, forklaringar, støtteval, kontrollstatus, medlemskap og lærartilbakemeldingar lagra. Ingen analyseverktøy, KI-teneste eller offentleg galleri er tilkopla. Øktnøklar blir berre lagra som hash på serveren. Serverloggar skriv ikkje elevkode eller ID-token.

## Cloud Run og Firestore

Bygg Dockerfile i kommunen si byggjeløysing. Containeren krev miljøvariablane i `.env.example`; `.env` blir ikkje lesen automatisk. Produksjon nektar å starte utan full konfigurasjon, ved HTTP-origin eller med emulatorvariablar. `SCHOOL_LOCAL=1` kan aldri brukast med `NODE_ENV=production`.

Bruk ein særskild tenestekonto med Firestore-tilgang (`roles/datastore.user`) på rett prosjekt. Bruk Cloud Run si tenesteidentitet, ikkje ei nedlasta nøkkelfil. Nettlesaren har ingen Firestore-SDK eller databaselegitimasjon. Serverbibliotek går gjennom IAM; alle eigar- og gruppekontrollar skjer i appserveren. Publiser `firestore.rules` som tillegg dersom Firebase-klienttilgang er aktivert; reglane nektar all direkte klienttilgang. [Firestore IAM](https://docs.cloud.google.com/firestore/native/docs/security/iam)

Opprett Firestore i ein region kommunen har godkjent før data blir tekne inn. Vel Cloud Run-region i samsvar med dette. Ein liten pilot kan starte med éin CPU, 512 MiB minne, 0 minimumsinstansar og 2 maksimumsinstansar; dette er startverdiar som må prøvast i kommunen sitt miljø. JavaScript-køyringa skjer i eleven sin nettlesar. Tenesta må kunne vise innloggingssida utan Cloud Run-IAM-innlogging; alle `/api`-elevdata krev appinnlogging. Vurder kommunen sine nettverkskrav før de gjer adressa tilgjengeleg. [Cloud Run for Node.js](https://docs.cloud.google.com/run/docs/quickstarts/build-and-deploy/deploy-nodejs-service)

## Google-skuleinnlogging

Opprett ein OAuth-klient av typen Web application. Registrer den endelege HTTPS-adressa som godkjend JavaScript-origin, nøyaktig lik `APP_ORIGIN` utan etterfølgjande skråstrek. Set `GOOGLE_CLIENT_ID`, `ALLOWED_DOMAINS` (kommaseparert) og `GOOGLE_CLOUD_PROJECT`.

Appen bruker GIS-popup med ein JavaScript-callback og eigen dobbel CSRF-kontroll på POST til `/api/auth/google`. Serveren bruker `google-auth-library.verifyIdToken` for signatur, utferdar, tidsgrense og audience, og kontrollerer `hd` mot domenelista. E-postsuffiks åleine gir aldri tilgang. Stabil `sub` identifiserer kontoen også om e-postadressa endrar seg. [Google si rettleiing](https://developers.google.com/identity/gsi/web/guides/verify-google-id-token)

Lærarar blir tildelte med `TEACHER_GOOGLE_SUBS`, ei særskild liste av verifiserte Google-identifikatorar. Hent desse gjennom kommunen sin godkjende identitetsprosess; ikkje stol på ein ID-token dekoda utan signaturkontroll. Ingen klientknapp kan tildele lærarrolle. Fjerning frå lista blir kontrollert på kvar førespurnad i den nye revisjonen; flytt all trafikk frå den gamle revisjonen ved rolleendring.

Prøv med éin godkjend elevkonto, éin lærar og ein konto frå eit anna domene før pilot. Test faktisk pålogging, utlogging, maskinbyte og lærartilgang. Dette er ikkje verifisert med kommunen sine kontoar i utviklingsmiljøet.

## Kostnadsvarsling og feilovervaking

Opprett eit Cloud Billing-budsjett avgrensa til prosjektet med eit beløp kommunen vel. Legg inn varsel ved 50, 80 og 100 prosent og send til namngjevne driftsansvarlege. Eit budsjettvarsel er ikkje eit automatisk kostnadstak. Set maksimumsinstansar i Cloud Run og vurder Firestore-kvotar i tillegg. Prøv at mottakarane faktisk får eit testvarsel. [Budsjettoppsett](https://cloud.google.com/billing/docs/how-to/budgets)

Lag ein oppetidskontroll mot `/health`. Han prøver appen, ikkje databasen. Legg til varsel for Cloud Run 5xx, vedvarande høg svartid, instansminne og feil i lagrings-API-et. Loggfilter for appfeil: `resource.type="cloud_run_revision"` og tekst `api_error`. Send varsel til same driftsansvarlege og prøv ei kontrollert feilhending i testmiljøet. Hald loggtilgang og logglagring i tråd med kommunen sine reglar. [Cloud Run-overvaking](https://docs.cloud.google.com/run/docs/monitoring)

## Sikkerheitskopi og gjenoppretting

Appen har versjonert logisk eksport. Køyr med ein driftskonto med nødvendige IAM-rettar, i ei avtalt roleg periode utan samtidige skrivingar. Eksporten er ikkje eit atomisk øyeblikksbilete på tvers av samlingar. Bruk Firestore si forvalta backup/PITR-løysing i tillegg for kontinuerleg drift; kommunen må fastsetje tidsplan, region, lagringstid og tilgjenge.

Set `GOOGLE_CLOUD_PROJECT` og, for ekte data, `CONFIRM_PROJECT` til same prosjekt-ID. Deretter:

```sh
pnpm backup backups/avtalt-kopi.json
```

Filen blir ikkje overskriven om han finst frå før. Han inneheld elevdata og må lagrast skjerma, ikkje i Git eller ei offentleg bøtte. Økter blir ikkje eksporterte.

For gjenoppretting: opprett ein **tom** testdatabase/prosjekt, set miljøvariablane til dette prosjektet og køyr:

```sh
pnpm restore backups/avtalt-kopi.json
```

Verktøyet validerer formatet og nektar å overskrive eksisterande data. Om ei gjenoppretting blir avbroten, bruk ein ny tom database for neste forsøk. Kontroller tal på brukarar, medlemskap og prosjekt, og prøv kode, konflikthistorikk og lærartilgang med godkjende testkontoar. Økter må opprettast på nytt. Den lokale emulatorprøva `pnpm test:emulator` har same eksport-/restore-kodeveg; ekte kommunal backup og gjenoppretting må gjennomførast før elevbruk.

## Lagringstid, sletting og oppdateringar

Appen handhevar åtte timars innloggingsøkt. Aktiver Firestore TTL på `sessions.expiresAt` for opprydding; tilgang blir avvist straks økta er utgått sjølv om TTL-slettinga kjem seinare. TTL krev eit tidsstempelfelt og er ikkje ei garantert straks-sletting. [TTL-dokumentasjon](https://docs.cloud.google.com/firestore/native/docs/ttl)

Følg kommunen sin godkjende prosess for sletting av `users`, eigne `progress`, `projects`, `conflicts`, `memberships`, `reviews` og `sessions`. Ved sletting av ein lærar må også eigne grupper og dei tilhøyrande medlemskapa/vurderingane handterast, utan å slette elevane sine eigne prosjekt. Ta med sikkerheitskopiar og loggar i lagringstida. Firestore slettar ikkje automatisk alle relaterte dokument når eitt brukardokument blir fjerna. [Sletting i Firestore](https://docs.cloud.google.com/firestore/native/docs/manage-data/delete-data)

Køyr testane før kvar ny revisjon, prøv innlogging og lagring i testmiljøet, og ha førre Cloud Run-revisjon klar for tilbakerulling. Ikkje endre stabile `skule-v1-`-ID-ar eller `schemaVersion: 1` utan ein prøvd migrering. Ny utgåve må ikkje krevje at eleven slettar eigne data.

## Publiseringsprotokoll – står open

| Kontroll                                           | Stadfesting  |
| -------------------------------------------------- | ------------ |
| Kommuneprosjekt, billing, domene og lærar-ID-ar    | Ikkje utført |
| Region, lagringstid, sletting og driftsansvar      | Ikkje utført |
| Containerbygg og oppstart i kommunen sitt miljø    | Ikkje utført |
| Ekte Google-kontoar og tilgang frå feil domene     | Ikkje utført |
| Kostnadsvarsel og feilvarsel leverte til ansvarleg | Ikkje utført |
| Backup gjenoppretta og kontrollert i skyen         | Ikkje utført |
| Ti faktiske skulemaskiner og elevprøving           | Ikkje utført |
