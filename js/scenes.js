/* Orbit explainer scenes: animated 2D (SVG/DOM) and 3D (three.js, lazy) explanations.
   window.OrbitScenes.mount(el, scene, ctx) -> cleanup(). ctx = { lang, reduced, saver, L } */
(() => {
'use strict';
const T = (en, fr) => ({ en, fr });
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const THREE_URL = 'js/vendor/three.min.js';
let threeP = null;
function loadThree() {
  if (window.THREE) return Promise.resolve(window.THREE);
  if (!threeP) threeP = new Promise((res, rej) => { const s = document.createElement('script'); s.src = THREE_URL; s.onload = () => res(window.THREE); s.onerror = rej; document.head.appendChild(s); });
  return threeP;
}
function webgl() { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl') || c.getContext('experimental-webgl')); } catch { return false; } }
const css = getComputedStyle.bind(window);
const tok = name => css(document.documentElement).getPropertyValue(name).trim() || '#1D6A86';

function frame(el, ctx, body, controls = []) {
  el.innerHTML = `<div class="scene-stage">${body}</div>${controls.length ? `<div class="scene-ctl">${controls.map(c => `<button type="button" class="btn small" data-sc="${c.id}">${esc(ctx.L(c.label))}</button>`).join('')}</div>` : ''}`;
  return el.querySelector('.scene-stage');
}
function onCtl(el, map) { const h = e => { const b = e.target.closest('[data-sc]'); if (b && map[b.dataset.sc]) map[b.dataset.sc](b); }; el.addEventListener('click', h); return () => el.removeEventListener('click', h); }
function ticker(fn, ms, ctx) { let id = null; return { play() { if (id) return; fn(); id = setInterval(fn, ctx.reduced ? ms * 1.6 : ms); }, stop() { clearInterval(id); id = null; }, get on() { return !!id; } }; }
const PLAY = T('Play', 'Lecture'), PAUSE = T('Pause', 'Pause'), STEP = T('Step', 'Étape'), RESET = T('Reset', 'Recommencer');

/* ---------- tokens: next-token prediction, one token at a time */
function tokens(el, sc, ctx) {
  const run = ctx.lang === 'fr' ? sc.fr || sc.en : sc.en;
  const steps = run.steps; // [{t:'Bon', c:[['Bon',.62],['Cher',.21],['Salut',.09]]}]
  const stage = frame(el, ctx, `<div class="tk-out" aria-live="polite"></div><div class="tk-cands"></div><div class="tk-meta mono small muted"></div>`,
    [{ id: 'play', label: PLAY }, { id: 'step', label: STEP }, { id: 'reset', label: RESET }]);
  const out = stage.querySelector('.tk-out'), cands = stage.querySelector('.tk-cands'), meta = stage.querySelector('.tk-meta');
  let i = 0;
  const showCands = () => {
    const s = steps[i]; if (!s) { cands.innerHTML = `<p class="small muted">${esc(ctx.L(T('End token predicted. The model stops.', 'Token de fin prédit. Le modèle s’arrête.')))}</p>`; return; }
    cands.innerHTML = s.c.map(([w, p], k) => `<div class="tk-bar ${k === 0 ? 'win' : ''}"><span class="mono">${esc(w.replace(/ /g, '·'))}</span><i style="--w:${Math.round(p * 100)}%"></i><b class="mono">${Math.round(p * 100)}%</b></div>`).join('');
  };
  const step = () => {
    if (i >= steps.length) { tk.stop(); return; }
    const chip = document.createElement('span'); chip.className = 'tk-chip'; chip.textContent = steps[i].t; out.appendChild(chip);
    if (!ctx.reduced) chip.animate([{ opacity: 0, transform: 'translateY(8px) scale(.96)' }, { opacity: 1, transform: 'none' }], { duration: 220, easing: 'cubic-bezier(0.23,1,0.32,1)' });
    i++; meta.textContent = `${ctx.L(T('tokens written', 'tokens écrits'))}: ${i} / ${steps.length}`; showCands();
  };
  const tk = ticker(step, 900, ctx);
  const reset = () => { tk.stop(); i = 0; out.innerHTML = ''; meta.textContent = ''; showCands(); };
  reset();
  const off = onCtl(el, { play: b => { if (tk.on) { tk.stop(); b.textContent = ctx.L(PLAY); } else { tk.play(); b.textContent = ctx.L(PAUSE); } }, step: () => { tk.stop(); step(); }, reset });
  return () => { tk.stop(); off(); };
}

/* ---------- temperature: reshape a next-token distribution */
function temperature(el, sc, ctx) {
  const run = ctx.lang === 'fr' ? sc.fr || sc.en : sc.en;
  const words = run.words, base = run.p;
  const stage = frame(el, ctx, `<p class="tk-prompt">${esc(run.prompt)} <span class="caret">▍</span></p>
    <label class="field small">${esc(ctx.L(T('Temperature', 'Température')))} <span class="mono tv">0.7</span><input type="range" min="0.1" max="1.6" step="0.1" value="0.7" class="tr-in" aria-label="Temperature"></label>
    <div class="tk-cands"></div><div class="tk-hist small"></div>`, [{ id: 'sample', label: T('Sample 5 times', 'Tirer 5 fois') }]);
  const bars = stage.querySelector('.tk-cands'), tv = stage.querySelector('.tv'), inp = stage.querySelector('.tr-in'), hist = stage.querySelector('.tk-hist');
  let probs = base;
  const recompute = () => {
    const temp = +inp.value; tv.textContent = temp.toFixed(1);
    const logits = base.map(p => Math.log(p) / temp), m = Math.max(...logits), ex = logits.map(l => Math.exp(l - m)), s = ex.reduce((a, b) => a + b, 0);
    probs = ex.map(e => e / s);
    bars.innerHTML = words.map((w, k) => `<div class="tk-bar"><span class="mono">${esc(w)}</span><i style="--w:${(probs[k] * 100).toFixed(1)}%"></i><b class="mono">${Math.round(probs[k] * 100)}%</b></div>`).join('');
  };
  const pick = () => { let r = Math.random(), k = 0; for (; k < probs.length - 1; k++) { r -= probs[k]; if (r <= 0) break; } return words[k]; };
  inp.addEventListener('input', recompute); recompute();
  const off = onCtl(el, { sample: () => { hist.innerHTML = `<span class="muted">${esc(ctx.L(T('Picked', 'Tirés')))}:</span> ` + Array.from({ length: 5 }, () => `<span class="tk-chip">${esc(pick())}</span>`).join(' '); } });
  return () => { off(); inp.removeEventListener('input', recompute); };
}

/* ---------- context: the desk the model works on */
function context(el, sc, ctx) {
  const L = ctx.L, CAP = 8;
  const kinds = {
    ins: { label: T('Instructions', 'Instructions'), size: 1, keep: true },
    chat: { label: T('Chat turn', 'Message'), size: 1 },
    tool: { label: T('Tool result', 'Résultat d’outil'), size: 2 },
    page: { label: T('Page text (hours: 8:00)', 'Texte de page (horaires : 8 h)'), size: 3, fact: true }
  };
  let items = [{ k: 'ins' }], safe = false;
  const stage = frame(el, ctx, `<div class="cx-win" aria-label="Context window"></div><div class="mono small muted cx-meter"></div>
    <div class="cx-add">${Object.keys(kinds).filter(k => k !== 'ins').map(k => `<button type="button" class="btn small" data-add="${k}">+ ${esc(L(kinds[k].label))}</button>`).join('')}</div>
    <label class="check small"><input type="checkbox" class="cx-safe"> ${esc(L(T('Instruction includes “If missing, write NOT FOUND”', 'L’instruction contient « Si absent, écris NOT FOUND »')))}</label>
    <div class="cx-q"><b>${esc(L(T('Question: what time does the hotel open?', 'Question : à quelle heure ouvre l’hôtel ?')))}</b><div class="cx-a"></div></div>`);
  const win = stage.querySelector('.cx-win'), meter = stage.querySelector('.cx-meter'), ans = stage.querySelector('.cx-a');
  const draw = () => {
    const used = items.reduce((a, it) => a + kinds[it.k].size, 0);
    win.innerHTML = items.map(it => `<span class="cx-blk cx-${it.k}" style="flex:${kinds[it.k].size}">${esc(L(kinds[it.k].label))}</span>`).join('') + `<span class="cx-free" style="flex:${Math.max(CAP - used, 0)}"></span>`;
    meter.textContent = `${L(T('Used', 'Utilisé'))} ${used}/${CAP}`;
    const has = items.some(it => kinds[it.k].fact);
    ans.className = 'cx-a ' + (has ? 'good' : safe ? 'info' : 'bad');
    ans.textContent = has ? L(T('“The hotel opens at 8:00” — quoted from the page text in context.', '« L’hôtel ouvre à 8 h » — cité du texte de la page dans le contexte.'))
      : safe ? 'NOT FOUND' : L(T('“The hotel opens at 7:00.” Invented: the fact is not on the desk.', '« L’hôtel ouvre à 7 h. » Inventé : le fait n’est pas sur le bureau.'));
  };
  const add = k => {
    items.push({ k });
    while (items.reduce((a, it) => a + kinds[it.k].size, 0) > CAP) { const j = items.findIndex(it => !kinds[it.k].keep); if (j < 0) break; items.splice(j, 1); }
    draw();
  };
  const h = e => { const b = e.target.closest('[data-add]'); if (b) add(b.dataset.add); };
  const cb = stage.querySelector('.cx-safe'); const hc = () => { safe = cb.checked; draw(); };
  el.addEventListener('click', h); cb.addEventListener('change', hc); draw();
  return () => { el.removeEventListener('click', h); cb.removeEventListener('change', hc); };
}

/* ---------- agentloop: think -> act -> observe, with stop rules */
function agentloop(el, sc, ctx) {
  const L = ctx.L, run = ctx.lang === 'fr' ? sc.fr || sc.en : sc.en;
  const nodes = [T('Model thinks', 'Le modèle réfléchit'), T('Calls a tool', 'Appelle un outil'), T('Reads the result', 'Lit le résultat'), T('Stop check', 'Contrôle d’arrêt')];
  const R = 110, cx = 160, cy = 140, pos = k => [cx + R * Math.cos(-Math.PI / 2 + k * Math.PI / 2), cy + R * Math.sin(-Math.PI / 2 + k * Math.PI / 2)];
  const stage = frame(el, ctx, `<div class="al-grid"><svg viewBox="0 0 320 280" class="al-svg" role="img" aria-label="Agent loop">
      <circle cx="${cx}" cy="${cy}" r="${R}" class="al-ring"/>
      ${nodes.map((n, k) => { const [x, y] = pos(k); return `<g class="al-node" data-k="${k}"><circle cx="${x}" cy="${y}" r="30"/><text x="${x}" y="${y + 4}" text-anchor="middle">${k + 1}</text></g>`; }).join('')}
      <circle class="al-dot" r="8" cx="${pos(0)[0]}" cy="${pos(0)[1]}"/>
      <text x="${cx}" y="${cy - 4}" text-anchor="middle" class="al-c">${esc(L(T('Harness', 'Harnais')))}</text>
      <text x="${cx}" y="${cy + 14}" text-anchor="middle" class="al-c small">${esc(L(T('runs the loop', 'fait tourner la boucle')))}</text>
    </svg><ol class="al-legend">${nodes.map((n, k) => `<li data-k="${k}">${esc(L(n))}</li>`).join('')}</ol></div>
    <div class="al-budget"><span class="small">${esc(L(T('Budget left', 'Budget restant')))}</span><div class="bar"><i class="al-b" style="width:100%"></i></div></div>
    <ol class="al-log small"></ol>`,
    [{ id: 'play', label: PLAY }, { id: 'step', label: STEP }, { id: 'reset', label: RESET }]);
  const dot = stage.querySelector('.al-dot'), log = stage.querySelector('.al-log'), bud = stage.querySelector('.al-b');
  let i = 0;
  const step = () => {
    const ev = run.events[i]; if (!ev) { lp.stop(); return; }
    const [x, y] = pos(ev.n);
    dot.setAttribute('cx', x); dot.setAttribute('cy', y);
    stage.querySelectorAll('.al-node,.al-legend li').forEach(n => n.classList.toggle('on', +n.dataset.k === ev.n));
    const li = document.createElement('li'); li.innerHTML = esc(ev.t) + (ev.stop ? ` <span class="pill good">${esc(L(T('stop', 'arrêt')))}</span>` : ''); log.appendChild(li);
    if (!ctx.reduced) li.animate([{ opacity: 0, transform: 'translateX(-6px)' }, { opacity: 1, transform: 'none' }], { duration: 200, easing: 'cubic-bezier(0.23,1,0.32,1)' });
    bud.style.width = `${Math.max(0, 100 - (ev.cost || 0))}%`;
    i++;
  };
  const lp = ticker(step, 1100, ctx);
  const reset = () => { lp.stop(); i = 0; log.innerHTML = ''; bud.style.width = '100%'; stage.querySelectorAll('.on').forEach(n => n.classList.remove('on')); const [x, y] = pos(0); dot.setAttribute('cx', x); dot.setAttribute('cy', y); };
  const off = onCtl(el, { play: b => { if (lp.on) { lp.stop(); b.textContent = L(PLAY); } else { lp.play(); b.textContent = L(PAUSE); } }, step: () => { lp.stop(); step(); }, reset });
  return () => { lp.stop(); off(); };
}

/* ---------- pipeline: one or more lanes of steps, optional loop (training, waterfall vs agile, DMAIC) */
function pipeline(el, sc, ctx) {
  const L = ctx.L;
  const stage = frame(el, ctx, sc.lanes.map((ln, li) => `<div class="pl-lane" data-l="${li}"><div class="pl-h"><b>${esc(L(ln.label))}</b>${ln.loop ? `<span class="pill plain">${esc(L(T('repeats', 'se répète')))}</span>` : ''}</div>
    <div class="pl-steps">${ln.steps.map((s, k) => `<div class="pl-step" data-k="${k}"><span class="mono">${k + 1}</span>${esc(L(s))}</div>`).join('<i class="pl-arrow" aria-hidden="true">→</i>')}</div>
    ${ln.note ? `<p class="small muted">${esc(L(ln.note))}</p>` : ''}</div>`).join(''),
    [{ id: 'play', label: PLAY }, { id: 'reset', label: RESET }]);
  const lanes = [...stage.querySelectorAll('.pl-lane')];
  const pos = sc.lanes.map(() => -1), laps = sc.lanes.map(() => 0);
  const step = () => {
    let any = false;
    sc.lanes.forEach((ln, li) => {
      const n = ln.steps.length;
      if (pos[li] >= n - 1 && !ln.loop) return;
      any = true;
      pos[li] = (pos[li] + 1) % n; if (pos[li] === 0 && ln.loop && laps[li]++ > 2) { pos[li] = n - 1; return; }
      lanes[li].querySelectorAll('.pl-step').forEach((s, k) => { s.classList.toggle('on', k === pos[li]); s.classList.toggle('done', k < pos[li]); });
    });
    if (!any) pl.stop();
  };
  const pl = ticker(step, sc.ms || 900, ctx);
  const reset = () => { pl.stop(); pos.fill(-1); laps.fill(0); stage.querySelectorAll('.pl-step').forEach(s => s.classList.remove('on', 'done')); };
  const off = onCtl(el, { play: b => { if (pl.on) { pl.stop(); b.textContent = L(PLAY); } else { pl.play(); b.textContent = L(PAUSE); } }, reset });
  return () => { pl.stop(); off(); };
}

/* ---------- structures: functional / matrix / projectized */
function structures(el, sc, ctx) {
  const L = ctx.L;
  const modes = {
    functional: { label: T('Functional', 'Fonctionnelle'), auth: 20, note: T('Staff report only to their department head. The PM coordinates but has little authority.', 'Le personnel dépend seulement de son chef de service. Le CP coordonne mais a peu d’autorité.') },
    matrix: { label: T('Matrix', 'Matricielle'), auth: 55, note: T('Staff report to their department head AND to the PM for project work: two bosses, shared authority.', 'Le personnel dépend du chef de service ET du CP pour le projet : deux chefs, autorité partagée.') },
    project: { label: T('Projectized', 'Par projet'), auth: 90, note: T('Teams are built around projects. The PM has most of the authority over people and budget.', 'Les équipes sont construites autour des projets. Le CP a l’essentiel de l’autorité sur les personnes et le budget.') }
  };
  const depts = [T('Marketing', 'Marketing'), T('Operations', 'Opérations'), T('Finance', 'Finance')];
  const stage = frame(el, ctx, `<div class="seg st-seg" role="group">${Object.entries(modes).map(([k, m]) => `<button type="button" data-mode="${k}" aria-pressed="${k === 'functional'}">${esc(L(m.label))}</button>`).join('')}</div>
    <svg viewBox="0 0 340 220" class="st-svg" role="img" aria-label="Organisation chart">
      <rect x="140" y="10" width="60" height="26" rx="6" class="st-box"/><text x="170" y="27" text-anchor="middle">CEO</text>
      ${depts.map((d, k) => `<rect x="${20 + k * 110}" y="62" width="90" height="26" rx="6" class="st-box"/><text x="${65 + k * 110}" y="79" text-anchor="middle">${esc(L(d))}</text><line x1="170" y1="36" x2="${65 + k * 110}" y2="62" class="st-ln"/>`).join('')}
      <rect x="110" y="182" width="120" height="28" rx="6" class="st-pm"/><text x="170" y="200" text-anchor="middle" class="st-pmt">${esc(L(T('Project manager', 'Chef de projet')))}</text>
      ${depts.map((_, k) => [0, 1].map(j => `<g class="st-p" data-k="${k}" style="transform:translate(${50 + k * 110 + j * 30}px,120px)"><line x1="0" y1="-32" x2="0" y2="-10" class="st-ln up"/><line x1="0" y1="10" x2="${170 - (50 + k * 110 + j * 30)}" y2="62" class="st-ln pm"/><circle r="9"/></g>`).join('')).join('')}
    </svg>
    <div class="row between small"><span>${esc(L(T('PM authority', 'Autorité du CP')))}</span><span class="mono st-a"></span></div><div class="bar"><i class="st-bar"></i></div><p class="small st-note"></p>`);
  const set = k => {
    const m = modes[k];
    stage.querySelectorAll('[data-mode]').forEach(b => b.setAttribute('aria-pressed', b.dataset.mode === k));
    stage.querySelector('.st-svg').dataset.mode = k;
    stage.querySelector('.st-bar').style.width = m.auth + '%'; stage.querySelector('.st-a').textContent = m.auth >= 80 ? L(T('high', 'forte')) : m.auth >= 50 ? L(T('shared', 'partagée')) : L(T('low', 'faible'));
    stage.querySelector('.st-note').textContent = L(m.note);
  };
  const h = e => { const b = e.target.closest('[data-mode]'); if (b) set(b.dataset.mode); };
  el.addEventListener('click', h); set('functional');
  return () => el.removeEventListener('click', h);
}

/* ---------- 3D: orbit of phases (project life cycle) */
function orbit3d(el, sc, ctx) {
  const L = ctx.L, phases = sc.phases;
  const stage = frame(el, ctx, `<div class="o3-wrap"><canvas class="o3" aria-hidden="true"></canvas><div class="o3-labels"></div></div><div class="o3-info"><b class="o3-t"></b><p class="small o3-d"></p></div>`,
    [{ id: 'prev', label: T('Previous', 'Précédente') }, { id: 'next', label: T('Next phase', 'Phase suivante') }]);
  let cur = 0, stopped = false, cleanup3 = () => {};
  const info = () => { stage.querySelector('.o3-t').textContent = `${cur + 1}. ${L(phases[cur].t)}`; stage.querySelector('.o3-d').textContent = L(phases[cur].d); };
  info();
  const fallback2d = () => {
    const wrap = stage.querySelector('.o3-wrap');
    wrap.innerHTML = `<svg viewBox="0 0 320 220" class="o2" role="img" aria-label="Life cycle"><ellipse cx="160" cy="110" rx="130" ry="70" class="al-ring"/>${phases.map((p, k) => { const a = -Math.PI / 2 + k * 2 * Math.PI / phases.length; return `<g class="al-node" data-k="${k}"><circle cx="${160 + 130 * Math.cos(a)}" cy="${110 + 70 * Math.sin(a)}" r="22"/><text x="${160 + 130 * Math.cos(a)}" y="${114 + 70 * Math.sin(a)}" text-anchor="middle">${k + 1}</text></g>`; }).join('')}<text x="160" y="114" text-anchor="middle" class="al-c">${esc(L(T('Project', 'Projet')))}</text></svg>`;
    const mark = () => wrap.querySelectorAll('.al-node').forEach(n => n.classList.toggle('on', +n.dataset.k === cur));
    mark(); return mark;
  };
  let mark = null;
  if (ctx.saver || !webgl()) mark = fallback2d();
  else loadThree().then(THREE => {
    if (stopped) return;
    const canvas = stage.querySelector('.o3'), wrap = stage.querySelector('.o3-wrap'), lab = stage.querySelector('.o3-labels');
    const W = () => wrap.clientWidth, H = () => Math.round(wrap.clientWidth * 0.62);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true }); renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(40, 1.6, 0.1, 100); cam.position.set(0, 4.2, 9); cam.lookAt(0, 0, 0);
    scene.add(new THREE.AmbientLight(0xffffff, 0.55)); const dl = new THREE.DirectionalLight(0xffffff, 0.9); dl.position.set(3, 6, 5); scene.add(dl);
    const acc = new THREE.Color(tok('--accent')), ink = new THREE.Color(tok('--muted'));
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.9, 48, 32), new THREE.MeshStandardMaterial({ color: acc, roughness: 0.35, metalness: 0.1 })); scene.add(core);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(3.4, 0.02, 8, 160), new THREE.MeshBasicMaterial({ color: ink })); ring.rotation.x = Math.PI / 2; scene.add(ring);
    const moons = phases.map((p, k) => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.42, 32, 24), new THREE.MeshStandardMaterial({ color: ink, roughness: 0.5 })); scene.add(m); return m; });
    lab.innerHTML = phases.map((p, k) => `<span data-k="${k}">${esc(L(p.t))}</span>`).join('');
    const labels = [...lab.children];
    let rot = 0, target = 0, raf = 0, drag = null;
    const resize = () => { renderer.setSize(W(), H(), false); canvas.style.height = H() + 'px'; cam.aspect = W() / H(); cam.updateProjectionMatrix(); };
    resize(); const ro = new ResizeObserver(resize); ro.observe(wrap);
    const loop = () => {
      rot += (target - rot) * (ctx.reduced ? 1 : 0.08);
      if (!drag && !ctx.reduced) target += 0.0015;
      moons.forEach((m, k) => {
        const a = rot + k * 2 * Math.PI / phases.length; m.position.set(3.4 * Math.cos(a), 0, 3.4 * Math.sin(a));
        const on = k === cur; m.material.color.copy(on ? acc : ink); m.scale.setScalar(on ? 1.35 : 1);
        const v = m.position.clone().project(cam); const l = labels[k];
        l.style.transform = `translate(${(v.x * 0.5 + 0.5) * W()}px, ${(-v.y * 0.5 + 0.5) * H() - 30}px) translateX(-50%)`; l.classList.toggle('on', on);
      });
      core.rotation.y += ctx.reduced ? 0 : 0.004;
      renderer.render(scene, cam); raf = requestAnimationFrame(loop);
    };
    loop();
    const down = e => { drag = { x: e.clientX, t: target }; canvas.setPointerCapture?.(e.pointerId); };
    const move = e => { if (drag) target = drag.t + (e.clientX - drag.x) * 0.01; };
    const up = () => { drag = null; };
    canvas.addEventListener('pointerdown', down); canvas.addEventListener('pointermove', move); canvas.addEventListener('pointerup', up);
    mark = () => { target = -Math.PI / 2 - cur * 2 * Math.PI / phases.length + Math.PI; };
    mark();
    cleanup3 = () => { cancelAnimationFrame(raf); ro.disconnect(); renderer.dispose(); };
  }).catch(() => { mark = fallback2d(); });
  const go = d => { cur = (cur + d + phases.length) % phases.length; info(); mark && mark(); };
  const off = onCtl(el, { prev: () => go(-1), next: () => go(1) });
  return () => { stopped = true; off(); cleanup3(); };
}

