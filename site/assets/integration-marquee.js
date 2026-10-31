/* A progressive enhancement, independent from the four workflow controllers. */
(() => {
  const root = document.querySelector('[data-brand-marquee]');
  if (!root) return;
  const track = root.querySelector('.brand-track');
  const original = root.querySelector('.brand-set');
  const button = root.querySelector('.brand-toggle');
  const clone = original.cloneNode(true);
  clone.removeAttribute('aria-labelledby');
  clone.setAttribute('aria-hidden', 'true');
  clone.setAttribute('inert', '');
  track.append(clone);
  root.classList.add('is-enhanced');
  let localPaused = false;
  function paintControl() {
    const english = document.documentElement.lang === 'en';
    const globalPaused = document.body.classList.contains('is-paused');
    const stopped = localPaused || globalPaused;
    root.classList.toggle('is-local-paused', localPaused);
    button.setAttribute('aria-pressed', String(stopped));
    // A global stop always wins; don't show an ineffective "resume" action.
    button.disabled = globalPaused;
    button.setAttribute('aria-label', globalPaused
      ? (english ? 'Brand marquee paused by global motion control' : '品牌走馬燈已由全站動畫控制暫停')
      : stopped
        ? (english ? 'Resume brand marquee' : '播放品牌走馬燈')
        : (english ? 'Pause brand marquee' : '暫停品牌走馬燈'));
    button.querySelector('[data-brand-icon]').textContent = stopped ? '▷' : 'Ⅱ';
  }
  button.addEventListener('click', () => { localPaused = !localPaused; paintControl(); });
  new MutationObserver(paintControl).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  new MutationObserver(paintControl).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  if ('IntersectionObserver' in window) {
    root.classList.add('is-offscreen');
    new IntersectionObserver(entries => {
      root.classList.toggle('is-offscreen', !entries[0].isIntersecting);
    }).observe(root);
  }
  paintControl();
  button.hidden = false;
})();
