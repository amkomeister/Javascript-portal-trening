import '@fontsource/dm-sans/latin-400.css';
import '@fontsource/dm-sans/latin-500.css';
import '@fontsource/dm-sans/latin-700.css';
import '@fontsource/jetbrains-mono/latin-400.css';
import './style.css';
import { modules, lessons, lessonById } from './content/curriculum.js';
import { art } from './art.js';
import { esc, $, choice, message, safeAction } from './ui.js';
import { teacherRoom, studentGroups } from './teacher.js';
import { openTeacherGuide, teacherGuideVersion } from './teacher-guide.js';
import { openWorkspace } from './workspace.js';
import { AccountLock } from './account-lock.js';
const app = $('#app');
let user,
  csrf,
  config,
  workspace,
  sessionExpired = false,
  guideOffered = false,
  epoch = 0,
  route = 0;
const channel = new BroadcastChannel('kodeverkstad-skule-account-v1');
const accountLock = new AccountLock({
  channel,
  isActive: () => !!user,
  flush: () => workspace?.flush(),
  preserve: () => workspace?.preserve(),
  canRenew: (id) => user?.id === id,
  suspend: (value) => {
    app.inert = value;
  },
});
async function api(path, method = 'GET', body) {
  const expected = epoch;
  let response;
  try {
    response = await fetch(path, {
      method,
      headers: { 'Content-Type': 'application/json', ...(csrf ? { 'X-CSRF-Token': csrf } : {}) },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(12000),
    });
  } catch {
    throw Error(
      'Ingen kontakt med lagringa. Koden er framleis open. Prøv igjen eller last ned ein kodekopi.',
    );
  }
  const payload = await response.json();
  if (expected !== epoch) throw Error('stale');
  if (!response.ok) {
    if (response.status === 401 && user) markExpired();
    throw Object.assign(new Error(payload.error || 'Noko gjekk gale.'), {
      status: response.status,
      payload,
    });
  }
  return payload;
}
function shell() {
  app.innerHTML =
    '<header class="topbar"><button class="brand" data-nav="home" aria-label="Kodeverkstad Skule, heim"><span class="brand-icon">&lt;/&gt;</span><span>Kodeverkstad <small>SKULE</small></span></button><nav aria-label="Hovudmeny">' +
    (user
      ? '<button data-nav="home">Verkstaden</button>' +
        (user.role === 'teacher'
          ? '<button data-nav="teacher">Lærarrommet</button>'
          : '<button data-nav="groups">Mine grupper</button>')
      : '') +
    '</nav><div class="account">' +
    (user
      ? '<span class="avatar" aria-hidden="true">' +
        esc(user.name.slice(0, 1)) +
        '</span><span class="account-name">' +
        esc(user.name) +
        '<small>' +
        (user.role === 'teacher' ? 'Lærar' : esc(user.grade || 'Vel') + '. trinn') +
        '</small></span><button id="logout">Logg ut</button>'
      : '<span class="pill">8.–10. trinn</span>') +
    '</div></header><div id="notice" class="notice" role="alert" tabindex="-1" hidden></div><main id="main" tabindex="-1"></main><footer class="footer"><span>Små steg. Eigne idear. Ekte kode.</span><button id="about">Om verkstaden og kodehjelpa</button></footer>';
  app
    .querySelectorAll('[data-nav]')
    .forEach((b) => (b.onclick = safeAction(() => navigate(b.dataset.nav))));
  if (user) $('#logout').onclick = safeAction(logout);
  if (sessionExpired && user) markExpired();
  $('#about').onclick = () =>
    choice(
      'Ein verkstad for ideane dine',
      '<p>Alle åtte modulane er opne. Start roleg, endre éin ting og sjå kva som skjer. Hint blir viste eitt om gongen. Forklar gjerne endringa til ein medelev eller lærar.</p><p>Arbeidet er privat for deg og lærarar i gruppene som har godkjent deg. Verktøyet bruker ferdigskrivne hint, utan KI-chat.</p><p>HTML og CSS lagar nettsider. JavaScript bestemmer kva som skjer. I verkstaden får JavaScript eit avgrensa utval funksjonar. Vel Kodehjelp inne i eit oppdrag for å sjå dei.</p>',
    );
}
async function leave() {
  if (!workspace) return true;
  try {
    await workspace.flush();
    workspace.dispose();
    workspace = null;
    return true;
  } catch (e) {
    message(e.message, e.noticeSource);
    return false;
  }
}
async function navigate(where = 'home', id) {
  if (!(await leave())) return;
  const current = ++route;
  shell();
  const root = $('#main');
  if (!user) {
    loginScreen();
    return;
  }
  if (!user.grade && user.role === 'student') {
    gradeScreen();
    return;
  }
  if (where === 'groups') {
    await studentGroups(root, api);
    return;
  }
  if (where === 'teacher' && user.role === 'teacher') {
    const showGuide = () =>
      openTeacherGuide({
        complete: async (version) => {
          user = (await api('/api/teacher/guide', 'PUT', { version })).user;
        },
        onClose: (completed) => {
          if (root.isConnected) $(completed ? '[name=name]' : '#teacher-guide-open', root)?.focus();
        },
      });
    const opened = await teacherRoom(root, api, { showGuide });
    if (current !== route) {
      opened.dispose();
      return;
    }
    workspace = opened;
    if (!guideOffered && (user.teacherGuideVersion || 0) < teacherGuideVersion) {
      guideOffered = true;
      showGuide();
    }
    return;
  }
  if (where === 'lesson') {
    const l = lessonById(id);
    if (l) {
      const opened = await openWorkspace(root, l, {
        api,
        user,
        onBack: () => navigate('module', l.module),
        onNext: (next) => navigate('lesson', next),
      });
      if (current !== route) {
        opened.dispose();
        return;
      }
      workspace = opened;
      return;
    }
  }
  const { records } = await api('/api/progress');
  if (current !== route) return;
  const progress = new Map(records.map((r) => [r.id, r.data]));
  if (where === 'module') {
    const m = modules.find((m) => m.id === id) || modules[0],
      list = lessons.filter((l) => l.module === m.id);
    root.innerHTML =
      '<button class="back" id="all-modules">← Alle modular</button><div class="module-heading"><div><p class="eyebrow">' +
      esc(m.label) +
      '</p><h1>' +
      esc(m.title) +
      '</h1><p>' +
      esc(m.subtitle) +
      '</p><span class="pill">' +
      list.length +
      ' oppdrag · Alle er opne</span></div><div class="module-art ' +
      m.color +
      '">' +
      art(m.art) +
      '</div></div><div class="lesson-list">' +
      list
        .map(
          (l) =>
            '<button class="lesson-row" data-lesson="' +
            l.id +
            '"><span class="lesson-number">' +
            String(l.number).padStart(2, '0') +
            '</span><span><strong>' +
            esc(l.title) +
            '</strong><small>' +
            esc(l.goal) +
            '</small></span><span class="row-state">' +
            (progress.get(l.id)?.selfChecked ? '✓ Eigensjekka' : 'Opne →') +
            '</span></button>',
        )
        .join('') +
      '</div>';
    $('#all-modules').onclick = safeAction(() => navigate());
  } else {
    const checked = records.filter((r) => r.data.selfChecked).length;
    root.innerHTML =
      '<div class="page-heading home-heading"><div><p class="eyebrow">DIN KREATIVE KODEVERKSTAD</p><h1>Kva vil du <span>skape</span> i dag?</h1><p>Bygg noko du kan sjå, spele og vere stolt av.<br>Du treng berre ein idé. Resten lærer du undervegs.</p></div><div class="progress-note"><strong>' +
      checked +
      '<span> / 50</span></strong><span>oppdrag eigensjekka</span><button id="change-grade" class="text-button">' +
      esc(user.grade || 'Vel') +
      '. trinn · Endre</button></div></div><section class="first-step"><div><span class="tag">START HER · INGA KODEERFARING NØDVENDIG</span><h2>Din første robot.<br>Din første «eg fekk det til!»</h2><p>Endre ein farge. Trykk køyr. Sjå kva du skapte.</p><button class="primary" data-lesson="skule-v1-start-01">Start med den første roboten <span aria-hidden="true">↗</span></button></div><div class="first-art">' +
      art('robot') +
      '<span class="code-sticker">rect(170, 90, 140, 150, <b>"lime"</b>);</span></div></section><div class="section-heading"><div><p class="eyebrow">FINN DI NESTE IDÉ</p><h2>Åtte måtar å skape på</h2></div><span class="quiet">Alle modular er opne · Lær i ditt tempo</span></div><div class="module-grid">' +
      modules
        .map((m, i) => {
          const ls = lessons.filter((l) => l.module === m.id);
          return (
            '<button class="module-card" data-module="' +
            m.id +
            '"><div class="card-art ' +
            m.color +
            '">' +
            art(m.art) +
            '<span class="card-number">' +
            String(i + 1).padStart(2, '0') +
            '</span></div><div class="card-body"><p class="eyebrow">' +
            m.label +
            '</p><h3>' +
            m.title +
            '</h3><p>' +
            m.subtitle +
            '</p><div class="card-meta"><span>' +
            ls.length +
            ' oppdrag</span><span>' +
            ls.filter((l) => progress.get(l.id)?.selfChecked).length +
            ' eigensjekka <b aria-hidden="true">↗</b></span></div></div></button>'
          );
        })
        .join('') +
      '</div><section class="workshop-note"><span aria-hidden="true">✳</span><div><h2>Det finst meir enn éi rett løysing.</h2><p>Prøv ein idé, bruk eit hint, eller lag noko heilt anna. Koden din er ein stad å utforske.</p></div></section>';
    $('#change-grade').onclick = gradeScreen;
  }
  root
    .querySelectorAll('[data-module]')
    .forEach((b) => (b.onclick = safeAction(() => navigate('module', b.dataset.module))));
  root
    .querySelectorAll('[data-lesson]')
    .forEach((b) => (b.onclick = safeAction(() => navigate('lesson', b.dataset.lesson))));
}
function gradeScreen() {
  const root = $('#main');
  root.innerHTML =
    '<section class="onboarding"><div class="onboarding-art">' +
    art('spark') +
    '</div><p class="eyebrow">VELKOMEN, ' +
    esc(user.name.toUpperCase()) +
    '</p><h1>Kva trinn går du på?</h1><p>Alle startar der dei er. Trinnet hjelper læraren å finne deg.<br>Alle oppdraga er opne uansett kva du vel.</p><div class="grade-options">' +
    [8, 9, 10]
      .map((n) => '<button data-grade="' + n + '"><strong>' + n + '.</strong> trinn</button>')
      .join('') +
    '</div></section>';
  root.querySelectorAll('[data-grade]').forEach(
    (b) =>
      (b.onclick = safeAction(async () => {
        const r = await api('/api/profile', 'PUT', { grade: Number(b.dataset.grade) });
        user = r.user;
        await navigate();
      })),
  );
}
function loginScreen() {
  const root = $('#main');
  root.innerHTML =
    '<section class="welcome"><div><p class="eyebrow">KODEVERKSTAD SKULE</p><h1>Frå «kva om»<br>til <span>«sjå her!»</span></h1><p class="lead">Lær å lage dine eigne spel, nettsider og digitale idear. Eitt lite steg om gongen.</p><div class="welcome-art">' +
    art('robot') +
    art('snake') +
    '</div><p class="quiet">8 modular · 50 oppdrag · JavaScript på nynorsk</p></div><section class="login-card"><span class="tag">KLAR FOR Å SKAPE?</span><h2>Velkomen inn.</h2><p>Logg inn med skulekontoen din, så følgjer arbeidet deg mellom maskinene.</p><div id="google-signin"></div>' +
    (config.local
      ? '<div class="local-login"><p class="eyebrow">LOKAL UTPRØVING · BERRE TESTDATA</p><button id="try-student" class="primary">Prøv som elev</button><button id="try-teacher">Prøv som lærar</button><details><summary>Fleire testkontoar</summary><label>Testkonto<select id="test-account">' +
        Array.from(
          { length: 10 },
          (_, i) => '<option value="student' + (i + 1) + '">Elev ' + (i + 1) + '</option>',
        ).join('') +
        '<option value="teacher2">Lærar Ola</option></select></label><button id="test-login">Opne testkonto</button></details></div>'
      : '<p class="quiet">Bruk Google-kontoen frå skulen din. GGLeap er ikkje nødvendig.</p>') +
    '<p class="privacy-note">Prosjekta dine er private for deg og læraren din. Ingen offentleg deling.</p></section></section>';
  if (config.local) {
    $('#try-student').onclick = safeAction(() => localLogin('student1'));
    $('#try-teacher').onclick = safeAction(() => localLogin('teacher'));
    $('#test-login').onclick = safeAction(() => localLogin($('#test-account').value));
  } else {
    googleButton(
      $('#google-signin'),
      safeAction(async (result) => {
        const fresh = await api('/api/config');
        const r = await accountLock.change(() =>
          api('/api/auth/google', 'POST', {
            credential: result.credential,
            g_csrf_token: fresh.loginCsrf,
          }),
        );
        await authenticated(r);
      }),
    );
  }
}
function googleButton(container, callback) {
  const render = () => {
    if (!container.isConnected) return;
    window.google.accounts.id.initialize({ client_id: config.clientId, callback });
    window.google.accounts.id.renderButton(container, {
      theme: 'outline',
      size: 'large',
      text: 'signin_with',
      locale: 'nn',
    });
  };
  if (window.google?.accounts?.id) return render();
  const script = document.createElement('script');
  script.src = 'https://accounts.google.com/gsi/client';
  script.async = true;
  script.onload = render;
  script.onerror = () =>
    message('Kunne ikkje hente Google-innlogginga. Kontroller nettet og prøv igjen.');
  document.head.append(script);
}
function markExpired() {
  sessionExpired = true;
  if (!user || $('#renew-session')) return;
  const button = document.createElement('button');
  button.id = 'renew-session';
  button.className = 'primary';
  button.textContent = 'Logg inn på nytt';
  button.onclick = recoverSession;
  $('.account')?.append(button);
  message(
    'Innlogginga er utgått. Koden er bevart. Vel Logg inn på nytt for å halde fram med same konto.',
  );
}
function recoverSession() {
  if ($('#renew-dialog')) return;
  const expectedId = user.id;
  const d = document.createElement('dialog');
  d.id = 'renew-dialog';
  d.className = 'dialog';
  d.innerHTML =
    '<h2>Hald fram med arbeidet ditt</h2><p>Koden blir verande open. Logg inn med same konto: <strong>' +
    esc(user.email) +
    '</strong>.</p><p role="alert" id="renew-error"></p><div id="renew-google"></div><div class="dialog-actions">' +
    (config.local
      ? '<button id="renew-local" class="primary">Hald fram som ' + esc(user.name) + '</button>'
      : '') +
    (workspace ? '<button id="renew-copy">Last ned kodekopi</button>' : '') +
    '<button id="renew-cancel">Tilbake til koden</button></div>';
  document.body.append(d);
  d.showModal();
  d.addEventListener('close', () => d.remove(), { once: true });
  $('#renew-cancel', d).onclick = () => d.close();
  if (workspace) $('#renew-copy', d).onclick = () => workspace.download();
  const renew = async (credential) => {
    try {
      const fresh = config.local ? null : await api('/api/config');
      const result = await accountLock.change(
        () =>
          api(config.local ? '/api/auth/local' : '/api/auth/google', 'POST', {
            ...(config.local
              ? { account: user.email.split('@')[0] }
              : { credential, g_csrf_token: fresh.loginCsrf }),
            resumeUserId: expectedId,
          }),
        { renewUserId: expectedId },
      );
      if (result.user.id !== expectedId) throw Error('Vel den same kontoen.');
      user = result.user;
      csrf = result.csrf;
      epoch++;
      sessionExpired = false;
      $('#renew-session')?.remove();
      d.close();
      await accountLock.hold();
      channel.postMessage({ type: 'session-renewed', userId: user.id });
      message('Du er logga inn att. Arbeidet er framleis ope.');
      await workspace?.flush();
    } catch (error) {
      if (d.isConnected) $('#renew-error', d).textContent = error.message;
      else message(error.message);
    }
  };
  if (config.local) $('#renew-local', d).onclick = () => renew();
  else googleButton($('#renew-google', d), (result) => renew(result.credential));
}
async function authenticated(result) {
  user = result.user;
  csrf = result.csrf;
  sessionExpired = false;
  guideOffered = false;
  epoch++;
  await accountLock.hold();
  channel.postMessage({ type: 'account', userId: user.id });
  await navigate(user.role === 'teacher' ? 'teacher' : 'home');
}
async function localLogin(account) {
  await authenticated(await accountLock.change(() => api('/api/auth/local', 'POST', { account })));
}
async function logout() {
  await accountLock.change(() => api('/api/logout', 'POST', {}));
  clearIdentity();
  channel.postMessage({ type: 'logout' });
}
function clearIdentity() {
  accountLock.reset();
  epoch++;
  route++;
  workspace?.dispose();
  workspace = null;
  user = null;
  csrf = null;
  sessionExpired = false;
  document.querySelectorAll('dialog').forEach((d) => d.remove());
  shell();
  loginScreen();
}
channel.onmessage = async (e) => {
  if (e.data.type === 'session-renewed' && user?.id === e.data.userId) {
    try {
      accountLock.remoteId = null;
      await accountLock.hold();
      if (!(await refreshSession())) return;
      $('#renew-dialog')?.close();
      app.inert = false;
      await workspace?.flush();
    } catch (error) {
      app.inert = false;
      message(error.message);
    }
    return;
  }
  if (e.data.type === 'logout' || (e.data.type === 'account' && user)) {
    clearIdentity();
    message('Kontoen blei endra i ei anna fane. Logg inn på nytt for å halde fram.');
  }
};
window.addEventListener('beforeunload', (e) => {
  if (workspace?.dirty()) {
    e.preventDefault();
    e.returnValue = '';
  }
});
async function refreshSession() {
  if (!user) return false;
  const current = await api('/api/me');
  if (current.user.id !== user?.id) {
    clearIdentity();
    message('Aktiv konto er endra. Logg inn på nytt.');
    return false;
  }
  csrf = current.csrf;
  sessionExpired = false;
  $('#renew-session')?.remove();
  return true;
}
async function reconnect() {
  try {
    if (await refreshSession()) await workspace?.flush();
  } catch (e) {
    if (e.status === 401) markExpired();
  }
}
window.addEventListener('online', reconnect);
window.addEventListener('focus', reconnect);
try {
  config = await api('/api/config');
  try {
    const me = await api('/api/me');
    user = me.user;
    csrf = me.csrf;
    await accountLock.hold();
  } catch (e) {
    if (e.status !== 401) throw e;
  }
  await navigate(user?.role === 'teacher' ? 'teacher' : 'home');
} catch (e) {
  shell();
  $('#main').innerHTML =
    '<section class="onboarding"><h1>Vi fekk ikkje opna verkstaden.</h1><p>' +
    esc(e.message) +
    '</p><button>Prøv igjen</button></section>';
  $('#main button').onclick = () => location.reload();
}