/* ---------- 3D: scope / time / cost prism; thickness = quality */
function prism3d(el, sc, ctx) {
  const L = ctx.L;
  const stage = frame(el, ctx, `<div class="o3-wrap"><canvas class="o3" aria-hidden="true"></canvas><div class="pz-2d"></div></div>
    <div class="pz-ctl">${['scope', 'time', 'cost'].map(k => `<label class="field small">${esc(L({ scope: T('Scope', 'Périmètre'), time: T('Time', 'Temps'), cost: T('Cost', 'Coût') }[k]))}<input type="range" min="1" max="10" value="5" data-pz="${k}"></label>`).join('')}</div>
    <p class="small pz-msg"></p>`);
  const v = { scope: 5, time: 5, cost: 5 };
  const quality = () => Math.max(0.15, Math.min(2, ((v.time + v.cost) / 2) / v.scope));
  const msg = stage.querySelector('.pz-msg');
  let update3 = () => {};
  const update = () => {
    const q = quality();
    msg.className = 'small pz-msg ' + (q < 0.75 ? 'bad' : q > 1.3 ? 'info' : 'good');
    msg.textContent = q < 0.75 ? L(T('Scope outgrew time and cost: quality gets squeezed. Add time or budget, or cut scope.', 'Le périmètre dépasse le temps et le budget : la qualité est écrasée. Ajoutez du temps ou du budget, ou réduisez le périmètre.'))
      : q > 1.3 ? L(T('Plenty of time and budget for this scope: room to raise quality or add scope.', 'Beaucoup de temps et de budget pour ce périmètre : de la marge pour la qualité ou plus de périmètre.'))
        : L(T('Balanced: scope, time and cost support the agreed quality.', 'Équilibré : périmètre, temps et coût soutiennent la qualité convenue.'));
    update3(q);
  };
  const inputs = stage.querySelectorAll('[data-pz]');
  const hi = e => { v[e.target.dataset.pz] = +e.target.value; update(); };
  inputs.forEach(i => i.addEventListener('input', hi));
  let stopped = false, cleanup3 = () => {};
  const flat = () => {
    const box = stage.querySelector('.pz-2d'); stage.querySelector('.o3').hidden = true;
    update3 = q => { const s = v.scope * 12, t = v.time * 12, c = v.cost * 12; box.innerHTML = `<svg viewBox="0 0 300 200" role="img" aria-label="Triangle"><polygon points="${150},${100 - s} ${150 - t},${100 + t * 0.6} ${150 + c},${100 + c * 0.6}" class="pz-poly" style="stroke-width:${2 + q * 6}"/><text x="150" y="${92 - s}" text-anchor="middle">${esc(L(T('Scope', 'Périmètre')))}</text><text x="${150 - t}" y="${118 + t * 0.6}" text-anchor="middle">${esc(L(T('Time', 'Temps')))}</text><text x="${150 + c}" y="${118 + c * 0.6}" text-anchor="middle">${esc(L(T('Cost', 'Coût')))}</text></svg>`; };
    update();
  };
  if (ctx.saver || !webgl()) flat();
  else loadThree().then(THREE => {
    if (stopped) return;
    const canvas = stage.querySelector('.o3'), wrap = stage.querySelector('.o3-wrap');
    const W = () => wrap.clientWidth, H = () => Math.round(wrap.clientWidth * 0.62);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true }); renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(38, 1.6, 0.1, 100); cam.position.set(0, 2.5, 9); cam.lookAt(0, 0.3, 0);
    scene.add(new THREE.AmbientLight(0xffffff, 0.6)); const dl = new THREE.DirectionalLight(0xffffff, 0.9); dl.position.set(4, 6, 6); scene.add(dl);
    const good = new THREE.Color(tok('--good')), bad = new THREE.Color(tok('--bad')), acc = new THREE.Color(tok('--accent'));
    const mat = new THREE.MeshStandardMaterial({ color: acc, roughness: 0.4, transparent: true, opacity: 0.92 });
    let mesh = null, raf = 0, ry = 0.5, drag = null;
    update3 = q => {
      if (mesh) { scene.remove(mesh); mesh.geometry.dispose(); }
      const s = v.scope * 0.28, t = v.time * 0.28, c = v.cost * 0.28;
      const shape = new THREE.Shape(); shape.moveTo(0, s); shape.lineTo(-t, -t * 0.6); shape.lineTo(c, -c * 0.6); shape.lineTo(0, s);
      const geo = new THREE.ExtrudeGeometry(shape, { depth: q * 1.6, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05, bevelSegments: 2 }); geo.center();
      mesh = new THREE.Mesh(geo, mat); scene.add(mesh);
      mat.color.copy(q < 0.75 ? bad : q > 1.3 ? acc : good);
    };
    const resize = () => { renderer.setSize(W(), H(), false); canvas.style.height = H() + 'px'; cam.aspect = W() / H(); cam.updateProjectionMatrix(); };
    resize(); const ro = new ResizeObserver(resize); ro.observe(wrap);
    update();
    const loop = () => { if (mesh) { if (!drag && !ctx.reduced) ry += 0.004; mesh.rotation.y = ry; mesh.rotation.x = 0.25; } renderer.render(scene, cam); raf = requestAnimationFrame(loop); };
    loop();
    canvas.addEventListener('pointerdown', e => { drag = { x: e.clientX, r: ry }; });
    canvas.addEventListener('pointermove', e => { if (drag) ry = drag.r + (e.clientX - drag.x) * 0.01; });
    canvas.addEventListener('pointerup', () => { drag = null; });
    cleanup3 = () => { cancelAnimationFrame(raf); ro.disconnect(); renderer.dispose(); };
  }).catch(flat);
  return () => { stopped = true; inputs.forEach(i => i.removeEventListener('input', hi)); cleanup3(); };
}

