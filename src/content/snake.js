import { make } from './helpers.js';
export function snakeCode(stage) {
  return `// Snake: rutekoordinatar blir gonga med 20 når vi teiknar.
let snake = [{ x: 5, y: 6 }, { x: 4, y: 6 }, { x: 3, y: 6 }];
let direction = { x: 1, y: 0 };
let food = { x: 8, y: 6 };
let score = 0;
let over = false;
let paused = false;
let turned = false;
function same(a, b) { return a.x === b.x && a.y === b.y; }
function drawGame() {
  clear("#172b37");
  for (const part of snake) { rect(part.x * 20, part.y * 20, 18, 18, "lime"); }
${stage >= 4 ? '  rect(food.x * 20, food.y * 20, 18, 18, "orange");' : ''}
${stage >= 5 ? '  text("Poeng: " + score, 12, 25, "white", 18);' : ''}
${stage >= 6 ? '  if (over) { text("Game over", 170, 170, "white"); }' : ''}
${stage >= 7 ? '  if (paused && !over) { text("Pause", 200, 170, "white"); }' : ''}
${stage >= 8 ? '  text("Piler: styr  |  Mellomrom: pause  |  R: omstart", 12, 308, "white", 13);' : ''}
}
${
  stage >= 4
    ? `function newFood() {
  const free = [];
  for (let y = 2; y < 14; y++) {
    for (let x = 0; x < 24; x++) {
      const cell = { x: x, y: y };
      if (!snake.some(function(part) { return same(part, cell); })) { free.push(cell); }
    }
  }
  if (free.length === 0) { over = true; return; }
  food = free[random(free.length)];
}`
    : ''
}
${
  stage >= 2
    ? `function step() {
${stage >= 6 ? '  if (over || paused) { return; }' : ''}
  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
${stage >= 5 ? '  const eating = same(head, food);' : ''}
${
  stage >= 6
    ? `  const body = eating ? snake : snake.slice(0, -1);
  if (head.x < 0 || head.x >= 24 || head.y < 2 || head.y >= 14 || body.some(function(part) { return same(part, head); })) {
    over = true; drawGame(); return;
  }`
    : ''
}
  snake.unshift(head);
${stage >= 5 ? '  if (eating) { score += 1; newFood(); }\n  else { snake.pop(); }' : '  snake.pop();'}
  turned = false;
  drawGame();
}
every(160, step);`
    : ''
}
${
  stage >= 7
    ? `function restart() {
  snake = [{ x: 5, y: 6 }, { x: 4, y: 6 }, { x: 3, y: 6 }];
  direction = { x: 1, y: 0 }; food = { x: 8, y: 6 };
  score = 0; over = false; paused = false; turned = false;
  drawGame();
}`
    : ''
}
${
  stage >= 3
    ? `onKey(function(key) {
${stage >= 7 ? '  if (key === "r" || key === "R") { restart(); return; }\n  if (key === " " && !over) { paused = !paused; drawGame(); return; }' : ''}
  if (turned || over || paused) { return; }
  let next = direction;
  if (key === "ArrowUp") { next = { x: 0, y: -1 }; }
  if (key === "ArrowDown") { next = { x: 0, y: 1 }; }
  if (key === "ArrowLeft") { next = { x: -1, y: 0 }; }
  if (key === "ArrowRight") { next = { x: 1, y: 0 }; }
  if (next.x !== -direction.x || next.y !== -direction.y) { direction = next; turned = true; }
});`
    : ''
}
drawGame();
`;
}
const rows = [
  {
    title: 'Snake 1 · Ei scene og ein kropp',
    goal: 'Teikn ein slange av tre ruter på ei mørk scene. Dette blir starten på ditt eige Snake-spel.',
    explain:
      'Du arbeider i det same prosjektet gjennom alle åtte oppdraga. snake er ei liste av ruteobjekt, og første element er hovudet. drawGame er teikneramma: ho viser tilstanden utan å endre spelreglane. rect er verkstaden si hjelpefunksjon.',
    term: [
      'Teikneramme',
      'Funksjonen som viser spelet. Reglane bestemmer tilstanden, teikninga viser henne.',
    ],
    start:
      'let snake = [{ x: 5, y: 6 }, { x: 4, y: 6 }, { x: 3, y: 6 }];\nfunction drawGame() {\n  clear("#172b37");\n  // Bruk for…of til å teikne kvar del.\n}\ndrawGame();',
    hints: [
      'Bruk for (const part of snake) inni drawGame.',
      'Gong part.x og part.y med 20 for å finne skjermplasseringa.',
      'Teikn kvar del med rect(part.x * 20, part.y * 20, 18, 18, "lime");',
    ],
    why: 'Lista held rutekoordinatar. Teikninga gonger med 20, medan ei breidd på 18 gir litt luft mellom rutene. Reglane kan no arbeide med heile rutenummer.',
    extra: 'Gje hovudet ei anna farge utan å endre lista.',
    check: {
      inspect: (s) => s.draws.filter((d) => d.op === 'rect' && d.color === 'lime').length === 3,
    },
  },
  {
    title: 'Snake 2 · Eitt steg om gongen',
    goal: 'Lag step som flyttar hovudet éi rute mot høgre og held lengda på tre.',
    explain:
      'Legg til direction = { x: 1, y: 0 } og funksjonen step i prosjektet ditt. step lagar eit nytt hovud, legg det først og fjernar halen. every(160, step) er køyreramma: ho ber reglane dine ta eitt steg om lag kvar 160 ms.',
    term: [
      'Spelsløyfe',
      'Gjenteken oppdatering av tilstand og teikning. Her blir step kalla av every.',
    ],
    hints: [
      'Det nye hovudet bruker snake[0].x + direction.x og tilsvarande y.',
      'Bruk unshift for hovudet og pop for halen. Kall drawGame etterpå.',
      'Legg every(160, step); utanfor funksjonen. Sjå løysinga for heile samanhengen.',
    ],
    why: 'Hovudet kjem i naboruta. Halen blir borte i same steg, slik at lengda er uendra. Teikning og reglar har kvar si oppgåve.',
    extra: 'Endre 160 til 220. Forklar kvifor spelet går saktare.',
    check: { steps: [{ tick: 160 }], expression: 'snake.length === 3 && snake[0].x === 6' },
  },
  {
    title: 'Snake 3 · Ta styringa',
    goal: 'Styr slangen med piltastane, og hindre at han snur rett inn i seg sjølv.',
    explain:
      'Legg til onKey som vel direction. Opp betyr y = -1, ned betyr y = 1. Eit rett tilbakeslag har motsett x og y. turned avgrensar til éi ny retning per steg; set han tilbake til false i step.',
    term: [
      'Retningsvektor',
      'To tal som skildrar ei flytting. {x: 1, y: 0} betyr éi rute mot høgre.',
    ],
    hints: [
      'Start med pil opp: direction blir { x: 0, y: -1 }.',
      'Sjekk at den nye retninga ikkje er den motsette før du lagrar henne.',
      'Bruk ein turned-variabel. Sett false i step og true etter ei godkjend retningsendring.',
    ],
    why: 'Retninga blir lesen av step. Vern mot motsett retning og fleire svingar i same steg hindrar snarvegar inn i eigen kropp.',
    extra: 'Legg til WASD som alternativ til piltastane.',
    check: {
      steps: [{ event: { type: 'keydown', key: 'ArrowUp', id: 'document' } }, { tick: 160 }],
      expression: 'snake[0].x === 5 && snake[0].y === 5',
    },
  },
  {
    title: 'Snake 4 · Mat på ledige ruter',
    goal: 'Vis maten på ruta (8, 6), og lag newFood som vel ei ledig rute.',
    explain:
      'food er eit objekt med x og y. Teikn han i orange. newFood lagar ei liste free over ledige ruter og vel ei tilfeldig rute. some svarar om kroppen allereie er på ei rute. Rad 0–1 og 14–15 er reserverte for tekst.',
    term: [
      'Ledig rute',
      'Ei rute som ikkje er opptatt av kroppen. same(a, b) samanliknar både x og y.',
    ],
    hints: [
      'Teikn food i drawGame på same måte som kroppsdelane, men i orange.',
      'Lag ei nøsta løkke for x = 0–23 og y = 2–13.',
      'Bruk !snake.some(...) for å leggje berre ledige ruter i free. Vel free[random(free.length)].',
    ],
    why: 'Ved å velje frå ei liste av ledige ruter får vi aldri mat inni slangen. Ei tom liste avsluttar spelet i staden for å leite utan slutt.',
    extra: 'Gje maten ein liten dekorasjon med circle.',
    check: {
      expression: 'typeof newFood === "function"',
      inspect: (s) =>
        s.draws.some((d) => d.op === 'rect' && d.color === 'orange' && d.x === 160 && d.y === 120),
    },
  },
  {
    title: 'Snake 5 · Veks og samlar poeng',
    goal: 'Når hovudet treff maten, skal slangen vekse, få eitt poeng og få ny mat.',
    explain:
      'Legg til score og same. I step reknar du først ut eating med same(head, food). Legg alltid til hovudet. Fjern halen berre når slangen ikkje et. Når han et, aukar score og newFood blir kalla.',
    term: ['Forgrening', 'Eit val der programmet gjer ulike ting, her et eller et ikkje.'],
    hints: [
      'Sjekk treff før du endrar kroppen.',
      'Flytt snake.pop() inn i ei else-grein.',
      'I eating-greina: score += 1; newFood(); Vis score i drawGame.',
    ],
    why: 'Når halen får bli medan eit nytt hovud blir lagt til, veks kroppen med éi rute. Mat og poeng blir oppdaterte i same regel.',
    extra: 'Vis slangelengda saman med poenga.',
    check: {
      steps: [{ tick: 160 }, { tick: 160 }, { tick: 160 }],
      expression: 'score === 1 && snake.length === 4',
    },
  },
  {
    title: 'Snake 6 · Veggar og eigen kropp',
    goal: 'Avslutt spelet ved treff i vegg eller kropp, og vis Game over.',
    explain:
      'Sjekk det nye hovudet før du legg det til. Den gyldige bana er x = 0–23 og y = 2–13. Når slangen ikkje et, flyttar halen seg bort i same steg. Derfor kan sjekken bruke snake.slice(0, -1), som er kroppen utan halen.',
    term: [
      'slice',
      'Lagar ein kopi av ein del av ei liste. slice(0, -1) tek med alt utan det siste elementet.',
    ],
    hints: [
      'Bruk over som ein boolsk variabel. Start step med if (over) { return; }.',
      'Test vegggrensene og body.some(...) før snake.unshift.',
      'Ved treff: set over = true, kall drawGame og return. Teikn Game over når over er sann.',
    ],
    why: 'Kontrollen skjer før flyttinga. Å utelate halen når han flyttar seg, gjer lovlege svingar inn i den gamle haleruta moglege.',
    extra: 'Lag ei eiga melding for veggtreff og kroppstreff.',
    check: {
      steps: Array.from({ length: 25 }, () => ({ tick: 160 })),
      expression: 'over === true',
      inspect: (s) => s.draws.some((d) => d.op === 'text' && d.text === 'Game over'),
    },
  },
  {
    title: 'Snake 7 · Pause og ein ny sjanse',
    goal: 'La mellomrom pause spelet og R starte eit nytt spel med null poeng.',
    explain:
      'Lag restart som set alle spelverdiane tilbake til start. I onKey handterer du R og mellomrom før vanleg styring. step skal returnere tidleg ved pause. Start ikkje ein ekstra every ved omstart: den gamle køyreramma finst framleis.',
    term: [
      'Tidleg retur',
      'return avsluttar funksjonen med ein gong. Det passar når spelet er pausa eller ferdig.',
    ],
    hints: [
      'Nullstill kropp, retning, poeng, mat, over, paused og turned i restart.',
      'Kall restart ved r eller R og return etterpå.',
      'Ved mellomrom: paused = !paused. Start step med if (over || paused) { return; }.',
    ],
    why: 'Omstart endrar tilstanden, men lagar ikkje fleire tidsfunksjonar. Derfor får spelet same fart etter kvar omstart.',
    extra: 'Teikn ei kort forklaring av pausestyringa på scena.',
    check: {
      steps: [
        { tick: 160 },
        { event: { type: 'keydown', key: ' ', id: 'document' } },
        { tick: 160 },
        { event: { type: 'keydown', key: 'r', id: 'document' } },
      ],
      expression: 'score === 0 && snake.length === 3 && snake[0].x === 5 && !paused && !over',
    },
  },
  {
    title: 'Snake 8 · Test, forklar og eksporter',
    goal: 'Fullfør spelet med synlege kontrollar. Test poeng, pause, veggtreff og omstart, og last ned spelet.',
    explain:
      'Program som verkar éin gong er ikkje ferdig prøvde. Skriv ned kva du forventar, prøv det, og samanlikn. Eksporten inneheld din kode og hjelpefilene som teiknar og held tida. Spelreglane ligg framleis i koden du har skrive.',
    term: [
      'Testtilfelle',
      'Ei bestemt handling med eit forventa resultat, til dømes R etter spelslutt gir null poeng.',
    ],
    hints: [
      'Legg ei tekstlinje nedst i drawGame med piler, mellomrom og R.',
      'Test kvar regel separat og noter kva som skjedde.',
      'Bruk Last ned. Pakk ut ZIP-fila, opne index.html og prøv spelet der òg.',
    ],
    why: 'Spelet har eigne funksjonar for teikning, reglar, mat og omstart. Det gjer det lettare å finne feil og lage nye variantar.',
    extra: 'Lag di eiga utgåve: nye fargar, bonusmat eller valbar fart. Endre éin ting om gongen.',
    self: 'Vis ein medelev korleis ein spelar. Test mat, vegg, kropp, pause og omstart. Forklar kvifor halen får bli når slangen et.',
    check: {
      steps: [{ tick: 160 }, { tick: 160 }, { tick: 160 }],
      expression: 'score === 1 && snake.length === 4',
      inspect: (s) => s.draws.some((d) => d.op === 'text' && d.text.includes('omstart')),
    },
  },
];
export const snake = make(
  'snake',
  rows.map((r, i) => ({
    ...r,
    start: r.start ?? snakeCode(i),
    solution: snakeCode(i + 1),
    projectKey: 'snake',
    example: i === 0 ? 'rect(part.x * 20, part.y * 20, 18, 18, "lime");' : undefined,
  })),
);
export const project = make(
  'project',
  [
    {
      title: 'Vel ein idé du vil byggje',
      goal: 'Skriv ein enkel prosjektplan med målgruppe, tre funksjonar og ei skisse i forklaringsfeltet.',
      explain:
        'Vel eit lite spel, ein quiz eller ei nettside. Start med noko du kan forklare med éi setning. Du kan bruke HTML, CSS og JavaScript i dette prosjektet. Alle fire oppdraga deler koden din.',
      term: ['Prototype', 'Ei enkel første utgåve som prøver hovudideen.'],
      start: '// Mitt prosjekt. Start med noko lite du kan sjå.\n',
      solution: 'text("Min idé: eit skattesøk", 70, 150);',
      hints: [
        'Tenk på noko du sjølv liker, og vel éin ting brukaren skal gjere.',
        'Skriv: Eg vil lage … for …, slik at dei kan …',
        'Vel tre små funksjonar. Marker éin du vil byggje først.',
      ],
      why: 'Ein liten plan gir retning utan å låse deg. Skissa hjelper deg å velje kva som er viktigast i første utgåve.',
      extra: 'Spør ein medelev kva dei ville ha prøvd først.',
      self: 'Kan du forklare ideen, kven han er for, og kva du skal byggje først?',
      check: { manual: true },
    },
    {
      title: 'Bygg den første spelbare ideen',
      goal: 'Lag éi handling som gir eit synleg resultat, og forklar korleis ho verkar.',
      explain:
        'Bygg den minste delen av planen først. Det kan vere ein knapp som endrar tekst, ein figur som flyttar seg, eller eit spørsmål som får svar. Køyr ofte og endre lite om gongen.',
      term: ['Iterasjon', 'Ei ny runde der du byggjer, prøver og forbetrar.'],
      start: '',
      solution:
        'let x = 100;\nonKey(function(tast) {\n  if (tast === "ArrowRight") { x += 20; }\n  clear(); circle(x, 160, 25, "orange");\n});\ncircle(x, 160, 25, "orange");',
      hints: [
        'Vel den første funksjonen frå planen din.',
        'Finn eit liknande døme i ein tidlegare modul.',
        'Få først éi handling til å verke, før du legg til pynt og fleire reglar.',
      ],
      why: 'Dømet gjer éin ting: pil høgre flyttar skatten. Ein fungerande liten del er lettare å byggje vidare på enn mange halvferdige delar.',
      extra: 'Gjer handlinga tydelegare med tekst eller farge.',
      self: 'Kan ein annan person bruke den første funksjonen utan at du peikar ut alt?',
      check: { manual: true },
    },
    {
      title: 'Prøv ideen saman med ein annan',
      goal: 'Skriv tre testtilfelle, prøv dei og rett minst eitt problem eller ei uklar forklaring.',
      explain:
        'Sjå etter både kodefeil og ting som er vanskelege å forstå. Be ein medelev prøve utan hjelp først. Noter kva du såg, kva du endra, og kva som skjedde etter endringa.',
      term: ['Brukartest', 'Å sjå korleis nokon bruker det du har laga, for å finne hinder.'],
      start: '',
      solution:
        'let x = 100;\ntext("Pil høgre flyttar skatten", 50, 40);\nonKey(function(tast) {\n  if (tast === "ArrowRight" && x < 440) { x += 20; }\n  clear(); text("Pil høgre flyttar skatten", 50, 40);\n  circle(x, 160, 25, "orange");\n});',
      hints: [
        'Prøv normal bruk, ein kantverdi og ei uventa handling.',
        'Døme: trykk rett tast, hald fram til kanten, trykk feil tast.',
        'Skriv Forventa / Observert / Endring for kvart testtilfelle.',
      ],
      why: 'Dømet legg til forklaring og ei grense. Tilbakemelding frå prøvinga gir grunn til ei konkret endring.',
      extra: 'Prøv berre tastatur og 200 prosent forstørring.',
      self: 'Kva gjorde testpersonen som du ikkje hadde tenkt på, og kva endra du etterpå?',
      check: { manual: true },
    },
    {
      title: 'Vis fram det du har skapt',
      goal: 'Presenter prosjektet, forklar ei kodeendring og last ned ein kopi du kan ta vare på.',
      explain:
        'Ei god framvising viser både resultatet og tankegangen. Fortel kva du ville lage, kva som verkar, og kva du ville prøvd vidare. Nedlasting deler ikkje prosjektet offentleg.',
      term: [
        'Dokumentasjon',
        'Forklaringar som hjelper deg sjølv og andre å forstå og bruke programmet.',
      ],
      start: '',
      solution:
        'text("Skattesøk — laga av meg", 70, 130);\ntext("Neste idé: fleire nivå", 70, 180);',
      hints: [
        'Vel éi kodeblokk du forstår godt.',
        'Forklar kva ho gjer, og føresjå kva ei lita endring vil gjere.',
        'Last ned prosjektet. Presenter òg kva som enno ikkje er ferdig.',
      ],
      why: 'Dømet er ei enkel tittelscene. Din eigen presentasjon skal vise ditt prosjekt og di forståing, ikkje vere lik dømet.',
      extra: 'Lag ei liste med tre vidare idear, og vel kva du ville gjort først.',
      self: 'Kan du forklare prosjektet og éi viktig kodeblokk med eigne ord?',
      check: { manual: true },
    },
  ].map((r) => ({ ...r, projectKey: 'my-project' })),
  'mixed',
);
