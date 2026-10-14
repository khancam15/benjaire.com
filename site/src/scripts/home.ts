// Homepage interactions. Everything here is enhancement: without this script
// the page shows all content and nothing moves. Nav behaviour lives in Nav.astro.
const root = document.documentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
const desktop = matchMedia('(min-width: 900px)');

// Hero load sequence: let the first frame paint, then settle the render and copy.
const ready = () => root.classList.add('ready');
requestAnimationFrame(() => requestAnimationFrame(ready));
setTimeout(ready, 120); // rAF is paused in background tabs

// Hero depth: the interface layer drifts against the render by a few pixels.
// The render itself never rotates; it is a flat image, not a 3D scene.
const hero = document.querySelector<HTMLElement>('.hero');
const ui = document.querySelector<HTMLElement>('.hero-ui');
if (hero && ui && finePointer && !reduce) {
  hero.addEventListener('pointermove', (e) => {
    if (!desktop.matches) return;
    const r = hero.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    ui.style.setProperty('--px', `${(x * -12).toFixed(1)}px`);
    ui.style.setProperty('--py', `${(y * -8).toFixed(1)}px`);
  });
  hero.addEventListener('pointerleave', () => { ui.style.setProperty('--px', '0px'); ui.style.setProperty('--py', '0px'); });
}

// Operating model: the sticky stage crossfades to the camera angle of the step in view.
const stage = document.querySelector<HTMLElement>('[data-stage]');
const stageLabel = document.querySelector<HTMLElement>('[data-stage-label]');
const steps = [...document.querySelectorAll<HTMLElement>('[data-step]')];
if (stage && steps.length) {
  const io = new IntersectionObserver((entries) => {
    for (const en of entries) {
      if (!en.isIntersecting) continue;
      const i = en.target.getAttribute('data-step') ?? '0';
      stage.dataset.active = i;
      const name = en.target.querySelector('h3')?.textContent ?? '';
      if (stageLabel) stageLabel.textContent = `${String(Number(i) + 1).padStart(2, '0')} · ${name}`;
    }
  }, { rootMargin: '-45% 0px -45% 0px' });
  steps.forEach((s) => io.observe(s));
}

// Focus areas: the active index row drives the annotation card.
const index = document.querySelector<HTMLElement>('[data-index]');
const fName = document.querySelector<HTMLElement>('[data-focus-name]');
const fText = document.querySelector<HTMLElement>('[data-focus-text]');
const fCount = document.querySelector<HTMLElement>('[data-focus-count]');
if (index) {
  const rows = [...index.querySelectorAll<HTMLElement>('li')];
  const activate = (row: HTMLElement) => {
    rows.forEach((r) => r.classList.toggle('on', r === row));
    const i = rows.indexOf(row);
    if (fName) fName.textContent = row.querySelector('h3')?.textContent ?? '';
    if (fText) fText.textContent = row.querySelector('p')?.textContent ?? '';
    if (fCount) fCount.textContent = `Category ${String(i + 1).padStart(2, '0')} / ${String(rows.length).padStart(2, '0')}`;
  };
  rows.forEach((r) => {
    r.addEventListener('pointerenter', () => activate(r));
    r.addEventListener('focus', () => activate(r));
  });
}
const tilt = document.querySelector<HTMLElement>('[data-tilt]');
const card = tilt?.querySelector<HTMLElement>('.focus-card');
if (tilt && card && finePointer && !reduce) {
  tilt.addEventListener('pointermove', (e) => {
    const r = tilt.getBoundingClientRect();
    card.style.setProperty('--ry', `${(((e.clientX - r.left) / r.width - 0.5) * 8).toFixed(2)}deg`);
    card.style.setProperty('--rx', `${(((e.clientY - r.top) / r.height - 0.5) * -6).toFixed(2)}deg`);
  });
  tilt.addEventListener('pointerleave', () => { card.style.setProperty('--ry', '0deg'); card.style.setProperty('--rx', '0deg'); });
}

// Section rail: marks the section in view; turns light over the dark band.
const rail = document.querySelector<HTMLElement>('.rail');
if (rail) {
  const marks = new Map([...rail.querySelectorAll<HTMLElement>('[data-rail]')].map((m) => [m.dataset.rail, m]));
  const io = new IntersectionObserver((entries) => {
    for (const en of entries) {
      if (!en.isIntersecting) continue;
      const id = (en.target as HTMLElement).dataset.section;
      marks.forEach((m, k) => m.classList.toggle('on', k === id));
      rail.classList.toggle('on-dark', id === 'partner');
    }
  }, { rootMargin: '-50% 0px -50% 0px' });
  document.querySelectorAll('[data-section]').forEach((s) => io.observe(s));
}