/* ---------- grid: 2x2 power-interest (or any 2-axis) grid */
function grid(el, sc, ctx) {
  const L = ctx.L;
  const q = sc.quads; // order: top-left, top-right, bottom-left, bottom-right
  const stage = frame(el, ctx, `<div class="gr-wrap"><span class="gr-y mono">${esc(L(sc.axes.y))} ↑</span>
    <div class="gr">${q.map((t, k) => `<div class="gr-q" data-q="${k}"><span>${esc(L(t))}</span></div>`).join('')}
    ${sc.items.map((it, k) => `<i class="gr-dot${it.x > .55 ? ' l' : ''}" data-i="${k}" style="left:${it.x * 100}%;top:${(1 - it.y) * 100}%"><b>${esc(L(it.t))}</b></i>`).join('')}</div>
    <span class="gr-x mono">${esc(L(sc.axes.x))} →</span></div>
    <div class="gr-tray">${sc.items.map((it, k) => `<button type="button" class="chip" data-i="${k}">${esc(L(it.t))}</button>`).join('')}</div>
    <p class="small gr-note" aria-live="polite"></p>`, [{ id: 'all', label: T('Place all', 'Tout placer') }, { id: 'reset', label: RESET }]);
  const quad = it => (it.y >= .5 ? 0 : 2) + (it.x >= .5 ? 1 : 0);
  const place = k => {
    const it = sc.items[k];
    stage.querySelectorAll('.gr-dot').forEach(d => d.classList.toggle('cur', +d.dataset.i === k));
    stage.querySelector(`.gr-dot[data-i="${k}"]`).classList.add('on');
    stage.querySelector(`.chip[data-i="${k}"]`).setAttribute('aria-pressed', 'true');
    stage.querySelectorAll('.gr-q').forEach(e => e.classList.toggle('hi', +e.dataset.q === quad(it)));
    stage.querySelector('.gr-note').textContent = `${L(it.t)} → ${L(q[quad(it)])}`;
  };
  const reset = () => { stage.querySelectorAll('.gr-dot').forEach(d => d.classList.remove('on')); stage.querySelectorAll('.chip').forEach(c => c.removeAttribute('aria-pressed')); stage.querySelectorAll('.gr-q').forEach(e => e.classList.remove('hi')); stage.querySelector('.gr-note').textContent = ''; };
  const timers = [];
  const all = () => { reset(); sc.items.forEach((_, k) => timers.push(setTimeout(() => place(k), ctx.reduced ? 0 : k * 220))); };
  const h = e => { const c = e.target.closest('.chip,.gr-dot'); if (c) place(+c.dataset.i); };
  el.addEventListener('click', h);
  const off = onCtl(el, { all, reset });
  return () => { timers.forEach(clearTimeout); el.removeEventListener('click', h); off(); };
}

