import { make } from './helpers.js';
export const game = make('game', [
  {
    title: 'Samle poeng med mellomrom',
    goal: 'Lag eit spel som gir eitt poeng for kvart trykk på mellomrom.',
    explain:
      'Eit spel treng inndata, reglar og resultat. Her er inndata eit tastetrykk, regelen legg til eitt poeng, og text viser resultatet. La poeng liggje utanfor funksjonen, slik at verdien blir hugsa.',
    term: ['Spelregel', 'Kode som bestemmer kva ei handling fører til i spelet.'],
    start:
      'let poeng = 0;\nfunction teikn() { clear(); text("Poeng: " + poeng, 150, 160); }\nonKey(function(tast) {\n  // Gje poeng ved mellomrom.\n  teikn();\n});\nteikn();',
    solution:
      'let poeng = 0;\nfunction teikn() { clear(); text("Poeng: " + poeng, 150, 160); }\nonKey(function(tast) {\n  if (tast === " ") { poeng += 1; }\n  teikn();\n});\nteikn();',
    hints: [
      'Bruk if for å velje berre mellomrom.',
      'Auk poeng med éin inne i if.',
      'Skriv if (tast === " ") { poeng += 1; }',
    ],
    why: 'poeng endrast berre ved mellomrom, og teikn viser ny verdi. Andre tastar skal ikkje gi poeng.',
    extra: 'Gje ein bonus ved kvart femte poeng.',
    check: {
      steps: [
        { event: { type: 'keydown', key: ' ', id: 'document' } },
        { event: { type: 'keydown', key: 'x', id: 'document' } },
        { event: { type: 'keydown', key: ' ', id: 'document' } },
      ],
      inspect: (s) => s.draws.some((d) => d.op === 'text' && d.text === 'Poeng: 2'),
    },
  },
  {
    title: 'Ei skattekiste på tilfeldig stad',
    goal: 'Bruk random til å plassere skatten i ei av tolv ruter langs x-aksen.',
    explain:
      'random(12) er ei hjelpefunksjon som gir eit tilfeldig heiltal frå 0 til 11. Gonger vi med rutestorleiken 40, hamnar skatten på eit rutenett. Tilfeldige verdiar gjer spelet ulikt kvar gong.',
    term: [
      'Tilfeldig tal',
      'Eit tal valt av programmet innanfor ei grense. random(12) gir aldri 12.',
    ],
    start: 'const rute = 0;\nconst x = rute * 40;\nrect(x, 140, 30, 30, "orange");\nprint(rute);',
    solution:
      'const rute = random(12);\nconst x = rute * 40;\nrect(x, 140, 30, 30, "orange");\nprint(rute);',
    hints: [
      'Byt den faste nullen med eit funksjonskall.',
      'Du vil ha tolv moglege verdiar: 0–11.',
      'Skriv const rute = random(12);',
    ],
    why: 'random vel rutenummeret. Gonging med 40 gjer nummeret om til ein plass på scena. Kontroll sjekkar rutenettet; du må sjølv prøve fleire køyringar for å sjå variasjonen.',
    extra: 'Vel y på same måte. Kan skatten hamne utanfor scena?',
    check: {
      expression: 'Number.isInteger(rute) && rute >= 0 && rute < 12',
      inspect: (s) =>
        s.draws.some((d) => d.op === 'rect' && d.x >= 0 && d.x <= 440 && d.x % 40 === 0),
    },
    self: 'Køyr fleire gonger. Flyttar skatten seg mellom køyringane? Forklar kvifor random(12) stoppar på 11.',
  },
  {
    title: 'Sjekk om spelaren treff skatten',
    goal: 'Lag ein funksjon treff som returnerer true berre når to ruter har same x og y.',
    explain:
      'return sender eit svar tilbake frå ein funksjon. && betyr at begge vilkåra må vere sanne. To objekt kan vere ulike objekt, men likevel ha same koordinatar. Samanlikn eigenskapane deira.',
    term: ['Returverdi', 'Svaret ein funksjon gir tilbake med return.'],
    start:
      'function treff(a, b) {\n  return false;\n}\nconst spelar = { x: 3, y: 4 };\nconst skatt = { x: 3, y: 4 };\ntext(treff(spelar, skatt), 180, 160);',
    solution:
      'function treff(a, b) {\n  return a.x === b.x && a.y === b.y;\n}\nconst spelar = { x: 3, y: 4 };\nconst skatt = { x: 3, y: 4 };\ntext(treff(spelar, skatt), 180, 160);',
    hints: [
      'Begge koordinatane må vere like.',
      'Samanlikn a.x med b.x og a.y med b.y.',
      'Bruk return a.x === b.x && a.y === b.y;',
    ],
    why: 'Funksjonen svarar sant berre når begge samanlikningane er sanne. Svaret kan brukast vidare i if, tekst eller andre spelreglar.',
    extra: 'Lag eit spel som gir poeng ved treff, og flyttar skatten etterpå.',
    check: {
      expression:
        'treff({x:3,y:4},{x:3,y:4}) === true && treff({x:3,y:4},{x:3,y:5}) === false && treff({x:2,y:4},{x:3,y:4}) === false',
    },
  },
  {
    title: 'Test reaksjonen din',
    goal: 'Vis Vent først. Etter eitt sekund skal mellomrom vise reaksjonstida i millisekund.',
    explain:
      'after køyrer ein funksjon éin gong etter ei ventetid. millis gir tida sidan køyringa starta. Reaksjonstida er noverande tid minus tidspunktet då signalet kom. Dette er ei enkel øving, ikkje ei nøyaktig måling av reaksjonsevne.',
    term: ['Millisekund', 'Ein tusendel av eit sekund. 1000 millisekund er eitt sekund.'],
    start:
      'let klar = false;\nlet starttid = 0;\ntext("Vent", 180, 160);\nafter(1000, function() {\n  klar = true; starttid = millis();\n  clear(); text("Trykk!", 180, 160);\n});\nonKey(function(tast) {\n  // Vis millis() - starttid når klar er true.\n});',
    solution:
      'let klar = false;\nlet starttid = 0;\ntext("Vent", 180, 160);\nafter(1000, function() {\n  klar = true; starttid = millis();\n  clear(); text("Trykk!", 180, 160);\n});\nonKey(function(tast) {\n  if (tast === " " && klar) {\n    clear(); text(millis() - starttid, 180, 160);\n    klar = false;\n  }\n});',
    hints: [
      'Sjekk både at tast er mellomrom og at klar er true.',
      'Rekn ut millis() - starttid.',
      'Teikn resultatet og set klar = false så berre første trykk tel.',
    ],
    why: 'starttid blir lagra ved signalet. Eit seinare trykk trekkjer han frå tida no. Trykk før signalet blir ignorerte.',
    extra: 'Gje ei tydeleg melding om ein trykkjer for tidleg.',
    check: {
      steps: [
        { tick: 1000 },
        { tick: 200 },
        { event: { type: 'keydown', key: ' ', id: 'document' } },
      ],
      inspect: (s) => s.draws.some((d) => d.op === 'text' && d.text === '200'),
    },
  },
  {
    title: 'Liv og ein tydeleg spelslutt',
    goal: 'Start med tre liv. Kvar x-tast mistar eitt liv. Ved null skal spelet vise Game over.',
    explain:
      'Eit spel treng ein sluttregel. Sjekk liv > 0 før du trekkjer frå, slik at du ikkje får negative liv. Den same tilstanden avgjer kva tekst som skal visast.',
    term: [
      'Invariant',
      'Ein regel som alltid skal vere sann. Her skal liv aldri bli mindre enn null.',
    ],
    start:
      'let liv = 3;\nfunction teikn() {\n  clear(); text("Liv: " + liv, 170, 160);\n}\nonKey(function(tast) {\n  // Mist eitt liv ved x.\n  teikn();\n});\nteikn();',
    solution:
      'let liv = 3;\nfunction teikn() {\n  clear();\n  if (liv === 0) { text("Game over", 150, 160); }\n  else { text("Liv: " + liv, 170, 160); }\n}\nonKey(function(tast) {\n  if (tast === "x" && liv > 0) { liv -= 1; }\n  teikn();\n});\nteikn();',
    hints: [
      'Trekkinga skal berre skje når liv er større enn null.',
      'Bruk eit if/else-val i teikn.',
      'Ved liv === 0 viser du Game over; elles viser du talet på liv.',
    ],
    why: 'Regelen hindrar fleire tap etter spelslutt. Teikninga speglar tilstanden i staden for å endre spelreglane.',
    extra: 'Legg til r for å starte på nytt med tre liv.',
    check: {
      steps: Array.from({ length: 4 }, () => ({
        event: { type: 'keydown', key: 'x', id: 'document' },
      })),
      expression: 'liv === 0',
      inspect: (s) => s.draws.some((d) => d.op === 'text' && d.text === 'Game over'),
    },
  },
  {
    title: 'Flytt eit tog av ruter',
    goal: 'Legg eit nytt hovud først i lista og fjern siste rute, slik at toget flyttar seg.',
    explain:
      'Ei liste kan innehalde objekt. unshift legg eit element først, push legg sist, og pop fjernar det siste. for…of går gjennom verdiane i lista. some testar om minst éin verdi oppfyller eit vilkår. Desse grepa blir brukte i Snake.',
    term: [
      'Listemetode',
      'Ei handling på ei liste: unshift først, push sist, pop fjernar sist, some testar om noko passar.',
    ],
    start:
      'const tog = [{ x: 4, y: 6 }, { x: 3, y: 6 }, { x: 2, y: 6 }];\n// Legg til { x: 5, y: 6 } først og fjern siste rute.\nfor (const rute of tog) { rect(rute.x * 30, rute.y * 30, 28, 28, "blue"); }',
    solution:
      'const tog = [{ x: 4, y: 6 }, { x: 3, y: 6 }, { x: 2, y: 6 }];\ntog.unshift({ x: 5, y: 6 });\ntog.pop();\nfor (const rute of tog) { rect(rute.x * 30, rute.y * 30, 28, 28, "blue"); }',
    hints: [
      'Bruk tog.unshift før teikneløkka.',
      'Gi unshift det nye ruteobjektet.',
      'Skriv tog.unshift({ x: 5, y: 6 }); og deretter tog.pop();',
    ],
    why: 'Det nye hovudet kjem på plass 0. pop fjernar halen, så toget held same lengd. Utan pop ville toget ha vakse.',
    extra: 'Bruk tog.some(function(rute) { return rute.x === 5; }) og skriv ut svaret.',
    check: { expression: 'tog.length === 3 && tog[0].x === 5 && tog[2].x === 3' },
  },
]);
