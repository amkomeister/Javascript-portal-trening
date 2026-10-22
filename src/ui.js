export const esc = (value) =>
  String(value ?? '').replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );
export const $ = (selector, root = document) => root.querySelector(selector);
export function message(text, source = '') {
  const box = $('#notice');
  if (box) {
    box.hidden = false;
    box.textContent = text;
    box.dataset.source = source;
    box.focus();
  }
}
export function clearMessage(source) {
  const box = $('#notice');
  if (box?.dataset.source === source) {
    box.hidden = true;
    box.textContent = '';
    delete box.dataset.source;
  }
}
export async function choice(title, body, options = [['ok', 'Greitt']]) {
  const d = document.createElement('dialog');
  d.className = 'dialog';
  d.innerHTML =
    '<form method="dialog"><h2>' +
    esc(title) +
    '</h2><div class="dialog-body">' +
    body +
    '</div><div class="dialog-actions">' +
    options
      .map(([value, label]) => '<button value="' + esc(value) + '">' + esc(label) + '</button>')
      .join('') +
    '</div></form>';
  document.body.append(d);
  d.showModal();
  return new Promise((resolve) =>
    d.addEventListener(
      'close',
      () => {
        const result = d.returnValue;
        d.remove();
        resolve(result);
      },
      { once: true },
    ),
  );
}
export const safeAction = (fn) => async (e) => {
  try {
    await fn(e);
  } catch (error) {
    if (error.message !== 'stale')
      message(error.message || 'Noko gjekk gale. Prøv igjen.', error.noticeSource);
  }
};