/* ---------- cpm: mini Gantt with critical path; tap a task to delay it */
function cpm(el, sc, ctx) {
  const L = ctx.L, tasks = sc.tasks, extra = {};
  const calc = () => {
    const es = {}, ef = {}, by = Object.fromEntries(tasks.map(t => [t.id, t]));
    const dur = t => t.d + (extra[t.id] || 0);
    const done = new Set();
    while (done.size < tasks.length) tasks.forEach(t => { if (done.has(t.id) || !t.after.every(a => done.has(a))) return; es[t.id] = Math.max(0, ...t.after.map(a => ef[a])); ef[t.id] = es[t.id] + dur(t); done.add(t.id); });
    const end = Math.max(...tasks.map(t => ef[t.id]));
    const ls = {}, lf = {};
    const order = [...tasks].sort((a, b) => ef[b.id] - ef[a.id]);
    const succ = id => tasks.filter(t => t.after.includes(id));
    const fin = new Set();
    while (fin.size < tasks.length) order.forEach(t => { if (fin.has(t.id) || !succ(t.id).every(x => fin.has(x.id))) return; lf[t.id] = Math.min(end, ...succ(t.id).map(x => ls[x.id])); ls[t.id] = lf[t.id] - dur(t); fin.add(t.id); });
    return { es, ef, end, fl: Object.fromEntries(tasks.map(t => [t.id, ls[t.id] - es[t.id]])), by, dur };
  };
  const base = calc().end;
  const stage = frame(el, ctx, `<div class="cp" role="list">${tasks.map(t => `<button type="button" class="cp-row" role="listitem" data-id="${t.id}"><span class="cp-l"><b class="mono">${t.id}</b> ${esc(L(t.t))}</span><span class="cp-track"><i class="cp-bar"><em class="cp-x"></em></i></span><span class="cp-f mono small"></span></button>`).join('')}</div>
    <div class="row between small"><span>${esc(L(T('Launch day', 'Jour du lancement')))}: <b class="mono cp-end"></b></span><span class="cp-d mono"></span></div><p class="small cp-note" aria-live="polite"></p>`,
    [{ id: 'reset', label: RESET }]);
  const draw = (hit) => {
    const r = calc(), W = Math.max(r.end, base) + 1;
    tasks.forEach(t => {
      const row = stage.querySelector(`.cp-row[data-id="${t.id}"]`), bar = row.querySelector('.cp-bar');
      bar.style.left = (r.es[t.id] / W * 100) + '%'; bar.style.width = (r.dur(t) / W * 100) + '%';
      bar.querySelector('.cp-x').style.width = ((extra[t.id] || 0) / r.dur(t) * 100) + '%';
      row.classList.toggle('crit', r.fl[t.id] === 0);
      row.querySelector('.cp-f').textContent = r.fl[t.id] === 0 ? L(T('critical', 'critique')) : `${L(T('float', 'marge'))} ${r.fl[t.id]}`;
    });
    stage.querySelector('.cp-end').textContent = r.end;
    const d = r.end - base; stage.querySelector('.cp-d').textContent = d ? `+${d} ${L(sc.unit)}${d > 1 ? 's' : ''}` : '';
    if (hit) { const t = r.by[hit]; stage.querySelector('.cp-note').textContent = r.end > hit._prev ? `${L(t.t)} +1 → ${L(T('the launch moves', 'le lancement recule'))}` : `${L(t.t)} +1 → ${L(T('absorbed by float', 'absorbé par la marge'))}`; }
  };
  const h = e => { const b = e.target.closest('.cp-row'); if (!b) return; const prev = calc().end; extra[b.dataset.id] = (extra[b.dataset.id] || 0) + 1; const id = b.dataset.id; const r = calc(); draw(); stage.querySelector('.cp-note').textContent = `${L(r.by[id].t)} +1 → ${r.end > prev ? L(T('the launch moves', 'le lancement recule')) : L(T('absorbed by float', 'absorbé par la marge'))}`; };
  el.addEventListener('click', h);
  const off = onCtl(el, { reset: () => { Object.keys(extra).forEach(k => delete extra[k]); draw(); stage.querySelector('.cp-note').textContent = ''; } });
  draw();
  return () => { el.removeEventListener('click', h); off(); };
}

