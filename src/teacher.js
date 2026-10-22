import { esc, $, choice, safeAction } from './ui.js';
import { lessons } from './content/curriculum.js';
export async function teacherRoom(root, api, { showGuide = () => {} } = {}) {
  let live = true,
    listVersion = 0,
    readVersion = 0;
  const notes = new Map();
  const dirty = () =>
    [...notes].some(
      ([form, state]) =>
        form.elements.note.value !== state.saved || state.pending || state.conflict,
    );
  async function preserve() {
    await Promise.allSettled([...notes.values()].map((s) => s.pending).filter(Boolean));
  }
  async function flush() {
    await preserve();
    if (dirty())
      throw Error(
        'Du har ulagrede tilbakemeldingar. Lagre dei, eller last ned ein kopi og vel Forkast ulagrede endringar.',
      );
  }
  function download() {
    const data = [...notes].map(([form, state]) => ({
      groupId: state.groupId,
      userId: state.userId,
      lessonId: form.dataset.review,
      note: form.elements.note.value,
    }));
    const url = URL.createObjectURL(
      new Blob([JSON.stringify({ schemaVersion: 1, reviews: data }, null, 2)], {
        type: 'application/json',
      }),
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = 'kodeverkstad-tilbakemeldingar.json';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  root.innerHTML =
    '<div class="page-heading"><p class="eyebrow">FELLES START · EIGE TEMPO</p><h1>Lærarrommet</h1><p>Følg arbeidet, les forklaringane og gi ei konkret tilbakemelding.</p><button id="teacher-guide-open">Opne lærarguiden</button></div><section class="panel"><h2>Opprett ei gruppe</h2><form id="create-group" class="inline-form"><label>Gruppenamn<input name="name" required maxlength="80" placeholder="Til dømes 9A · Koding"></label><button class="primary">Opprett gruppe</button></form></section><div class="teacher-actions"><h2>Dine grupper</h2><button id="refresh-groups">Oppdater elevlistene</button><span id="groups-status" role="status"></span></div><div id="teacher-groups"></div><section id="student-work"></section>';
  $('#teacher-guide-open', root).onclick = showGuide;
  $('#refresh-groups', root).onclick = safeAction(async () => {
    await flush();
    await list();
  });
  async function list() {
    const version = ++listVersion;
    const { groups } = await api('/api/groups');
    const box = $('#teacher-groups', root);
    if (!live || version !== listVersion || !box) return;
    const fragment = document.createDocumentFragment();
    if (!groups.length) {
      const empty = document.createElement('p');
      empty.className = 'empty';
      empty.textContent = 'Opprett den første gruppa og del gruppekoden med elevane.';
      fragment.append(empty);
    }
    for (const g of groups) {
      const card = document.createElement('section');
      card.className = 'panel';
      card.innerHTML =
        '<div class="section-heading"><h2>' +
        esc(g.name) +
        '</h2><span>Gruppekode <strong class="code">' +
        esc(g.code) +
        '</strong></span></div><div class="members">Hentar elevar …</div>';
      fragment.append(card);
      const { members } = await api('/api/groups/' + g.id + '/members');
      const area = $('.members', card);
      area.innerHTML = members.length
        ? '<div class="table-wrap"><table><caption>Elevar i ' +
          esc(g.name) +
          '</caption><thead><tr><th>Elev</th><th>Trinn</th><th>Medlemskap</th><th>Handling</th></tr></thead><tbody>' +
          members
            .map(
              (m) =>
                '<tr><td>' +
                esc(m.user?.name || 'Ukjend elev') +
                '</td><td>' +
                esc(m.user?.grade || 'Ikkje valt') +
                '</td><td>' +
                (m.approved ? 'Godkjend' : 'Ventar på godkjenning') +
                '</td><td><button data-user="' +
                m.userId +
                '" data-approve="' +
                !m.approved +
                '">' +
                (m.approved ? 'Fjern tilgang' : 'Godkjenn') +
                '</button> ' +
                (m.approved ? '<button data-read="' + m.userId + '">Sjå arbeid</button>' : '') +
                '</td></tr>',
            )
            .join('') +
          '</tbody></table></div>'
        : '<p>Ingen elevar har meldt seg inn enno.</p>';
      area.querySelectorAll('[data-user]').forEach(
        (b) =>
          (b.onclick = safeAction(async () => {
            await flush();
            await api('/api/groups/' + g.id + '/members/' + b.dataset.user, 'PUT', {
              approved: b.dataset.approve === 'true',
            });
            if (!live) return;
            readVersion++;
            notes.clear();
            $('#student-work', root).replaceChildren();
            await list();
          })),
      );
      area
        .querySelectorAll('[data-read]')
        .forEach((b) => (b.onclick = safeAction(() => read(g, b.dataset.read))));
    }
    if (!live || version !== listVersion) return;
    box.replaceChildren(fragment);
    $('#groups-status', root).textContent = 'Elevlistene er oppdaterte.';
  }
  async function read(group, uid) {
    await flush();
    const version = ++readVersion;
    const work = await api('/api/groups/' + group.id + '/students/' + uid);
    const area = $('#student-work', root);
    if (!live || version !== readVersion || !area) return;
    // A teacher may type while a different pupil's request is in flight.
    await flush();
    if (!live || version !== readVersion) return;
    notes.clear();
    area.className = 'panel';
    area.innerHTML =
      '<p class="eyebrow">' +
      esc(group.name) +
      '</p><h2 tabindex="-1">' +
      esc(work.user.name) +
      ' · ' +
      esc(work.user.grade || 'Uvalt') +
      '. trinn</h2><p>' +
      work.progress.filter((p) => p.data.selfChecked).length +
      ' av 50 eigensjekkar markerte. Automatiske sjekkar er avgrensa kodekontrollar, ikkje karakterar.</p><div class="teacher-actions"><button id="review-copy">Last ned tilbakemeldingar</button><button id="review-discard">Forkast ulagrede endringar</button></div>' +
      (work.progress.length
        ? ''
        : '<p>Eleven har ikkje lagra eit oppdrag enno. Be eleven opne eit oppdrag og sjå etter Lagra.</p>') +
      '<div class="records">' +
      work.progress
        .map((p) => {
          const l = lessons.find((l) => l.id === p.id);
          const review = work.reviews.find((r) => r.lessonId === p.id);
          return (
            '<details><summary>' +
            esc(l?.title || p.id) +
            ' <span class="mini">Kode: ' +
            (p.data.autoPassed ? 'sjekk består' : 'ikkje stadfesta') +
            ' · Eigensjekk: ' +
            (p.data.selfChecked ? 'ja' : 'nei') +
            '</span></summary><h3>Eleven si forklaring</h3><p class="preserve">' +
            esc(p.data.reflection || 'Inga forklaring enno.') +
            '</p>' +
            Object.entries(p.data.files)
              .filter(([, v]) => v)
              .map(([k, v]) => '<h3>' + esc(k.toUpperCase()) + '</h3><pre>' + esc(v) + '</pre>')
              .join('') +
            '<form data-review="' +
            esc(p.id) +
            '"><label>Lærarvurdering<textarea name="note" maxlength="2000" rows="3">' +
            esc(review?.note || '') +
            '</textarea></label><button>Lagre tilbakemelding</button><span role="status"></span></form></details>'
          );
        })
        .join('') +
      '</div><h3>Prosjekt akkurat no</h3>' +
      work.projects
        .map(
          (p) =>
            '<details><summary>' +
            esc(p.data.title || p.id) +
            ' · versjon ' +
            p.revision +
            '</summary>' +
            Object.entries(p.data.files)
              .filter(([, v]) => v)
              .map(([k, v]) => '<h4>' + esc(k) + '</h4><pre>' + esc(v) + '</pre>')
              .join('') +
            '</details>',
        )
        .join('');
    area.querySelectorAll('[data-review]').forEach((form) => {
      const state = {
        saved: form.elements.note.value,
        revision: work.reviews.find((r) => r.lessonId === form.dataset.review)?.revision || 0,
        conflict: null,
        pending: null,
        groupId: group.id,
        userId: uid,
      };
      notes.set(form, state);
      const status = $('[role=status]', form),
        button = $('button', form);
      const conflictBox = document.createElement('div');
      conflictBox.dataset.reviewConflict = '';
      conflictBox.hidden = true;
      conflictBox.innerHTML =
        '<p>Tilbakemeldinga er endra på ei anna maskin eller i ei anna fane. Begge utgåvene er tekne vare på. Lagra tekst:</p><pre></pre><button type="button" data-use-server>Bruk lagra teksten</button> <button type="button" data-use-mine>Lagre mi utgåve</button>';
      form.append(conflictBox);
      $('[data-use-server]', form).onclick = () => {
        state.saved = state.conflict.note;
        state.revision = state.conflict.revision;
        form.elements.note.value = state.saved;
        state.conflict = null;
        conflictBox.hidden = true;
        status.textContent = ' Bruker lagra tilbakemelding. Begge utgåvene er tekne vare på.';
        form.elements.note.focus();
      };
      $('[data-use-mine]', form).onclick = () => {
        state.revision = state.conflict.revision;
        state.conflict = null;
        conflictBox.hidden = true;
        form.requestSubmit();
      };
      form.elements.note.oninput = () => {
        status.textContent =
          state.saved === form.elements.note.value ? '' : ' Ulagra tilbakemelding.';
      };
      form.onsubmit = safeAction(async (e) => {
        e.preventDefault();
        if (state.pending) return;
        if (state.conflict) {
          status.textContent = ' Vel kva utgåve du vil bruke under teksten.';
          return;
        }
        const note = form.elements.note.value;
        status.textContent = ' Lagrar …';
        button.disabled = true;
        state.pending = api(
          '/api/groups/' + group.id + '/reviews/' + uid + '/' + form.dataset.review,
          'PUT',
          { note, revision: state.revision },
        )
          .then((record) => {
            state.saved = note;
            state.revision = record.revision;
            status.textContent =
              note === form.elements.note.value
                ? ' Tilbakemelding lagra.'
                : ' Nyare endringar er ikkje lagra.';
          })
          .catch((error) => {
            if (error.status === 409) {
              state.conflict = error.payload.current;
              $('pre', conflictBox).textContent = state.conflict.note;
              conflictBox.hidden = false;
              status.textContent = ' Lagringskonflikt. Vel kva utgåve du vil bruke.';
              return;
            }
            status.textContent = ' Ikkje lagra. Teksten er bevart. Prøv igjen.';
            throw error;
          })
          .finally(() => {
            state.pending = null;
            button.disabled = false;
          });
        await state.pending;
      });
    });
    $('#review-copy', area).onclick = download;
    $('#review-discard', area).onclick = safeAction(async () => {
      await preserve();
      if (!dirty()) return;
      const answer = await choice(
        'Forkaste ulagrede tilbakemeldingar?',
        '<p>Berre endringar som ikkje er lagra blir fjerna. Last gjerne ned ein kopi først.</p>',
        [
          ['cancel', 'Hald fram med arbeidet'],
          ['discard', 'Forkast endringane'],
        ],
      );
      if (answer !== 'discard' || !live) return;
      for (const [form, state] of notes) {
        if (state.conflict) {
          state.saved = state.conflict.note;
          state.revision = state.conflict.revision;
          state.conflict = null;
          $('[data-review-conflict]', form).hidden = true;
        }
        form.elements.note.value = state.saved;
        $('[role=status]', form).textContent = ' Tilbake til lagra tekst.';
      }
    });
    area.scrollIntoView({ block: 'start', behavior: 'instant' });
    $('h2', area).focus({ preventScroll: true });
  }
  $('#create-group', root).onsubmit = safeAction(async (e) => {
    e.preventDefault();
    await api('/api/groups', 'POST', { name: e.target.elements.name.value });
    e.target.reset();
    await list();
  });
  await list();
  return {
    flush,
    preserve,
    dirty,
    download,
    dispose() {
      live = false;
      listVersion++;
      readVersion++;
      notes.clear();
    },
  };
}
export async function studentGroups(root, api) {
  root.innerHTML =
    '<div class="page-heading"><p class="eyebrow">SAMAN OM Å LÆRE</p><h1>Mine grupper</h1><p>Bruk koden frå læraren din. Læraren stadfestar medlemskapet før arbeidet ditt blir synleg.</p></div><section class="panel"><form id="join-group" class="inline-form"><label>Gruppekode<input name="code" required maxlength="12" autocomplete="off" spellcheck="false"></label><button class="primary">Be om å bli med</button></form><div id="group-list"></div></section>';
  async function list() {
    const { groups } = await api('/api/groups');
    const box = $('#group-list', root);
    if (box)
      box.innerHTML =
        groups
          .map(
            (g) =>
              '<p><strong>' +
              esc(g.name) +
              '</strong> · ' +
              (g.approved ? 'Medlemskapet er godkjent' : 'Ventar på læraren') +
              '</p>',
          )
          .join('') || '<p>Du er ikkje med i ei gruppe enno. Alle oppdraga er likevel opne.</p>';
  }
  $('#join-group', root).onsubmit = safeAction(async (e) => {
    e.preventDefault();
    await api('/api/groups/join', 'POST', { code: e.target.elements.code.value });
    e.target.reset();
    await list();
  });
  await list();
}
