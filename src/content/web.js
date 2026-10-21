import { make } from './helpers.js';
const base =
  '<main id="side"><h1>Pixeljam</h1><p>Festivalen for spel, musikk og kreative idear.</p></main>';
const style =
  'body { background: #f5f5ed; color: #172b37; font-family: sans-serif; }\nmain { max-width: 600px; margin: auto; padding: 24px; }';
export const web = make(
  'web',
  [
    {
      title: 'Lag ein festivalplakat',
      goal: 'Gje sida ei hovudoverskrift og ein kort introduksjon til festivalen din.',
      explain:
        'HTML skildrar innhaldet på ei nettside. Ein tagg som <h1> opnar ei overskrift, og </h1> avsluttar henne. <p> er eit avsnitt. Vel HTML-fana og rediger teksten der.',
      term: [
        'HTML-element',
        'Ein del av ei nettside, ofte med ein starttagg, innhald og ein sluttagg.',
      ],
      start: '',
      solution: '',
      html: '<main>\n  <!-- Skriv ei overskrift og eit avsnitt her. -->\n</main>',
      solutionHtml: base,
      example: '<h1>Pixeljam</h1>\n<p>Ein dag full av spel.</p>',
      hints: [
        'Start med <h1> og avslutt med </h1>.',
        'Skriv introduksjonen inne i <p> og </p>.',
        'Begge elementa kan liggje mellom <main> og </main>.',
      ],
      why: 'h1 gir sida ei tydeleg hovudoverskrift. p markerer teksten som eit eige avsnitt. HTML gir innhaldet struktur.',
      extra: 'Finn på eit nytt festivalnamn og skriv kven festivalen er for.',
      check: {
        html: (d) =>
          !!d.querySelector('h1')?.textContent.trim() && !!d.querySelector('p')?.textContent.trim(),
      },
    },
    {
      title: 'Organiser festivalprogrammet',
      goal: 'Lag ei eiga programseksjon med ei underoverskrift og minst tre listepunkt.',
      explain:
        'section samlar innhald om eitt tema. h2 er ei underoverskrift. ul lagar ei punktliste, og kvart punkt får ein li-tagg. Ryddig struktur hjelper både lesarar og skjermlesarar.',
      term: [
        'Semantikk',
        'At elementa seier kva innhaldet betyr, til dømes overskrift, liste eller navigasjon.',
      ],
      start: '',
      solution: '',
      html: base,
      solutionHtml:
        base +
        '\n<section><h2>Program</h2><ul><li>Lag pikselkunst</li><li>Spelturnering</li><li>Konsert</li></ul></section>',
      example: '<ul>\n  <li>Spelturnering</li>\n</ul>',
      hints: [
        'Skriv <section> etter main.',
        'Bruk h2 til tittelen Program, og ul rundt lista.',
        'Kvart programpunkt skal ha sitt eige <li>…</li>.',
      ],
      why: 'Lista fortel nettlesaren at punkta høyrer saman. h2 plasserer programmet under hovudtittelen i hierarkiet.',
      extra: 'Lag ein ekstra seksjon for mat og drikke.',
      check: {
        html: (d) =>
          !!d.querySelector('section h2') && d.querySelectorAll('section li').length >= 3,
      },
    },
    {
      title: 'Finn din eigen fargepalett',
      goal: 'Gje sida ein lys bakgrunn og ei blå hovudoverskrift med CSS.',
      explain:
        'CSS bestemmer utsjånaden. Ein regel har ein veljar og eigenskapar i klammeparentesar. h1 vel hovudoverskrifta. color endrar tekstfargen, background endrar bakgrunnen.',
      term: ['CSS-veljar', 'Kode som vel kva HTML-element ei stilregel gjeld for, til dømes h1.'],
      start: '',
      solution: '',
      html: base,
      css: 'body { background: white; }\nh1 { color: black; }',
      solutionCss: 'body { background: #f5f5ed; }\nh1 { color: blue; }',
      example: 'h1 { color: blue; }',
      hints: [
        'Vel CSS-fana. Finn regelen for h1.',
        'Byt color frå black til blue.',
        'Vel ein lys bakgrunn i body, til dømes #f5f5ed.',
      ],
      why: 'Regelen for h1 gjeld alle hovudoverskrifter. Fargekoden #f5f5ed gir body ein varm lys bakgrunn.',
      extra: 'Prøv ei anna mørk tekstfarge og sjekk at teksten er lett å lese.',
      check: {
        css: (s) => /h1\s*\{[^}]*color\s*:\s*(blue|#2453db)/i.test(s) && /background\s*:/i.test(s),
      },
    },
    {
      title: 'Gje innhaldet rom til å puste',
      goal: 'Lag eit innhaldskort med padding på 24px og avrunda hjørne.',
      explain:
        'Alle HTML-element har ei boks rundt seg. padding er luft inni boksen; margin er luft utanfor. border-radius rundar av hjørna. px betyr skjermpunkt.',
      term: [
        'Boksmodellen',
        'Innhald, innvendig luft (padding), kant (border) og utvendig luft (margin).',
      ],
      start: '',
      solution: '',
      html: base,
      css: 'main { background: white; padding: 0; }',
      solutionCss:
        'body { background: #e5edff; }\nmain { background: white; padding: 24px; margin: 20px; border-radius: 20px; }',
      example: 'main { padding: 24px; border-radius: 20px; }',
      hints: [
        'Finn main-regelen i CSS.',
        'Endre padding frå 0 til 24px.',
        'Legg til border-radius: 20px; før klammeparentesen sluttar.',
      ],
      why: 'padding flyttar teksten vekk frå kanten. border-radius endrar berre forma på hjørna, ikkje teksten.',
      extra: 'Legg til ein kant med border: 2px solid blue; og samanlikn margin og padding.',
      check: {
        css: (s) => /padding\s*:\s*24px/.test(s) && /border-radius\s*:\s*[1-9]\d*px/.test(s),
      },
    },
    {
      title: 'Lag kort for favorittaktivitetar',
      goal: 'Lag minst to aktivitetskort med same klasse og ei felles stilregel.',
      explain:
        'class gir element ei gruppe. Fleire element kan ha same klasse. I CSS blir klassen vald med punktum: .kort. Det let deg gi mange kort lik utsjånad utan å kopiere stilreglar.',
      term: ['Klasse', 'Eit gruppenamn i HTML. class="kort" blir vald med .kort i CSS.'],
      start: '',
      solution: '',
      html: '<h1>Dette kan du gjere</h1>\n<article class="kort"><h2>Spel</h2><p>Prøv eit nytt spel.</p></article>',
      solutionHtml:
        '<h1>Dette kan du gjere</h1><article class="kort"><h2>Spel</h2><p>Prøv eit nytt spel.</p></article><article class="kort"><h2>Musikk</h2><p>Lag ein beat.</p></article>',
      css: '.kort { }',
      solutionCss:
        '.kort { padding: 24px; background: #e5edff; margin: 12px; border-radius: 16px; }',
      example: '<article class="kort">Lag ein beat</article>\n/* CSS: .kort { padding: 24px; } */',
      hints: [
        'Kopier article og skriv om innhaldet i den nye.',
        'Begge article-elementa skal ha class="kort".',
        'Skriv padding og background inne i .kort-regelen.',
      ],
      why: 'Dei to elementa deler klasse og får same stil. Innhaldet kan likevel vere heilt ulikt.',
      extra: 'Gje eitt kort ein ekstra klasse som markerer dagens høgdepunkt.',
      check: {
        html: (d) => d.querySelectorAll('.kort').length >= 2,
        css: (s) => /\.kort\s*\{[^}]+}/.test(s),
      },
    },
    {
      title: 'Legg korta ved sida av kvarandre',
      goal: 'Bruk CSS Grid til å vise to aktivitetskort i to kolonnar.',
      explain:
        'Grid er eit rutenett for oppsett. display: grid slår det på. grid-template-columns: 1fr 1fr lagar to like kolonnar. gap legg luft mellom korta.',
      term: [
        'Grid',
        'Eit system i CSS for å plassere innhald i rader og kolonnar. fr er ein del av ledig plass.',
      ],
      start: '',
      solution: '',
      html: '<h1>Vel ein aktivitet</h1><section class="aktivitetar"><article>🎮 Spel</article><article>🎵 Musikk</article></section>',
      css: '.aktivitetar { }\narticle { padding: 24px; background: #e5edff; }',
      solutionCss:
        '.aktivitetar { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }\narticle { padding: 24px; background: #e5edff; }',
      example: '.aktivitetar { display: grid; grid-template-columns: 1fr 1fr; }',
      hints: [
        'Regelen skal gjelde behaldaren .aktivitetar.',
        'Skriv display: grid; for å slå på rutenettet.',
        'Legg til grid-template-columns: 1fr 1fr; og gap: 16px;',
      ],
      why: 'Grid fordeler barna til section over dei to kolonnane. gap legg til avstand utan ekstra HTML.',
      extra: 'Prøv tre kort og tre kolonnar. Kva skjer på ei smal flate?',
      check: {
        css: (s) =>
          /display\s*:\s*grid/.test(s) &&
          /grid-template-columns\s*:\s*(1fr\s+1fr|repeat\(2,\s*1fr\))/.test(s),
      },
    },
    {
      title: 'Ei side som passar små skjermar',
      goal: 'Bruk ei mediaregel til å vise éin kolonne på skjermar smalare enn 600px.',
      explain:
        'Nettsider blir opna på ulike skjermar og med ulik forstørring. @media let oss endre CSS når eit vilkår om skjermen er sant. Prøv å gjere resultatfeltet smalt.',
      term: ['Responsiv utforming', 'Ei side som tilpassar oppsettet til plassen ho har.'],
      start: '',
      solution: '',
      html: '<h1>Pixeljam</h1><section class="aktivitetar"><article>Spel</article><article>Musikk</article></section>',
      css: '.aktivitetar { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }\narticle { background: #e5edff; padding: 24px; }',
      solutionCss:
        '.aktivitetar { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }\narticle { background: #e5edff; padding: 24px; }\n@media (max-width: 600px) {\n  .aktivitetar { grid-template-columns: 1fr; }\n}',
      example: '@media (max-width: 600px) {\n  .aktivitetar { grid-template-columns: 1fr; }\n}',
      hints: [
        'Skriv mediaregelen etter dei vanlege reglane.',
        'Vilkåret er (max-width: 600px).',
        'Inne i mediaregelen gir du .aktivitetar grid-template-columns: 1fr;',
      ],
      why: 'Grunnregelen gjeld først. Når breidda er høgst 600px, erstattar mediaregelen dei to kolonnane med éin.',
      extra: 'Test med 200 prosent forstørring. Er tekst og knappar framleis brukande?',
      check: {
        css: (s) =>
          /@media\s*\(max-width:\s*600px\)/.test(s) &&
          /grid-template-columns\s*:\s*1fr\s*;/.test(s),
      },
    },
    {
      title: 'Gjer sida klar for besøkjande',
      goal: 'Samle overskrift, program, aktivitetskort og ein tydeleg knapp på di eiga side.',
      explain:
        'No set du saman det du har lært. Ein knapp skal seie kva han gjer. :focus-visible gir eit tydeleg tastaturfokus. Knappen treng JavaScript for å reagere; det kjem i neste modul.',
      term: [
        'Tastaturfokus',
        'Markeringa som viser kva element som får neste tastetrykk, ofte flytta med Tab.',
      ],
      start: '',
      solution: '',
      html: base,
      css: style,
      solutionHtml:
        base +
        '<section><h2>Program</h2><ul><li>Spelverkstad</li><li>Musikk</li><li>Pikselkunst</li></ul></section><button id="meir">Vis meir om festivalen</button>',
      solutionCss:
        style +
        '\nbutton { padding: 12px 20px; background: #2453db; color: white; }\nbutton:focus-visible { outline: 3px solid black; outline-offset: 3px; }',
      example: '<button id="meir">Vis meir om festivalen</button>',
      hints: [
        'Start med innhaldet i HTML før du pyntar.',
        'Legg til programlista og ein button med forklarande tekst.',
        'Bruk button:focus-visible i CSS og prøv Tab i resultatfeltet.',
      ],
      why: 'Struktur, lesbar tekst og tydelege kontrollar gjer sida lettare å bruke. Stilen gir synleg fokus også utan mus.',
      extra: 'La ein medelev teste sida med berre tastaturet og skriv ned éi forbetring.',
      self: 'Kan du finne knappen med Tab, lese all tekst og forklare kva som enno manglar for at knappen skal verke?',
      check: {
        html: (d) =>
          !!d.querySelector('h1') &&
          d.querySelectorAll('li').length >= 3 &&
          (d.querySelector('button')?.textContent.length || 0) > 5,
        css: (s) => s.includes(':focus-visible'),
      },
    },
  ],
  'web',
);
const interactive =
  '<main id="side"><h1>Pixeljam</h1><button id="knapp">Trykk her</button><p id="svar">Kva skjer no?</p></main>';