/* ---------- kanban: flow with and without a WIP limit */
function kanban(el, sc, ctx) {
  const L = ctx.L, N = sc.cards.length, NEED = 2;
  let wip = true, cards, t, first;
  const stage = frame(el, ctx, `<div class="kb">${sc.cols.map((c, k) => `<div class="kb-col" data-c="${k}"><b class="small">${esc(L(c))}<span class="mono kb-n"></span></b><div class="kb-cards"></div></div>`).join('')}</div>
    <div class="row between small"><span class="mono kb-stat"></span><label class="kb-tog"><input type="checkbox" checked> ${esc(L(T('WIP limit 2 in Doing', 'Limite 2 en cours')))}</label></div><p class="small kb-note" aria-live="polite"></p>`,
    [{ id: 'step', label: STEP }, { id: 'play', label: PLAY }, { id: 'reset', label: RESET }]);
  const reset = () => { cards = sc.cards.map((c, i) => ({ i, col: 0, w: 0 })); t = 0; first = null; draw(); stage.querySelector('.kb-note').textContent = ''; };
  const step = () => {
    if (cards.every(c => c.col === 3)) { pl.stop(); return; }
    t++;
    const rev = cards.find(c => c.col === 2); if (rev) rev.col = 3;
    const doing = cards.filter(c => c.col === 1);
    doing.forEach(c => { c.w += 1 / doing.length; });
    doing.filter(c => c.w >= NEED - 1e-9).forEach(c => { c.col = 2; });
    const lim = wip ? 2 : Infinity;
    cards.filter(c => c.col === 0).forEach(c => { if (cards.filter(x => x.col === 1).length < lim) c.col = 1; });
    if (first === null && cards.some(c => c.col === 3)) first = t;
    draw();
    if (cards.every(c => c.col === 3)) { pl.stop(); const pb = stage.parentNode.querySelector('[data-sc="play"]'); if (pb) pb.textContent = L(PLAY); stage.querySelector('.kb-note').textContent = wip ? L(T('With the limit, the first page went live early and work flowed steadily.', 'Avec la limite, la première page est sortie tôt et le travail a circulé régulièrement.')) : L(T('Without the limit, everything was “in progress” for a long time and finished in a rush at the end.', 'Sans limite, tout est resté « en cours » longtemps et a fini en catastrophe à la fin.')); }
  };
  const draw = () => {
    stage.querySelectorAll('.kb-col').forEach(col => {
      const k = +col.dataset.c, inCol = cards.filter(c => c.col === k);
      col.querySelector('.kb-n').textContent = ` ${inCol.length}${k === 1 && wip ? '/2' : ''}`;
      col.querySelector('.kb-cards').innerHTML = inCol.map(c => `<span class="kb-card">${esc(L(sc.cards[c.i]))}${k === 1 ? `<i style="width:${Math.min(100, c.w / NEED * 100)}%"></i>` : ''}</span>`).join('');
    });
    const done = cards.filter(c => c.col === 3).length;
    stage.querySelector('.kb-stat').textContent = `${L(T('Step', 'Étape'))} ${t} · ${L(T('done', 'fait'))} ${done}/${N}${first ? ` · ${L(T('first done at step', '1re finie à l’étape'))} ${first}` : ''}`;
  };
  const pl = ticker(step, 700, ctx);
  const tog = stage.querySelector('.kb-tog input');
  const onTog = () => { wip = tog.checked; pl.stop(); reset(); const pb = el.querySelector('[data-sc="play"]'); if (pb) pb.textContent = L(PLAY); };
  tog.addEventListener('change', onTog);
  const off = onCtl(el, { step: () => { pl.stop(); step(); }, play: b => { if (pl.on) { pl.stop(); b.textContent = L(PLAY); } else { pl.play(); b.textContent = L(PAUSE); } }, reset: () => { pl.stop(); reset(); } });
  reset();
  return () => { pl.stop(); off(); tog.removeEventListener('change', onTog); };
}

const SCENES = { tokens, temperature, context, agentloop, pipeline, structures, orbit3d, prism3d, grid, cpm, kanban };
window.OrbitScenes = {
  mount(el, sc, ctx) { const f = SCENES[sc.type]; if (!f) { el.textContent = ''; return () => {}; } try { return f(el, sc, ctx) || (() => {}); } catch (e) { el.textContent = ''; return () => {}; } },
  is3d: sc => ['orbit3d', 'prism3d'].includes(sc?.type),
  THREE_URL
};
})();
