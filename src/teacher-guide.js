import { $, esc } from './ui.js';

export const teacherGuideVersion = 1;
const steps = [
  {
    title: 'Velkomen til lærarrommet',
    text: 'Start gjerne med ei felles innføring. Etterpå arbeider elevane i sitt eige tempo. Alle åtte modulane er opne, uavhengig av trinn.',
    action:
      'Du opprettar grupper, godkjenner elevane og følgjer arbeidet deira her. Berre godkjende elevar i dine eigne grupper er synlege for deg.',
    example:
      'Første felles prøve: Endre fargen på roboten, køyr koden og forklar kva som endra seg.',
  },
  {
    title: 'Lag ei gruppe og del koden',
    text: 'Skriv til dømes «9A · Koding» i Gruppenamn og vel Opprett gruppe. Du kan lage fleire grupper.',
    action:
      'Del gruppekoden som står ved gruppa. Eleven loggar inn med skulekontoen sin, vel trinn og opnar Mine grupper → Be om å bli med.',
    example:
      'Gruppekoden er ei førespurnad om medlemskap. Han gir ikkje automatisk tilgang til elevarbeid.',
  },
  {
    title: 'Stadfest kven som er med',
    text: 'Vel Oppdater elevlistene når elevane har brukt koden. Kontroller namn og trinn før du trykkjer Godkjenn.',
    action:
      'Godkjende elevar får knappen Sjå arbeid i lista di. Fjern tilgang stengjer gruppetilgangen igjen; det slettar ikkje eleven sin kode eller framgang.',
    example: 'Ventar på godkjenning? Kontroller at eleven har brukt rett kode, og oppdater lista.',
  },
  {
    title: 'Les arbeidet og gi tilbakemelding',
    text: 'Vel Sjå arbeid og opne eit oppdrag. Her ser du koden, eleven si forklaring og dei lagra prosjekta. Eleven endrar sin eigen kode.',
    action:
      'Automatisk sjekk testar avgrensa delar av koden. Eigensjekk er eleven si vurdering. Lærarvurdering er di skriftlege tilbakemelding. Ingen av desse er automatisk ein karakter.',
    example:
      'Skriv ei konkret tilbakemelding og vel Lagre tilbakemelding. Eleven finn henne i det same oppdraget.',
  },
  {
    title: 'Hjelp eleven å finne neste steg',
    text: 'Be eleven lese koden og føreseie resultatet før køyring. Endre éin ting om gongen, prøv igjen og la eleven forklare endringa.',
    action:
      'Eleven kan byte mellom Meir hjelp, Vanleg oppgåve og Ekstra utfordring utan å miste koden. Bruk Hint for eitt konkret hint om gongen.',
    example:
      'Du kan demonstrere oppdraga frå Verkstaden med din eigen konto. Dine forsøk endrar ikkje elevane sitt arbeid.',
  },
  {
    title: 'Avslutt med arbeidet i behald',
    text: 'Elevkode blir lagra automatisk. Be eleven sjå etter Lagra før dei sluttar. Ved nettbrot: hald fana open og last ned ein kodekopi.',
    action:
      'Lærartilbakemeldingar blir lagra når du trykkjer Lagre tilbakemelding. Logg ut på delte maskiner. Kontroller alltid namnet øvst før neste person startar.',
    example:
      'Du finn denne innføringa att via Opne lærarguiden. No er du klar til å opprette den første gruppa.',
  },
];

export function openTeacherGuide({ complete, onClose }) {
  if ($('#teacher-guide')) return;
  const dialog = document.createElement('dialog');
  dialog.id = 'teacher-guide';
  dialog.className = 'dialog teacher-guide';
  dialog.setAttribute('aria-label', 'Lærarguiden');
  let index = 0,
    saving = false,
    completed = false;
  function render() {
    const step = steps[index];
    dialog.innerHTML = `<div class="guide-top"><span class="tag">LÆRARGUIDEN</span><span>Steg ${index + 1} av ${steps.length}</span></div>
      <progress max="${steps.length}" value="${index + 1}" aria-label="Framgang i lærarguiden"></progress>
      <h2 tabindex="-1">${esc(step.title)}</h2><p>${esc(step.text)}</p><p>${esc(step.action)}</p>
      <div class="guide-example">${esc(step.example)}</div><p class="guide-error" role="alert"></p>
      <div class="dialog-actions"><button data-later>Seinare</button>${index ? '<button data-back>Førre steg</button>' : ''}<button class="primary" data-next>${index === steps.length - 1 ? 'Fullfør innføringa' : 'Neste steg'}</button></div>`;
    $('[data-later]', dialog).onclick = () => dialog.close();
    if (index)
      $('[data-back]', dialog).onclick = () => {
        index--;
        render();
        $('h2', dialog).focus();
      };
    $('[data-next]', dialog).onclick = async () => {
      if (saving) return;
      if (index < steps.length - 1) {
        index++;
        render();
        $('h2', dialog).focus();
        return;
      }
      saving = true;
      dialog.querySelectorAll('button').forEach((b) => (b.disabled = true));
      try {
        await complete(teacherGuideVersion);
        completed = true;
        dialog.close();
      } catch (error) {
        $('.guide-error', dialog).textContent = error.message;
      } finally {
        saving = false;
        dialog.querySelectorAll('button').forEach((b) => (b.disabled = false));
      }
    };
  }
  dialog.addEventListener('cancel', (e) => {
    if (saving) e.preventDefault();
  });
  dialog.addEventListener(
    'close',
    () => {
      dialog.remove();
      onClose?.(completed);
    },
    { once: true },
  );
  render();
  document.body.append(dialog);
  dialog.showModal();
  $('h2', dialog).focus();
}
