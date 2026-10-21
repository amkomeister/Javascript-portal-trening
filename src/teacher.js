import { esc, $, message, safeAction } from './ui.js';
import { lessons } from './content/curriculum.js';
export async function teacherRoom(root, api) {
  root.innerHTML =
    '<div class="page-heading"><p class="eyebrow">FELLES START · EIGE TEMPO</p><h1>Lærarrommet</h1><p>Følg arbeidet, les forklaringane og gi ei konkret tilbakemelding.</p></div><section class="panel"><h2>Opprett ei gruppe</h2><form id="create-group" class="inline-form"><label>Gruppenamn<input name="name" required maxlength="80" placeholder="Til dømes 9A · Koding"></label><button class="primary">Opprett gruppe</button></form></section><div id="teacher-groups"></div><section id="student-work"></section>';
  async function list() {
    const { groups } = await api('/api/groups');
    const box = $('#teacher-groups', root);
    if (!box) return;
    box.innerHTML = groups.length
      ? ''
      : '<p class="empty">Opprett den første gruppa og del gruppekoden med elevane.</p>';
    for (const g of groups) {
      const card = document.createElement('section');
      card.className = 'panel';
      card.innerHTML =
        '<div class="section-heading"><h2>' +
        esc(g.name) +
        '</h2><span>Gruppekode <strong class="code">' +
        esc(g.code) +
        '</strong></span></div><div class="members">Hentar elevar …</div>';
      box.append(card);
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
            await api('/api/groups/' + g.id + '/members/' + b.dataset.user, 'PUT', {
              approved: b.dataset.approve === 'true',
            });
            await list();
            $('#student-work', root).replaceChildren();
          })),
      );
      area
        .querySelectorAll('[data-read]')
        .forEach((b) => (b.onclick = safeAction(() => read(g, b.dataset.read))));
    }
  }
  async function read(group, uid) {
    const work = await api('/api/groups/' + group.id + '/students/' + uid);
    const area = $('#student-work', root);
    if (!area) return;
    area.className = 'panel';
    area.innerHTML =
      '<p class="eyebrow">' +
      esc(group.name) +
      '</p><h2>' +
      esc(work.user.name) +
      ' · ' +
      esc(work.user.grade || 'Uvalt') +
      '. trinn</h2><p>' +
      work.progress.filter((p) => p.data.selfChecked).length +
      ' av 50 eigensjekkar markerte. Automatiske sjekkar er avgrensa kodekontrollar, ikkje karakterar.</p><div class="records">' +
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
    area.querySelectorAll('[data-review]').forEach(
      (form) =>
        (form.onsubmit = safeAction(async (e) => {
          e.preventDefault();
          await api(
            '/api/groups/' + group.id + '/reviews/' + uid + '/' + form.dataset.review,
            'PUT',
            { note: form.elements.note.value },
          );
          $('[role=status]', form).textContent = ' Tilbakemelding lagra.';
        })),
    );
    area.scrollIntoView({ block: 'start', behavior: 'instant' });
  }
  $('#create-group', root).onsubmit = safeAction(async (e) => {
    e.preventDefault();
    await api('/api/groups', 'POST', { name: e.target.elements.name.value });
    e.target.reset();
    await list();
  });
  await list();
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