export const dom = make(
  'dom',
  [
    {
      title: 'Finn eit element med JavaScript',
      goal: 'Endre teksten i svar-avsnittet til Velkomen til Pixeljam!',
      explain:
        'DOM er måten JavaScript ser HTML-sida på. document.querySelector("#svar") finn elementet med id="svar". textContent les eller endrar teksten i elementet. Her får du eit trygt utval av DOM-funksjonane.',
      term: ['DOM', 'Ei framstilling av nettsida som element JavaScript kan finne og endre.'],
      html: interactive,
      css: style,
      start: 'const svar = document.querySelector("#svar");\n// Gje svar ein ny tekst.',
      solution:
        'const svar = document.querySelector("#svar");\nsvar.textContent = "Velkomen til Pixeljam!";',
      hints: [
        'Bruk variabelen svar på den neste linja.',
        'Eigenskapen du skal endre heiter textContent.',
        'Skriv svar.textContent = "Velkomen til Pixeljam!";',
      ],
      why: 'querySelector finn eitt element. Tildelinga endrar teksten der, medan resten av HTML-sida står uendra.',
      extra: 'Finn h1 på same måte og endre festivalnamnet.',
      check: {
        inspect: (s) => s.dom.some((n) => n.id === 'svar' && n.text === 'Velkomen til Pixeljam!'),
      },
    },
    {
      title: 'Ein knapp som gjer noko',
      goal: 'Vis teksten Du er på lista! først når knappen blir trykt.',
      explain:
        'addEventListener registrerer ein funksjon som skal køyre ved ei hending. "click" er namnet på klikkhendinga. Funksjonen kan òg bli utløyst med Enter når knappen har fokus.',
      term: ['Lyttar', 'Ein funksjon som ventar på ei bestemt hending, til dømes eit klikk.'],
      html: interactive,
      css: style,
      start:
        'const knapp = document.querySelector("#knapp");\nconst svar = document.querySelector("#svar");\n// Lytt etter click på knappen.',
      solution:
        'const knapp = document.querySelector("#knapp");\nconst svar = document.querySelector("#svar");\nknapp.addEventListener("click", function() {\n  svar.textContent = "Du er på lista!";\n});',
      hints: [
        'Start med knapp.addEventListener.',
        'Gi han "click" og ein funksjon.',
        'Endre svar.textContent inne i funksjonen, ikkje før.',
      ],
      why: 'Funksjonen blir lagra som ein lyttar. Først når knappen blir aktivert, blir teksten endra.',
      extra: 'Byt òg teksten på knappen til Registrert.',
      check: {
        steps: [{ event: { type: 'click', id: 'knapp' } }],
        inspect: (s) => s.dom.some((n) => n.id === 'svar' && n.text === 'Du er på lista!'),
      },
    },
    {
      title: 'Lag ein knapp for temabyte',
      goal: 'La knappen slå klassen natt av og på på side-elementet.',
      explain:
        'classList.toggle legg til ein klasse om han manglar, og fjernar han om han finst. CSS bestemmer korleis klassen ser ut. Slik kan JavaScript velje tilstand medan CSS teiknar henne.',
      term: [
        'Tilstand',
        'Kva programmet hugsar akkurat no, til dømes om nattmodus er på eller av.',
      ],
      html: interactive,
      css: style + '\n.natt { background: #172b37; color: white; }',
      start:
        'const side = document.querySelector("#side");\nconst knapp = document.querySelector("#knapp");\nknapp.addEventListener("click", function() {\n  // Veksle klassen natt.\n});',
      solution:
        'const side = document.querySelector("#side");\nconst knapp = document.querySelector("#knapp");\nknapp.addEventListener("click", function() {\n  side.classList.toggle("natt");\n});',
      hints: [
        'Bruk side.classList inne i klikkfunksjonen.',
        'Metoden toggle treng klassenamnet som tekst.',
        'Skriv side.classList.toggle("natt");',
      ],
      why: 'CSS-regelen .natt er klar frå starten. Klikket endrar berre kva klassar side høyrer til.',
      extra: 'Lag eit eige lyst tema og sørg for lesbar tekst i begge.',
      check: {
        steps: [{ event: { type: 'click', id: 'knapp' } }],
        inspect: (s) => s.dom.some((n) => n.id === 'side' && n.classes.split(' ').includes('natt')),
      },
    },
    {
      title: 'Hels på den som skriv',
      goal: 'Les namnet frå tekstfeltet og vis Hei, Ada! når namnet er Ada.',
      explain:
        'Eit input-element har ein value som inneheld det brukaren har skrive. Hendinga input blir utløyst når innhaldet blir endra. Ein label fortel kva feltet er til.',
      term: ['value', 'Eigenskapen som held den noverande verdien i eit innskrivingsfelt.'],
      html: '<label for="namn">Kallenamnet ditt</label><input id="namn" type="text"><p id="svar">Hei!</p>',
      css: style,
      start:
        'const felt = document.querySelector("#namn");\nconst svar = document.querySelector("#svar");\nfelt.addEventListener("input", function() {\n  // Les felt.value og lag ei helsing.\n});',
      solution:
        'const felt = document.querySelector("#namn");\nconst svar = document.querySelector("#svar");\nfelt.addEventListener("input", function() {\n  svar.textContent = "Hei, " + felt.value + "!";\n});',
      hints: [
        'Teksten i feltet ligg i felt.value.',
        'Set saman "Hei, ", verdien og "!".',
        'Skriv svar.textContent = "Hei, " + felt.value + "!";',
      ],
      why: 'Kvar endring les den nye verdien. Eit vilkår er ikkje nødvendig, fordi alle namn får same type helsing.',
      extra: 'Vis Skriv eit namn når felt.value er ein tom streng.',
      check: {
        steps: [{ event: { type: 'input', id: 'namn', value: 'Ada' } }],
        inspect: (s) => s.dom.some((n) => n.id === 'svar' && n.text === 'Hei, Ada!'),
      },
    },
    {
      title: 'Lag ein liten festivalquiz',
      goal: 'Gi Rett! for svaret 4 og Prøv igjen for andre svar på 2 + 2.',
      explain:
        'Verdien i eit input-felt er tekst, sjølv når han ser ut som eit tal. Number gjer teksten om til eit tal. Deretter kan if og else velje tilbakemelding.',
      term: [
        'Typekonvertering',
        'Å gjere ein verdi om til ein annan type, som tekst til tal med Number.',
      ],
      html: '<h1>Kodequiz</h1><label for="tal">Kva er 2 + 2?</label><input id="tal" type="number"><button id="sjekk">Sjekk svaret</button><p id="svar">Skriv eit svar.</p>',
      css: style,
      start:
        'const felt = document.querySelector("#tal");\nconst svar = document.querySelector("#svar");\ndocument.querySelector("#sjekk").addEventListener("click", function() {\n  const tal = Number(felt.value);\n  // Vel tilbakemelding.\n});',
      solution:
        'const felt = document.querySelector("#tal");\nconst svar = document.querySelector("#svar");\ndocument.querySelector("#sjekk").addEventListener("click", function() {\n  const tal = Number(felt.value);\n  if (tal === 4) { svar.textContent = "Rett!"; }\n  else { svar.textContent = "Prøv igjen"; }\n});',
      hints: [
        'Samanlikn tal med 4, utan hermeteikn.',
        'Endre svar.textContent i begge greinene.',
        'Bruk if (tal === 4) og ei else-grein.',
      ],
      why: 'Number("4") gir talet 4. Samanlikninga blir sann for rett svar og usann for andre tal.',
      extra: 'Lag to spørsmål og hald teljing på rette svar.',
      check: {
        steps: [
          { event: { type: 'input', id: 'tal', value: '3' } },
          {
            event: { type: 'click', id: 'sjekk' },
            expect: (s) => s.dom.some((n) => n.id === 'svar' && n.text === 'Prøv igjen'),
          },
          { event: { type: 'input', id: 'tal', value: '4' } },
          { event: { type: 'click', id: 'sjekk' } },
        ],
        inspect: (s) => s.dom.some((n) => n.id === 'svar' && n.text === 'Rett!'),
      },
    },
    {
      title: 'Lag ei stemmeteljing for festivalen',
      goal: 'La tre klikk gi teksten Stemmer: 3, og hald fram med å telje etterpå.',
      explain:
        'Når ein teljar ligg utanfor klikkfunksjonen, hugsar han verdien mellom klikk. Om du opprettar han inne i funksjonen, startar han på nytt kvar gong. Plasseringa av variablar betyr noko.',
      term: ['Verkeområde', 'Delen av koden der eit variabelnamn kan brukast.'],
      html: '<h1>Kva vil du ha på Pixeljam?</h1><button id="knapp">Stem på spelturnering</button><p id="svar">Stemmer: 0</p>',
      css: style,
      start:
        'let stemmer = 0;\nconst svar = document.querySelector("#svar");\ndocument.querySelector("#knapp").addEventListener("click", function() {\n  // Auk stemmer og vis den nye verdien.\n});',
      solution:
        'let stemmer = 0;\nconst svar = document.querySelector("#svar");\ndocument.querySelector("#knapp").addEventListener("click", function() {\n  stemmer += 1;\n  svar.textContent = "Stemmer: " + stemmer;\n});',
      hints: [
        'stemmer er allereie definert utanfor funksjonen.',
        'Auk med stemmer += 1.',
        'Vis "Stemmer: " + stemmer i svar.textContent.',
      ],
      why: 'Den same variabelen blir oppdatert ved kvart klikk. Teksten viser alltid den nyaste verdien. Dette er ein lokal demonstrasjon, ikkje ei ekte avstemming mellom fleire brukarar.',
      extra:
        'Legg til ein nullstillingsknapp og forklar kvifor ein ekte avstemming treng ein server.',
      check: {
        steps: Array.from({ length: 3 }, () => ({ event: { type: 'click', id: 'knapp' } })),
        inspect: (s) => s.dom.some((n) => n.id === 'svar' && n.text === 'Stemmer: 3'),
      },
    },
  ],
  'web',
);
