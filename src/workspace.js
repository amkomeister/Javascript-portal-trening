import { EditorView, basicSetup as baseSetup } from 'codemirror';
import { syntaxHighlighting, HighlightStyle } from '@codemirror/language';
import { tags } from '@lezer/highlight';
import { javascript } from '@codemirror/lang-javascript';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { Draft } from './draft.js';
import { Runner } from './runtime/runner.js';
import { sanitizeMarkup, previewDocument, drawFrame } from './runtime/preview.js';
import { checkMarkup } from './runtime/check.js';
import { exportProject, exportCopy } from './export.js';
import { modules, lessons } from './content/curriculum.js';
import { esc, $, choice, message, safeAction } from './ui.js';
const defaults = (lesson) => ({
  files: structuredClone(lesson.starter),
  title: lesson.title,
  reflection: '',
  support: 'standard',
  hints: 0,
  selfChecked: false,
  autoPassed: false,
});
const labels = { js: 'JavaScript', html: 'HTML', css: 'CSS' };
const basicSetup = [
  baseSetup,
  syntaxHighlighting(
    HighlightStyle.define([
      { tag: tags.keyword, color: '#bdc7ff' },
      { tag: [tags.string, tags.number, tags.bool], color: '#d2ed91' },
      { tag: [tags.comment], color: '#a7bac7' },
      { tag: [tags.tagName, tags.attributeName, tags.propertyName], color: '#8fdbeb' },
      { tag: tags.variableName, color: '#eef3f8' },
    ]),
  ),
];
export async function openWorkspace(root, lesson, { api, user, onBack, onNext }) {
  const module = modules.find((m) => m.id === lesson.module),
    siblings = lessons.filter((l) => l.module === lesson.module);
  const [saved, project, reviews] = await Promise.all([
    api('/api/progress/' + lesson.id),
    lesson.projectKey ? api('/api/projects/' + lesson.projectKey) : null,
    api('/api/reviews'),
  ]);
  const record = { ...saved, data: saved.data || defaults(lesson) };
  if (project?.data) record.data.files = structuredClone(project.data.files);
  let editor,
    activeFile = lesson.module === 'web' ? 'html' : 'js',
    disposed = false,
    files = structuredClone(record.data.files),
    codeVersion = 0,
    checker,
    checkTimeout,
    frameToken,
    previewReady = false,
    latestFrame,
    undo;
  const statuses = new Map(),
    drafts = [];
  const draft = new Draft(
    (payload) => api('/api/progress/' + lesson.id, 'PUT', payload),
    record,
    (s, e) => status('progress', s, e),
  );
  drafts.push(draft);
  const projectDraft = project
    ? new Draft(
        (payload) => api('/api/projects/' + lesson.projectKey, 'PUT', payload),
        { ...project, data: project.data || defaults(lesson) },
        (s, e) => status('project', s, e),
      )
    : null;
  if (projectDraft) drafts.unshift(projectDraft);
  root.className = 'workspace-page';
  root.innerHTML =
    '<div class="workspace-heading"><div><button class="back" id="back-module">← ' +
    esc(module.title) +
    '</button><h1>' +
    esc(lesson.title) +
    '</h1></div><div class="workspace-meta"><span class="pill">Oppdrag ' +
    lesson.number +
    ' av ' +
    siblings.length +
    '</span><span id="save-status" class="save-status" role="status">Lagra</span></div></div><div id="save-warning" class="save-warning" hidden><p id="save-detail"></p><button id="retry-save">Prøv lagring igjen</button><button id="resolve-conflict" hidden>Sjå begge versjonane</button><button id="offline-copy">Last ned kodekopi utan nett</button></div><div class="workbench"><aside class="task-panel"><div class="task-title"><span class="eyebrow">01 / OPPDRAGET</span><span class="tiny-mark" aria-hidden="true">✳</span></div><p class="goal">' +
    esc(lesson.goal) +
    '</p>' +
    (lesson.projectKey
      ? '<p class="project-note">Dette er same prosjekt gjennom heile modulen. Koden din følgjer med til neste oppdrag.</p>'
      : '') +
    '<label class="support-label">Kor mykje støtte vil du ha?<select id="support"><option value="help">Meir hjelp</option><option value="standard">Vanleg oppgåve</option><option value="challenge">Ekstra utfordring</option></select></label><p>' +
    esc(lesson.explain) +
    '</p><div id="extra-help" hidden><h2>Ta eitt grep om gongen</h2><ol><li>Les koden og gjett kva han gjer.</li><li>Endre éin ting frå målet ovanfor.</li><li>Køyr, sjå resultatet og forklar skilnaden.</li></ol></div><details class="glossary" open><summary>Nye ord, enkelt forklart</summary><dl>' +
    Object.entries(lesson.glossary)
      .map(([k, v]) => '<dt>' + esc(k) + '</dt><dd>' + esc(v) + '</dd>')
      .join('') +
    '</dl></details><details><summary>Eit lite døme</summary><pre>' +
    esc(lesson.example) +
    '</pre></details><div class="hint-box"><button id="hint">Eitt hint, takk <span aria-hidden="true">↗</span></button><ol id="hints"></ol><p id="hint-count" class="quiet"></p></div><details id="extension"><summary>Prøv noko ekstra</summary><p>' +
    esc(lesson.extension) +
    '</p></details><details class="solution"><summary>Vis ei forklart løysing</summary><p>Prøv sjølv først om du vil. Dette er eitt mogleg svar; di løysing kan vere annleis.</p>' +
    Object.entries(lesson.solution)
      .filter(([, v]) => v)
      .map(([k, v]) => '<h3>' + labels[k] + '</h3><pre>' + esc(v) + '</pre>')
      .join('') +
    '<p>' +
    esc(lesson.solutionExplanation) +
    '</p></details></aside><section class="code-panel" aria-label="Kodearbeidsflate"><div class="panel-top"><span class="eyebrow">02 / KODEN DIN</span><button id="code-help" class="text-button">Kodehjelp</button></div><div class="file-tabs" role="tablist" aria-label="Kodefiler">' +
    (lesson.mode === 'draw' ? ['js'] : ['html', 'css', 'js'])
      .map(
        (k) =>
          '<button role="tab" id="tab-' +
          k +
          '" aria-controls="editor" data-file="' +
          k +
          '">' +
          labels[k] +
          '</button>',
      )
      .join('') +
    '</div><div id="editor" role="tabpanel" aria-labelledby="tab-' +
    activeFile +
    '"></div><div class="run-toolbar"><button class="primary" id="run">▶ Køyr koden</button><button id="stop">■ Stopp</button><button id="reset" class="text-button">Start på nytt</button><button id="undo-reset" hidden>Angre</button></div><div class="editor-foot"><span>Tab flyttar fokus ut av editoren.</span><span>Ekte kode. Plass til å prøve.</span></div><div class="file-actions"><button id="export">↓ Last ned prosjekt</button><button id="copy">Kodekopi</button><button id="import">Hent kodekopi</button><input type="file" id="import-file" accept="application/json,.json" hidden></div></section><section class="result-panel" aria-label="Resultatet av koden"><div class="panel-top"><span class="eyebrow">03 / SJÅ KVA DU LAGA</span><span id="run-status" role="status">Klar</span></div>' +
    (lesson.mode === 'mixed'
      ? '<label class="result-choice">Vis resultat som<select id="result-kind"><option value="draw">Teikning / spel</option><option value="web">Nettside</option></select></label>'
      : '') +
    '<div class="preview-wrap"><canvas id="scene" width="480" height="320" tabindex="0" aria-label="Spelscene. Klikk her eller bruk Tab for å styre med tastaturet."></canvas><iframe id="preview" sandbox="allow-scripts" title="Førehandsvising av nettsida di" hidden></iframe><div id="preview-placeholder"><span aria-hidden="true">↗</span><p>Ideen din kjem til live her.</p><small>Trykk Køyr koden for å sjå resultatet.</small></div></div><p class="preview-tip">' +
    (lesson.mode === 'web'
      ? 'Trykk på knappar og felt i nettsida for å prøve dei.'
      : 'Klikk på scena eller bruk Tab før du styrer med tastaturet.') +
    '</p><pre id="runtime-error" class="runtime-error" role="alert" hidden></pre><details class="console"><summary>Utskrift frå print / console.log</summary><pre id="console-output">Inga utskrift enno.</pre></details><div class="auto-check"><h2>Automatisk kodesjekk</h2><p id="auto-result" role="status">' +
    (draft.data.autoPassed
      ? 'Siste kodesjekk består.'
      : lesson.check.manual
        ? 'Dette opne prosjektet blir vurdert gjennom eigensjekk og lærarsamtale.'
        : 'Prøv koden, og sjekk om han gjer det oppdraget ber om.') +
    '</p><button id="check">Sjekk koden</button><p class="fine">Sjekken prøver nokre eigenskapar ved koden. Han vurderer ikkje forståinga di.</p></div></section></div><section class="reflection-panel"><div><p class="eyebrow">04 / KVA OPPDAGA DU?</p><h2>Gjer kunnskapen til di eiga.</h2><p>' +
    esc(lesson.selfCheck) +
    '</p><label class="checkbox"><input id="self-check" type="checkbox" ' +
    (draft.data.selfChecked ? 'checked' : '') +
    '> Eg har prøvd eigensjekken og kan forklare endringa.</label></div><div><label for="reflection">Mi forklaring</label><textarea id="reflection" maxlength="5000" rows="4" placeholder="Eg endra … Då skjedde … fordi …">' +
    esc(draft.data.reflection) +
    '</textarea><p class="fine">Bruk eigne ord. Forklaringa blir lagra saman med arbeidet.</p></div></section><section class="teacher-feedback"><h2>Læraren si tilbakemelding</h2>' +
    reviews.records
      .filter((r) => r.lessonId === lesson.id)
      .map((r) => '<p class="preserve">' + esc(r.note) + '</p>')
      .join('') +
    (reviews.records.some((r) => r.lessonId === lesson.id)
      ? ''
      : '<p>Ingen lærarvurdering enno. Eigensjekk og kodesjekk står kvar for seg.</p>') +
    '</section><div class="lesson-nav"><button id="back-bottom">← Til oppdraga</button>' +
    (siblings[lesson.number]
      ? '<button class="primary" id="next">Neste oppdrag →</button>'
      : '<span>Du kan gå tilbake og utforske alle oppdraga.</span>') +
    '</div>';
  const canvas = $('#scene', root),
    iframe = $('#preview', root);
  $('#run', root).setAttribute('aria-label', 'Køyr koden');
  $('#stop', root).setAttribute('aria-label', 'Stopp');
  function resultKind() {
    return lesson.mode === 'mixed'
      ? $('#result-kind', root).value
      : lesson.mode === 'web'
        ? 'web'
        : 'draw';
  }
  function displaySupport() {
    const support = draft.data.support;
    $('#support', root).value = support;
    $('#extra-help', root).hidden = support !== 'help';
    $('#extension', root).open = support === 'challenge';
  }
  function hints() {
    const count = draft.data.hints || 0;
    $('#hints', root).innerHTML = lesson.hints
      .slice(0, count)
      .map((h) => '<li>' + esc(h) + '</li>')
      .join('');
    $('#hint-count', root).textContent = count + ' av 3 hint viste';
    $('#hint', root).disabled = count >= 3;
  }
  function status(key, value, error) {
    statuses.set(key, value);
    if (disposed || !$('#save-status', root)) return;
    const s = [...statuses.values()];
    const worst = s.includes('conflict')
      ? 'conflict'
      : s.includes('error')
        ? 'error'
        : s.includes('saving')
          ? 'saving'
          : s.includes('pending')
            ? 'pending'
            : 'saved';
    $('#save-status', root).textContent = {
      conflict: 'Lagringskonflikt',
      error: 'Ikkje lagra',
      saving: 'Lagrar …',
      pending: 'Ventar på lagring',
      saved: 'Lagra',
    }[worst];
    $('#save-status', root).dataset.state = worst;
    $('#save-warning', root).hidden = !['error', 'conflict'].includes(worst);
    $('#save-detail', root).textContent =
      worst === 'conflict'
        ? 'Ei anna fane eller maskin har endra dette arbeidet. Begge versjonane er tekne vare på. Vel kva du vil arbeide vidare med.'
        : error?.message ||
          'Koden er bevart her. Hald fana open, prøv lagring igjen eller last ned ein kodekopi.';
    $('#resolve-conflict', root).hidden = worst !== 'conflict';
    $('#retry-save', root).hidden = worst === 'conflict';
  }
  function update(change) {
    draft.update(change);
    if (change.files && projectDraft)
      projectDraft.update({ files: change.files, autoPassed: false, selfChecked: false });
  }
  function cancelCheck() {
    checker?.terminate();
    checker = null;
    clearTimeout(checkTimeout);
    $('#check', root).disabled = false;
  }
  function codeChanged() {
    codeVersion++;
    cancelCheck();
    update({ files, autoPassed: false, selfChecked: false });
    $('#self-check', root).checked = false;
    $('#auto-result', root).textContent = 'Koden er endra. Køyr ein ny sjekk når du er klar.';
  }
  function showEditor(key) {
    editor?.destroy();
    activeFile = key;
    const language = { js: javascript, html, css }[key];
    $('#editor', root).setAttribute('aria-labelledby', 'tab-' + key);
    root.querySelectorAll('[data-file]').forEach((b) => {
      b.setAttribute('aria-selected', String(b.dataset.file === key));
      b.tabIndex = b.dataset.file === key ? 0 : -1;
    });
    editor = new EditorView({
      doc: files[key],
      parent: $('#editor', root),
      extensions: [
        basicSetup,
        language(),
        EditorView.lineWrapping,
        EditorView.contentAttributes.of({ 'aria-label': 'Kodeeditor ' + labels[key] }),
        EditorView.updateListener.of((updateView) => {
          if (updateView.docChanged) {
            files[activeFile] = updateView.state.doc.toString();
            codeChanged();
          }
        }),
        EditorView.theme(
          {
            '&': {
              fontSize: '14px',
              height: '430px',
              backgroundColor: '#182b38',
              color: '#eef3f8',
            },
            '.cm-content': {
              fontFamily: '"JetBrains Mono", monospace',
              caretColor: '#cbef57',
              padding: '20px 0',
            },
            '.cm-scroller': { overflow: 'auto' },
            '.cm-gutters': { backgroundColor: '#182b38', color: '#91a6b4', border: 'none' },
            '.cm-activeLine': { backgroundColor: '#233c4d' },
            '.cm-activeLineGutter': { backgroundColor: '#233c4d' },
            '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection': {
              backgroundColor: '#345473',
            },
            '.cm-cursor': { borderLeftColor: '#cbef57' },
            '.cm-panels': { backgroundColor: '#fff', color: '#172b37' },
          },
          { dark: true },
        ),
      ],
    });
  }
  const runner = new Runner((state) => {
    if (disposed || !root.isConnected) return;
    latestFrame = state;
    drawFrame(canvas, state);
    if (previewReady && iframe.contentWindow)
      iframe.contentWindow.postMessage({ type: 'render', token: frameToken, dom: state.dom }, '*');
    $('#console-output', root).textContent = state.logs.join('\n') || 'Inga utskrift enno.';
    $('#runtime-error', root).hidden = !state.error;
    $('#runtime-error', root).textContent = state.error || '';
    $('#run-status', root).textContent = state.error ? 'Stoppa med feilmelding' : 'Køyrer';
  });
  function stop() {
    runner.stop();
    $('#run-status', root).textContent = 'Stoppa';
  }
  function run() {
    const clean = sanitizeMarkup(files.html);
    frameToken = crypto.randomUUID();
    previewReady = false;
    latestFrame = null;
    iframe.srcdoc = previewDocument(clean.html, files.css, frameToken);
    iframe.hidden = resultKind() !== 'web';
    canvas.hidden = resultKind() === 'web';
    $('#preview-placeholder', root).hidden = true;
    $('#runtime-error', root).hidden = true;
    $('#run-status', root).textContent = 'Startar …';
    runner.start(files.js, clean.dom);
  }
  const receive = (e) => {
    if (disposed || e.source !== iframe.contentWindow || e.data?.token !== frameToken) return;
    if (e.data.type === 'ready') {
      previewReady = true;
      if (latestFrame)
        iframe.contentWindow.postMessage(
          { type: 'render', token: frameToken, dom: latestFrame.dom },
          '*',
        );
    }
    if (e.data.type === 'event') runner.event(e.data.event);
  };
  window.addEventListener('message', receive);
  canvas.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key))
      e.preventDefault();
    if (e.key === 'Tab') return;
    runner.event({ type: 'keydown', id: 'document', key: e.key });
  });
  async function flush() {
    for (const d of drafts) await d.flush();
  }
  function replace(data) {
    stop();
    files = structuredClone(data.files);
    draft.update({ ...data, autoPassed: false, selfChecked: false });
    if (projectDraft) projectDraft.update({ files, autoPassed: false, selfChecked: false });
    $('#reflection', root).value = draft.data.reflection;
    $('#self-check', root).checked = false;
    displaySupport();
    hints();
    showEditor(activeFile);
    codeVersion++;
    cancelCheck();
    $('#auto-result', root).textContent = 'Koden er endra. Køyr ein ny sjekk når du er klar.';
  }
  $('#back-module', root).onclick = safeAction(onBack);
  $('#back-bottom', root).onclick = safeAction(onBack);
  if ($('#next', root))
    $('#next', root).onclick = safeAction(() => onNext(siblings[lesson.number].id));
  root.querySelectorAll('[data-file]').forEach((b) => {
    b.onclick = () => showEditor(b.dataset.file);
    b.onkeydown = (e) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
      e.preventDefault();
      const tabs = [...root.querySelectorAll('[data-file]')],
        i = tabs.indexOf(b);
      const next =
        e.key === 'Home'
          ? 0
          : e.key === 'End'
            ? tabs.length - 1
            : (i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      showEditor(tabs[next].dataset.file);
      tabs[next].focus();
    };
  });
  $('#run', root).onclick = run;
  $('#stop', root).onclick = stop;
  if ($('#result-kind', root)) $('#result-kind', root).onchange = run;
  $('#support', root).onchange = (e) => {
    update({ support: e.target.value });
    displaySupport();
  };
  $('#hint', root).onclick = () => {
    update({ hints: Math.min(3, (draft.data.hints || 0) + 1) });
    hints();
  };
  $('#reflection', root).oninput = (e) => update({ reflection: e.target.value });
  $('#self-check', root).onchange = (e) => update({ selfChecked: e.target.checked });
  $('#retry-save', root).onclick = safeAction(flush);
  for (const id of ['copy', 'offline-copy'])
    $('#' + id, root).onclick = () => exportCopy({ ...draft.data, files }, lesson.id);
  $('#export', root).onclick = safeAction(() =>
    exportProject({ ...draft.data, files }, lesson.projectKey || lesson.id),
  );
  $('#reset', root).onclick = safeAction(async () => {
    const answer = await choice(
      'Ta vare på arbeidet først',
      '<p>Du får ein nedlasta kodekopi før startkoden blir sett inn. Du kan også angre så lenge dette oppdraget er ope.</p>',
      [
        ['cancel', 'Hald fram med min kode'],
        ['reset', 'Last ned og start på nytt'],
      ],
    );
    if (answer !== 'reset') return;
    undo = structuredClone({ ...draft.data, files });
    exportCopy(undo, lesson.id + '-før-tilbakestilling');
    replace({ ...draft.data, files: lesson.starter });
    $('#undo-reset', root).hidden = false;
  });
  $('#undo-reset', root).onclick = () => {
    if (undo) replace(undo);
    undo = null;
    $('#undo-reset', root).hidden = true;
  };
  $('#import', root).onclick = () => $('#import-file', root).click();
  $('#import-file', root).onchange = safeAction(async (e) => {
    const f = e.target.files[0];
    e.target.value = '';
    if (!f) return;
    if (f.size > 500000) throw Error('Kodekopien er for stor.');
    const copy = JSON.parse(await f.text());
    if (
      copy.format !== 'kodeverkstad-skule-project' ||
      copy.version !== 1 ||
      !['html', 'css', 'js'].every(
        (k) => typeof copy.data?.files?.[k] === 'string' && copy.data.files[k].length <= 100000,
      )
    )
      throw Error('Dette er ikkje ein støtta kodekopi.');
    const answer = await choice(
      'Hente denne kodekopien?',
      '<p>Den opne koden blir først lasta ned som ein eigen kopi. Kodesjekk og eigensjekk blir nullstilte.</p>',
      [
        ['cancel', 'Avbryt'],
        ['import', 'Ta kopi og hent inn'],
      ],
    );
    if (answer === 'import') {
      exportCopy({ ...draft.data, files }, lesson.id + '-før-import');
      replace({
        ...draft.data,
        files: copy.data.files,
        reflection: String(copy.data.reflection || '').slice(0, 5000),
      });
    }
  });
  $('#resolve-conflict', root).onclick = safeAction(async () => {
    for (const d of drafts.filter((d) => d.conflict)) {
      const other = d.conflict.current || { revision: 0, data: defaults(lesson) };
      const answer = await choice(
        'To versjonar av arbeidet',
        '<p>Di opne utgåve og den andre utgåva er bevarte på serveren. Last gjerne ned begge før du vel.</p><details><summary>Mi utgåve</summary><pre>' +
          esc(JSON.stringify(d.data.files, null, 2)) +
          '</pre></details><details><summary>Utgåva frå den andre fana</summary><pre>' +
          esc(JSON.stringify(other.data.files, null, 2)) +
          '</pre></details>',
        [
          ['cancel', 'Avbryt'],
          ['download', 'Last ned begge'],
          ['other', 'Bruk den andre'],
          ['mine', 'Lagre mi utgåve vidare'],
        ],
      );
      if (answer === 'download') {
        exportCopy(d.data, lesson.id + '-mi-utgåve');
        exportCopy(other.data, lesson.id + '-anna-utgåve');
        return;
      }
      if (!['mine', 'other'].includes(answer)) return;
      d.resolve(other, answer === 'mine');
      files = structuredClone(d.data.files);
      if (d === projectDraft) draft.update({ files, autoPassed: false, selfChecked: false });
      else if (projectDraft) projectDraft.update({ files });
      showEditor(activeFile);
      $('#reflection', root).value = draft.data.reflection;
      displaySupport();
      hints();
    }
    await flush();
  });
  $('#check', root).onclick = () => {
    cancelCheck();
    const version = codeVersion,
      clean = sanitizeMarkup(files.html);
    const markupPassed = checkMarkup(lesson, files);
    checker = new Worker(new URL('./runtime/worker.js', import.meta.url), { type: 'module' });
    $('#check', root).disabled = true;
    $('#auto-result', root).textContent = 'Prøver koden …';
    checkTimeout = setTimeout(() => {
      cancelCheck();
      $('#auto-result', root).textContent = 'Sjekken blei stoppa. Koden brukte for lang tid.';
    }, 12000);
    checker.onmessage = ({ data: m }) => {
      if (m.type !== 'checked' || disposed || version !== codeVersion) return;
      cancelCheck();
      const result = m.result;
      $('#auto-result', root).textContent = result.error
        ? 'Sjekken stoppa: ' + result.error
        : result.passed === null
          ? 'Koden køyrer. Bruk eigensjekken og vis prosjektet til læraren.'
          : result.passed
            ? 'Sjekken består! Prøv eigensjekken og forklar endringa.'
            : 'Ikkje heilt enno. Les målet, sjå resultatet og prøv eitt hint.';
      update({ autoPassed: result.passed === true });
    };
    checker.onerror = () => {
      cancelCheck();
      $('#auto-result', root).textContent = 'Sjekken kunne ikkje starte. Koden din er bevart.';
    };
    checker.postMessage({
      type: 'check',
      lessonId: lesson.id,
      files: structuredClone(files),
      dom: clean.dom,
      markupPassed,
    });
  };
  $('#code-help', root).onclick = () =>
    choice(
      'Kodehjelp i verkstaden',
      '<p>Dette er ekte JavaScript med nokre hjelpefunksjonar. Scena er 480 × 320 punkt. x går mot høgre, y nedover.</p><pre>clear(farge)\nrect(x, y, breidd, høgd, farge)\ncircle(x, y, radius, farge)\ntext(tekst, x, y, farge, storleik)\nprint(verdi)\nrandom(øvreGrense)\nmillis()\nevery(millisekund, funksjon)\nafter(millisekund, funksjon)\ncancel(tidsfunksjonId)\nonKey(function(tast) { … })</pre><p>Tidsfunksjonane tek minst 30 ms mellom steg. Tida er den simulerte køyringstida, ikkje ein presis klokke.</p><h3>Nettsider</h3><p>document.querySelector, querySelectorAll og getElementById finn element med #id, .klasse eller taggnamn. Du kan bruke textContent, value, classList.add/remove/toggle/contains, addEventListener og style.</p><p>Hendingar: click, input, change, keydown, keyup. Stilar: color, backgroundColor, display, fontSize, borderRadius, padding, width, height. input og knappar verkar inne i resultatfeltet.</p><p>Nettverk, innlogging, appdata, vilkårlege skript og innerHTML er ikkje tilgjengelege. Legg HTML-strukturen i HTML-fana. Dette utvalet gjer det mogleg å prøve kode trygt.</p>',
    );
  displaySupport();
  hints();
  showEditor(activeFile);
  if (!saved.data) draft.update({});
  if (project && !project.data) projectDraft.update({});
  return {
    flush,
    dirty: () => drafts.some((d) => d.dirty),
    dispose() {
      disposed = true;
      runner.stop();
      checker?.terminate();
      clearTimeout(checkTimeout);
      editor?.destroy();
      drafts.forEach((d) => d.dispose());
      window.removeEventListener('message', receive);
      iframe.srcdoc = '';
      root.className = '';
    },
  };
}
