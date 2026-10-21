# Uavhengig sluttgjennomgang

Éin ny, uavhengig gjennomgang vurderte heile endringa frå `9162365` til `ed20e108`. Gjennomgangen var skriveverna og køyrde einingstestane (74/74 PASS). Han gav **ikkje klar for samanslåing** på grunn av fem konkrete feil. Forfattaren godtok alle fem etter vurdering av faktisk elevkonsekvens og retta dei i éin samla rettingsrunde. Det er ikkje utført ein ny uavhengig gjennomgang av rettingane.

| Funn | Konsekvens og vurdering | Retting og regresjonsprøve |
| --- | --- | --- |
| P1: Konfliktkopien mangla serverutgåva | Valet «Lagre mi utgåve vidare» kunne fjerne den andre utgåva. Må rettast. | Begge snapshot blir arkiverte i same Firestore-transaksjon som les gjeldande revisjon. Seinare lagring krev framleis rett revisjon. API-test prøver begge val og ein ny samtidig endring; Chrome-test kontrollerer at begge kopiane finst etter valet. |
| P2: HTML-broen stoppa mellomrom og piltastar | Vanleg skriving og tastaturstyring i skjema vart hindra. Må rettast. | HTML-førehandsvisinga bevarer nettlesaren si vanlege tastaturåtferd. Spelscena har si eiga tastestyring. Prøvd med mellomrom og flytting av tekstmarkør i Chrome. |
| P2: Klikk på innhald i ein knapp nådde ikkje knappen | Lovleg HTML med span i button gav upålitelege klikk. Må rettast. | Foreldre kjem frå sanert HTML. Hendingar går til elementet, foreldra og dokumentet med target/currentTarget og stopPropagation. Einingstest og faktisk klikk på span i Chrome. |
| P2: Eksport gøymde spel dersom HTML-fana hadde innhald | Ein fungerande elevkode kunne bli blank etter nedlasting. Må rettast. | Valt vising blir lagra med prosjektet og følgjer kodekopi/ZIP. Chrome-test prøver byte av oppdrag, ny opning og spel med HTML-kommentar i sjølvstendig file://-eksport. |
| P2: Utgått økt mangla veg tilbake til innlogging | Ulagra arbeid hindra utlogging; eleven kom ikkje tilbake til innlogging. Må rettast. | «Logg inn på nytt» bevarer editoren. Serveren krev same verifiserte identitet før økta blir endra. Faner tek vare på utkast og får nye lagringstilgangar. Prøvd med rein editor, ulagrat arbeid i to faner og ei mellombels fråkopla fane. Feil konto blir avvist før økta blir endra. |

Dei målretta regresjonstestane vart først observerte som FAIL og deretter PASS. Ei ekstra prøve av nettbrot under fornying av økta fann manglande oppfrisking av lagringstilgangen; også denne vart retta og observert FAIL → PASS. Endelege samla resultat står i [VERIFICATION.md](VERIFICATION.md).

Gjennomgangen framheva isolert QuickJS-køyring, avgrensa HTML/DOM, serverkontroll av eigarskap og grupper, eksplisitt lærartilgang, full oppdragsstruktur og tydeleg skilje mellom lokale prøver og skuleaksept. Ingen mindre funn vart utsette.

## Forhold gjennomgangen ikkje kunne avgjere

- **Ekte Google Workspace-kontoar og skuledomene:** framleis NOT_RUN. Krev kommunen sine opplysningar og testkontoar. Feil vurdering kan stenge rett elev ute eller gi feil domene tilgang; må prøvast før elevbruk.
- **Docker, Cloud Run, feilovervaking og gjenoppretting i skyen:** framleis NOT_RUN. Lokal bygg- og emulatorprøve er ikkje produksjonsaksept. Feil vurdering kan gi driftsstans eller tap av data; kommunen må utføre kontrollane i DRIFT.md.
- **Skulemaskiner, hjelpemiddel og læringsutbytte:** framleis NOT_RUN. Automatiske Chrome-prøver viser teknisk flyt, ikkje at ein nybyrjar forstår oppgåva. Konsekvens ved feil er utilgjengeleg eller uklår undervisning; lærar-/elevprøva i UTPROVING.md står open.
- **Lagringstid og sletting:** avgjerdene høyrer til kommunen. Feil føresetnad kan gi feil behandling av elevdata. Ingen ekte elevdata skal leggjast inn før dette er avklart.
- **Stickman, KI-chat og offentleg galleri:** medvite utanfor første utgåve etter den godkjende planen. Kostnaden ved å utsetje er færre valfrie utvidingar; dei åtte avtalte modulane er med.
