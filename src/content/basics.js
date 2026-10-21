import { make } from './helpers.js';
export const start = make('start', [
  {
    title: 'Gje roboten ei ny drakt',
    goal: 'Endre den blå robotkroppen til lime. Trykk Køyr og sjå skilnaden.',
    explain:
      'Kode er instruksjonar som maskina følgjer. rect teiknar ein firkant. Tala seier kvar han står og kor stor han er. Fargen står mellom hermeteikn. Endre berre fargen først.',
    term: [
      'Funksjon',
      'Ei namngjeven handling. rect(x, y, breidd, høgd, farge) er ei teiknehandling.',
    ],
    start:
      '// Endre fargen i den første firkanten.\nrect(170, 90, 140, 150, "blue");\ncircle(205, 130, 12, "white");\ncircle(275, 130, 12, "white");\nrect(210, 190, 60, 10, "black");',
    solution:
      'rect(170, 90, 140, 150, "lime");\ncircle(205, 130, 12, "white");\ncircle(275, 130, 12, "white");\nrect(210, 190, 60, 10, "black");',
    hints: [
      'Finn ordet blue i den første linja.',
      'Byt ut blue med lime. Hald på hermeteikna.',
      'Den første linja skal ende med 150, "lime");',
    ],
    why: 'Berre siste argumentet til rect blei endra. Same form og plassering får derfor ein ny farge. Argument er verdiane mellom parentesane.',
    extra: 'Lag eit raudt belte med ein ekstra rect. Prøv å forklare kva kvart tal gjer.',
    check: {
      inspect: (s) =>
        s.draws.some(
          (d) => d.op === 'rect' && ['lime', '#00ff00', '#0f0'].includes(d.color.toLowerCase()),
        ),
    },
  },
  {
    title: 'Flytt roboten på scena',
    goal: 'Teikn ein sirkel med midtpunkt på x = 320 og y = 160.',
    explain:
      'Scena er 480 punkt brei og 320 høg. x aukar mot høgre; y aukar nedover. circle tek x, y, radius og farge. Radius er avstanden frå midten til kanten.',
    term: [
      'Koordinat',
      'Eit tal som fortel plassering langs ei retning. x er bortover og y nedover.',
    ],
    start: 'circle(120, 160, 45, "blue");',
    solution: 'circle(320, 160, 45, "blue");',
    hints: [
      'Det første talet i circle styrer x.',
      'Du skal flytte bortover, så y kan stå på 160.',
      'Byt det første talet frå 120 til 320.',
    ],
    why: 'x = 320 flyttar sentrum til høgre. Radius og y er uendra, så sirkelen har same storleik og høgd.',
    extra: 'Teikn ein liten måne over figuren. Føresjå plasseringa før du køyrer.',
    check: { inspect: (s) => s.draws.some((d) => d.op === 'circle' && d.x === 320 && d.y === 160) },
  },
  {
    title: 'Eitt namn, fleire figurar',
    goal: 'Bruk variabelen farge til å gjere begge auga orange.',
    explain:
      'const lagrar ein verdi under eit namn. Når begge sirklane bruker namnet farge, kan du endre begge på éin stad. Tekst har hermeteikn; variabelnamn har ikkje.',
    term: [
      'Variabel',
      'Eit namn som viser til ein verdi. const blir brukt når namnet ikkje skal få ein ny verdi seinare.',
    ],
    start: 'const farge = "blue";\ncircle(180, 140, 35, farge);\ncircle(300, 140, 35, farge);',
    solution: 'const farge = "orange";\ncircle(180, 140, 35, farge);\ncircle(300, 140, 35, farge);',
    hints: [
      'Finn linja som byrjar med const.',
      'Endre teksten som farge viser til.',
      'Skriv const farge = "orange"; og bruk farge i begge circle-kalla.',
    ],
    why: 'Begge circle-kalla les den same verdien. Eitt namngjeve val gir derfor to like fargar.',
    extra: 'Lag ein variabel for radius og bruk han i begge sirklane.',
    check: {
      inspect: (s) => s.draws.filter((d) => d.op === 'circle' && d.color === 'orange').length >= 2,
    },
  },
  {
    title: 'Rekn ut eit energinivå',
    goal: 'La skjermen vise 60 ved å rekne ut energi etter tre batteri.',
    explain:
      'JavaScript kan rekne. + legg saman og * gonger. Eit tal utan hermeteikn er ein talverdi. text viser ein verdi på scena, og print viser han i utskrifta.',
    term: ['Uttrykk', 'Kode som blir rekna ut til ein verdi, til dømes 3 * 20.'],
    start: 'const batteri = 3;\nconst energi = batteri * 10;\ntext(energi, 190, 170);',
    solution: 'const batteri = 3;\nconst energi = batteri * 20;\ntext(energi, 190, 170);',
    hints: [
      'Tre like batteri skal gi 60 til saman.',
      'Kvart batteri må gi 20.',
      'Bruk batteri * 20 på den andre linja.',
    ],
    why: 'Gonginga blir rekna ut før energi blir lagra. text får talet 60 og teiknar det som tekst.',
    extra: 'Legg til eit forbruk på 15 med minus. Kva blir resultatet?',
    check: { inspect: (s) => s.draws.some((d) => d.op === 'text' && d.text === '60') },
  },
  {
    title: 'Bygg eit robotnamneskilt',
    goal: 'Vis teksten Hei, Nova! ved å setje saman tekst og eit namn.',
    explain:
      'Tekst blir kalla ein streng. + kan setje saman strenger. Mellomrom og teikn må liggje inne i hermeteikna. Kommentarar som byrjar med // er notat til menneske.',
    term: ['Streng', 'Ein tekstverdi mellom hermeteikn, til dømes "Nova".'],
    start: 'const namn = "Nova";\ntext(namn, 120, 160);',
    solution: 'const namn = "Nova";\ntext("Hei, " + namn + "!", 120, 160);',
    hints: [
      'Du treng tekst både før og etter namnet.',
      'Set saman "Hei, ", namn og "!" med +.',
      'Prøv text("Hei, " + namn + "!", 120, 160);',
    ],
    why: 'namn blir erstatta med verdien Nova. Dei tre delane blir éin streng før text får han.',
    extra: 'Byt robotnamnet og lag ei ekstra linje med ein hobby.',
    check: { inspect: (s) => s.draws.some((d) => d.op === 'text' && d.text === 'Hei, Nova!') },
  },
  {
    title: 'Vel lys med eit vilkår',
    goal: 'Vis grønt lys når energien er større enn 50, elles raudt.',
    explain:
      'if vel kva kode som skal køyrast. Vilkåret i parentesen blir sant eller usant. > betyr større enn. Klammeparentesane samlar koden som høyrer til valet.',
    term: ['Vilkår', 'Eit spørsmål koden kan svare sant eller usant på. else betyr elles.'],
    start:
      'const energi = 70;\nif (energi > 100) {\n  circle(240, 160, 60, "green");\n} else {\n  circle(240, 160, 60, "red");\n}',
    solution:
      'const energi = 70;\nif (energi > 50) {\n  circle(240, 160, 60, "green");\n} else {\n  circle(240, 160, 60, "red");\n}',
    hints: [
      'Sjekk grensa i parentesen etter if.',
      '70 er større enn 50, men ikkje 100.',
      'Byt vilkåret til energi > 50.',
    ],
    why: '70 > 50 er sant, så berre den grøne sirkelen blir teikna. Med energi = 20 blir else-greina brukt.',
    extra: 'Prøv energi lik 50. Forklar kvifor lyset blir raudt. Prøv så >=.',
    check: { inspect: (s) => s.draws.some((d) => d.op === 'circle' && d.color === 'green') },
  },
]);
export const art = make('art', [
  {
    title: 'Lag ditt eige pikselmerke',
    goal: 'Bygg eit lite motiv av minst fire firkantar i to ulike fargar.',
    explain:
      'Pikselkunst er bilete bygde av små ruter. Teiknerekkjefølgja tel: det du teiknar sist, ligg fremst. Eit rutenett med steg på 40 gjer det lett å plassere rutene.',
    term: [
      'Piksel',
      'Eit lite fargepunkt i eit bilete. Her bruker vi store ruter for å sjå mønsteret.',
    ],
    start: 'rect(160, 100, 40, 40, "blue");\n// Legg til fleire ruter.',
    solution:
      'rect(160, 100, 40, 40, "blue");\nrect(200, 100, 40, 40, "blue");\nrect(160, 140, 40, 40, "lime");\nrect(200, 140, 40, 40, "blue");',
    hints: [
      'Kopier rect-linja og endre x.',
      'Auk x eller y med 40 for å leggje rutene kant i kant.',
      'Lag minst fire rect-kall. Gje éi rute fargen lime.',
    ],
    why: 'Kvar rect er ei rute. Steget på 40 er lik breidda, så rutene møtest utan hol.',
    extra: 'Lag ein bokstav eller eit lite romvesen av rutene.',
    check: {
      inspect: (s) =>
        s.draws.filter((d) => d.op === 'rect').length >= 4 &&
        new Set(s.draws.map((d) => d.color)).size >= 2,
    },
  },
  {
    title: 'Ei løkke lagar ei heil rad',
    goal: 'Bruk ei for-løkke til å teikne seks blå ruter langs ei rad.',
    explain:
      'Ei løkke gjentek kode. for har ein start, eit vilkår og ei endring. let i = 0 startar teljaren; i < 6 held fram seks gonger; i++ aukar i med éin.',
    term: ['Løkke', 'Kode som gjentek ei handling medan eit vilkår er sant.'],
    start: 'for (let i = 0; i < 3; i++) {\n  rect(60 + i * 50, 140, 40, 40, "blue");\n}',
    solution: 'for (let i = 0; i < 6; i++) {\n  rect(60 + i * 50, 140, 40, 40, "blue");\n}',
    hints: [
      'Teljaren startar på 0. Verdiane 0–5 gir seks rundar.',
      'Endre kor lenge løkka held fram.',
      'Bruk i < 6 i midten av for-linja.',
    ],
    why: 'Løkka køyrer for i = 0, 1, 2, 3, 4 og 5. x aukar med 50 for kvar rute.',
    extra: 'Endre avstanden mellom rutene utan å endre talet på ruter.',
    check: { inspect: (s) => s.draws.filter((d) => d.op === 'rect').length === 6 },
  },
  {
    title: 'Eit sjakkmønster med val',
    goal: 'Teikn seks ruter som vekslar mellom blue og lime.',
    explain:
      '% gir resten etter deling. i % 2 er 0 for partal og 1 for oddetal. Vi kan bruke dette i eit if-val inne i løkka. === samanliknar om to verdiar er like.',
    term: ['Restoperator (%)', 'Gir det som er att etter heiltalsdeling. 5 % 2 er 1.'],
    start:
      'for (let i = 0; i < 6; i++) {\n  let farge = "blue";\n  // Gjer annankvar rute lime.\n  rect(60 + i * 50, 140, 40, 40, farge);\n}',
    solution:
      'for (let i = 0; i < 6; i++) {\n  let farge = "blue";\n  if (i % 2 === 1) { farge = "lime"; }\n  rect(60 + i * 50, 140, 40, 40, farge);\n}',
    hints: [
      'Bruk let fordi farge kan få ein ny verdi.',
      'Sjekk om i % 2 er lik 1.',
      'Legg inn if (i % 2 === 1) { farge = "lime"; } før rect.',
    ],
    why: 'Partalsrundane held på blue. Oddetalsrundane endrar farge til lime før ruta blir teikna.',
    extra: 'Prøv tre fargar med i % 3 og fleire if-val.',
    check: {
      inspect: (s) =>
        s.draws.length === 6 && s.draws.every((d, i) => d.color === (i % 2 ? 'lime' : 'blue')),
    },
  },
  {
    title: 'Ei oppskrift for stjerner',
    goal: 'Lag ein funksjon stjerne og kall han tre gonger på ulike x-posisjonar.',
    explain:
      'Du kan lage dine eigne funksjonar. function stjerne(x) samlar teiknekoden, og x er ein parameter. Eit kall som stjerne(100) fyller parameteren med 100.',
    term: ['Parameter', 'Eit namn for ein verdi funksjonen får når du bruker han.'],
    start:
      'function stjerne(x) {\n  circle(x, 150, 20, "orange");\n  rect(x - 4, 115, 8, 70, "orange");\n}\nstjerne(100);',
    solution:
      'function stjerne(x) {\n  circle(x, 150, 20, "orange");\n  rect(x - 4, 115, 8, 70, "orange");\n}\nstjerne(100);\nstjerne(240);\nstjerne(380);',
    hints: [
      'Funksjonen er allereie skriven. No skal du bruke han fleire gonger.',
      'Skriv to nye kall under stjerne(100).',
      'Bruk til dømes stjerne(240); og stjerne(380);',
    ],
    why: 'Den same oppskrifta blir brukt tre gonger. Parameteren flyttar både sirkelen og stripa saman.',
    extra: 'Gje funksjonen ein ekstra parameter for farge.',
    check: {
      inspect: (s) => new Set(s.draws.filter((d) => d.op === 'circle').map((d) => d.x)).size >= 3,
    },
  },
  {
    title: 'Fargar på ei liste',
    goal: 'Teikn tre sirklar med fargane blue, orange og lime frå ei liste.',
    explain:
      'Ei liste heiter array. Ho blir skriven med hakeparentesar. Første plass har indeks 0. fargar.length fortel kor mange plassar lista har. fargar[i] les den aktuelle plassen.',
    term: [
      'Array',
      'Ei ordna liste med verdiar. Indeks er plassnummeret, og teljinga startar på 0.',
    ],
    start:
      'const fargar = ["blue", "orange", "lime"];\nfor (let i = 0; i < fargar.length; i++) {\n  circle(100 + i * 130, 160, 40, "blue");\n}',
    solution:
      'const fargar = ["blue", "orange", "lime"];\nfor (let i = 0; i < fargar.length; i++) {\n  circle(100 + i * 130, 160, 40, fargar[i]);\n}',
    hints: [
      'Siste argumentet i circle er alltid blue no.',
      'Les fargen som ligg på plass i i lista.',
      'Byt "blue" i circle-kallet til fargar[i].',
    ],
    why: 'i styrer både plasseringa og kva farge som blir lesen. Løkka stoppar når alle listeplassane er brukte.',
    extra: 'Legg til ein fjerde farge og juster avstanden så alle får plass.',
    check: {
      inspect: (s) =>
        s.draws
          .filter((d) => d.op === 'circle')
          .map((d) => d.color)
          .join(',') === 'blue,orange,lime',
    },
  },
  {
    title: 'Bygg ein heil pikselvegg',
    goal: 'Lag eit rutenett med fire kolonnar og tre rader, tolv ruter i alt.',
    explain:
      'Ei løkke kan liggje inne i ei anna. Den ytre vel rad. Den indre fyller kvar rad med kolonnar. x kjem frå kolonnen og y frå rada.',
    term: [
      'Nøsta løkke',
      'Ei løkke inni ei anna løkke. Den indre blir køyrd ferdig for kvar ytre runde.',
    ],
    start:
      'for (let rad = 0; rad < 3; rad++) {\n  for (let kol = 0; kol < 2; kol++) {\n    rect(130 + kol * 50, 70 + rad * 50, 40, 40, "blue");\n  }\n}',
    solution:
      'for (let rad = 0; rad < 3; rad++) {\n  for (let kol = 0; kol < 4; kol++) {\n    rect(130 + kol * 50, 70 + rad * 50, 40, 40, "blue");\n  }\n}',
    hints: [
      'Den ytre løkka gir allereie tre rader.',
      'Den indre må køyre fire gonger per rad.',
      'Endre kol < 2 til kol < 4.',
    ],
    why: 'Tre rundar utanpå og fire inni gir 3 * 4 = 12 ruter. Kvar kombinasjon av rad og kol får si eiga plassering.',
    extra: 'Bruk (rad + kol) % 2 til eit sjakkbrett.',
    check: {
      inspect: (s) =>
        s.draws.length === 12 &&
        new Set(s.draws.map((d) => d.x)).size === 4 &&
        new Set(s.draws.map((d) => d.y)).size === 3,
    },
  },
]);
export const move = make('move', [
  {
    title: 'Ein figur som hugsar posisjonen',
    goal: 'Flytt sirkelen frå x = 100 til x = 140 med ei endring av ein variabel.',
    explain:
      'let lagar ein variabel som kan endrast. x = x + 40 les den gamle verdien, legg til 40 og lagrar svaret tilbake. Det er ei tildeling, ikkje ei matematisk likning.',
    term: ['Tildeling', 'Å lagre ein verdi i eit namn med =. Samanlikning bruker ===.'],
    start: 'let x = 100;\n// Auk x med 40 her.\ncircle(x, 160, 35, "blue");',
    solution: 'let x = 100;\nx = x + 40;\ncircle(x, 160, 35, "blue");',
    hints: [
      'Endringa må skje før teikninga.',
      'Les x, legg til 40 og lagre i x.',
      'Skriv x = x + 40; på den tomme linja.',
    ],
    why: 'Variabelen er først 100 og blir så 140. circle les den nye verdien.',
    extra: 'Prøv x += 40. Det er ei kortare skrivemåte for den same endringa.',
    check: { inspect: (s) => s.draws.some((d) => d.op === 'circle' && d.x === 140) },
  },
  {
    title: 'Set figuren i rørsle',
    goal: 'Flytt sirkelen fem punkt til høgre for kvart tidssteg.',
    explain:
      'every er ei hjelpefunksjon i verkstaden. every(100, flytt) kallar flytt om lag kvar 100 millisekund. clear ryddar før neste bilete. Slike bilete etter kvarandre gir animasjon.',
    term: [
      'Tilbakekall',
      'Ein funksjon du gir til ein annan funksjon, slik at han kan bli køyrd seinare.',
    ],
    start:
      'let x = 40;\nfunction flytt() {\n  clear();\n  circle(x, 160, 30, "blue");\n}\nevery(100, flytt);',
    solution:
      'let x = 40;\nfunction flytt() {\n  x = x + 5;\n  clear();\n  circle(x, 160, 30, "blue");\n}\nevery(100, flytt);',
    hints: [
      'Legg endringa av x inne i flytt.',
      'Auk x før du teiknar neste bilete.',
      'Skriv x = x + 5; først i funksjonen.',
    ],
    why: 'Kvar gong tidsfunksjonen kallar flytt, blir x fem større. clear fjernar førre bilete slik at figuren ikkje lagar spor.',
    extra: 'Prøv kortare intervall og mindre steg. Kva ser jamnast ut?',
    check: {
      steps: [{ tick: 100 }, { tick: 100 }],
      inspect: (s) => s.draws.some((d) => d.op === 'circle' && d.x === 50),
    },
  },
  {
    title: 'Ta imot eit tastetrykk',
    goal: 'Flytt figuren ti punkt når du trykkjer pil høgre i resultatfeltet.',
    explain:
      'onKey får ein funksjon som tek imot namnet på tasten. Funksjonen blir køyrd når resultatfeltet har fokus og ein tast blir trykt. ArrowRight er namnet JavaScript bruker for pil høgre.',
    term: [
      'Hending',
      'Noko som skjer, som eit klikk eller tastetrykk. Koden kan lytte etter hendingar.',
    ],
    start:
      'let x = 100;\nfunction teikn() { clear(); circle(x, 160, 30, "blue"); }\nonKey(function(tast) {\n  // Flytt berre ved ArrowRight.\n  teikn();\n});\nteikn();',
    solution:
      'let x = 100;\nfunction teikn() { clear(); circle(x, 160, 30, "blue"); }\nonKey(function(tast) {\n  if (tast === "ArrowRight") { x = x + 10; }\n  teikn();\n});\nteikn();',
    hints: [
      'Legg eit if-val inne i onKey-funksjonen.',
      'Samanlikn tast med "ArrowRight" ved hjelp av ===.',
      'Bruk if (tast === "ArrowRight") { x = x + 10; }',
    ],
    why: 'Berre den rette tasten endrar x. teikn viser den oppdaterte posisjonen med ein gong.',
    extra: 'Legg til ArrowLeft som trekkjer frå 10.',
    check: {
      steps: [{ event: { type: 'keydown', key: 'ArrowRight', id: 'document' } }],
      inspect: (s) => s.draws.some((d) => d.op === 'circle' && d.x === 110),
    },
  },
  {
    title: 'La figuren kome tilbake',
    goal: 'Når x går forbi 440, skal figuren starte på x = 40 igjen.',
    explain:
      'Rørsle treng grenser. Her flyttar vi først og sjekkar deretter om figuren har gått for langt. Rekkefølgja bestemmer kva som blir teikna.',
    term: [
      'Grenseverdi',
      'Eit tal der programmet skal skifte åtferd, til dømes ved kanten av scena.',
    ],
    start:
      'let x = 440;\nfunction steg() {\n  x += 10;\n  // Hopp tilbake om x er over 440.\n  clear(); circle(x, 160, 30, "blue");\n}\nevery(100, steg);',
    solution:
      'let x = 440;\nfunction steg() {\n  x += 10;\n  if (x > 440) { x = 40; }\n  clear(); circle(x, 160, 30, "blue");\n}\nevery(100, steg);',
    hints: [
      'Sjekken skal stå etter x += 10.',
      'Vilkåret er x > 440.',
      'Set x = 40 inne i klammeparentesane til if.',
    ],
    why: 'Første steg gir x = 450. Vilkåret er sant, så x blir 40 før figuren blir teikna.',
    extra: 'Lag ein figur som snur retning i staden for å hoppe tilbake.',
    check: {
      steps: [{ tick: 100 }],
      inspect: (s) => s.draws.some((d) => d.op === 'circle' && d.x === 40),
    },
  },
  {
    title: 'Samle spelardata i eit objekt',
    goal: 'Flytt objektet spelar ned 30 punkt og vis figuren på y = 150.',
    explain:
      'Eit objekt samlar verdiar som høyrer saman. spelar.x og spelar.y er eigenskapar. Objekt bruker klammeparentesar og namn: verdi. Det blir nyttig når eit spel har mange figurar.',
    term: [
      'Objekt',
      'Ei samling namngjevne verdiar. Ein eigenskap blir lesen med punktum, som spelar.x.',
    ],
    start:
      'const spelar = { x: 240, y: 120, farge: "orange" };\n// Endre spelar.y her.\ncircle(spelar.x, spelar.y, 35, spelar.farge);',
    solution:
      'const spelar = { x: 240, y: 120, farge: "orange" };\nspelar.y += 30;\ncircle(spelar.x, spelar.y, 35, spelar.farge);',
    hints: [
      'Du skal endre ein eigenskap inne i objektet.',
      'Bruk punktum: spelar.y.',
      'Skriv spelar.y += 30; før circle.',
    ],
    why: 'const held fast på sjølve objektet. Innhaldet i objektet kan likevel endrast, slik som y frå 120 til 150.',
    extra: 'Legg til eigenskapen radius og bruk han når du teiknar.',
    check: { inspect: (s) => s.draws.some((d) => d.op === 'circle' && d.x === 240 && d.y === 150) },
  },
  {
    title: 'Pause og spel vidare',
    goal: 'La mellomrom veksle mellom rørsle og pause.',
    explain:
      'Ein boolsk verdi er true eller false. ! snur verdien. Vi kan dermed slå pause av og på med pause = !pause. Tidsfunksjonen teiknar berre når pause er false.',
    term: ['Boolsk verdi', 'Ein verdi som berre kan vere true (sant) eller false (usant).'],
    start:
      'let x = 40;\nlet pause = false;\nonKey(function(tast) {\n  // Veksle pause ved mellomrom: " ".\n});\nevery(100, function() {\n  if (!pause) { x += 5; }\n  clear(); circle(x, 160, 30, "blue");\n});',
    solution:
      'let x = 40;\nlet pause = false;\nonKey(function(tast) {\n  if (tast === " ") { pause = !pause; }\n});\nevery(100, function() {\n  if (!pause) { x += 5; }\n  clear(); circle(x, 160, 30, "blue");\n});',
    hints: [
      'Eit mellomrom er strengen " ", med eit mellomrom inni.',
      'Bruk !pause for den motsette verdien.',
      'Legg inn if (tast === " ") { pause = !pause; }',
    ],
    why: 'Det første mellomrommet gjer pause sann. Det neste gjer han usann. Tidsfunksjonen held fram, men endrar ikkje x i pausen.',
    extra: 'Vis teksten Pause når pause er true.',
    check: {
      steps: [
        { tick: 100 },
        { event: { type: 'keydown', key: ' ', id: 'document' } },
        { tick: 100 },
        { event: { type: 'keydown', key: ' ', id: 'document' } },
        { tick: 100 },
      ],
      inspect: (s) => s.draws.some((d) => d.op === 'circle' && d.x === 50),
    },
  },
]);
