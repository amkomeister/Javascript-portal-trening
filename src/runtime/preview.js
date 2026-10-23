const tags = new Set(
  'main header footer section article nav aside div span h1 h2 h3 h4 p strong em b i small ul ol li button input label a br hr pre code select option textarea figure figcaption table thead tbody tr th td'.split(
    ' ',
  ),
);
const attrs = new Set([
  'id',
  'class',
  'type',
  'value',
  'placeholder',
  'for',
  'aria-label',
  'title',
  'disabled',
  'min',
  'max',
  'step',
  'rows',
  'cols',
]);
export function sanitizeMarkup(source, Parser = DOMParser) {
  const doc = new Parser().parseFromString(String(source).slice(0, 100000), 'text/html');
  let count = 0;
  const used = new Set(),
    dom = [];
  for (const node of [...doc.body.querySelectorAll('*')]) {
    if (!node.isConnected) continue;
    if (!tags.has(node.tagName.toLowerCase()) || ++count > 300) {
      node.remove();
      continue;
    }
    for (const a of [...node.attributes]) if (!attrs.has(a.name)) node.removeAttribute(a.name);
    if (
      node.tagName === 'INPUT' &&
      !['text', 'number', 'range', 'checkbox', 'button'].includes(node.type)
    )
      node.type = 'text';
    if (!/^[a-zA-Z][\w-]{0,60}$/.test(node.id) || used.has(node.id)) node.id = 'kv_' + count;
    while (used.has(node.id)) node.id += 'x';
    used.add(node.id);
    dom.push({
      id: node.id,
      tag: node.tagName.toLowerCase(),
      text: node.textContent.slice(0, 4000),
      value: node.value || '',
      classes: node.className,
      parentId: node.parentElement === doc.body ? null : node.parentElement?.id || null,
    });
  }
  return { html: doc.body.innerHTML, dom };
}
// Static trusted script. The server adds its SHA-256 to CSP; student scripts never enter this document.
export const bridgeScript = String.raw`(()=>{
 const token=document.body.dataset.token;delete document.body.dataset.token;
 const baseline=new Map([...document.querySelectorAll('[id]')].map(n=>[n.id,{text:n.textContent,value:n.value||'',classes:n.className}]));
 const send=m=>parent.postMessage({...m,token},'*');
 addEventListener('message',e=>{
  if(e.source!==parent||e.data?.token!==token||e.data?.type!=='render'||!Array.isArray(e.data.dom))return;
  for(const n of e.data.dom){const el=document.getElementById(n.id),old=baseline.get(n.id);if(!el||!old)continue;
   if(n.text!==old.text){el.textContent=n.text;old.text=n.text;}
   if(n.value!==old.value){el.value=n.value;old.value=n.value;}
   if(n.classes!==old.classes){el.className=n.classes;old.classes=n.classes;}
   for(const [k,v] of Object.entries(n.style||{}))if(['color','backgroundColor','display','fontSize','borderRadius','padding','width','height'].includes(k))el.style[k]=v;
  }
 });
 for(const type of ['click','input','change','keydown','keyup'])document.addEventListener(type,e=>{
  if(!e.isTrusted)return;if(e.target.tagName==='A')e.preventDefault();
  send({type:'event',event:{type,id:e.target.id||'document',key:e.key||'',value:typeof e.target.value==='string'?e.target.value.slice(0,4000):undefined}});
 });
 send({type:'ready'});
})();`;
// Hash is injected by the server for the static bridge. A nonce also confines the child document.
export function previewDocument(html, css, token) {
  const nonce = token.replace(/[^a-zA-Z0-9-]/g, '');
  return (
    '<!doctype html><html lang="nn"><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src \'none\'; script-src \'nonce-' +
    nonce +
    "'; style-src 'unsafe-inline'; form-action 'none'; base-uri 'none'\"><style>body{font:16px system-ui;padding:20px;color:#172b37;background:#fff}button,input,select{font:inherit}button{cursor:pointer;padding:10px 16px}*:focus-visible{outline:3px solid #2453db;outline-offset:3px}" +
    String(css).replaceAll('<', '') +
    '</style></head><body data-token="' +
    nonce +
    '">' +
    html +
    '<script nonce="' +
    nonce +
    '">' +
    bridgeScript +
    '</script></body></html>'
  );
}
export function drawFrame(canvas, state) {
  const c = canvas.getContext('2d');
  c.fillStyle = state.background;
  c.fillRect(0, 0, 480, 320);
  for (const d of state.draws) {
    c.fillStyle = d.color;
    if (d.op === 'rect') c.fillRect(d.x, d.y, d.w, d.h);
    if (d.op === 'circle') {
      c.beginPath();
      c.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      c.fill();
    }
    if (d.op === 'text') {
      c.font = d.size + 'px sans-serif';
      c.fillText(d.text, d.x, d.y);
    }
  }
}
