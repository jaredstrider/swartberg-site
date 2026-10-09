(() => {
  const f = document.getElementById('book-embed');
  if (!f) return;
  const fig = f.closest('figure');
  // the embed is same-origin by design; a document opened from file:// has the origin 'null'
  const local = location.protocol === 'file:';
  const fromEmbed = ev => ev.source === f.contentWindow && (ev.origin === location.origin || (local && ev.origin === 'null'));
  let heard = false, timer = 0;
  addEventListener('message', ev => {
    if (!fromEmbed(ev) || !ev.data || !('swartbergEmbedHeight' in ev.data)) return;
    // any height message proves the frame is alive (a frame inside a hidden view reports 0 until the view is shown)
    heard = true; clearTimeout(timer); fig.classList.remove('unavailable');
    const h = Number(ev.data.swartbergEmbedHeight);
    if (h >= 200 && h <= 6000) f.style.height = (h + 8) + 'px';
  });
  // ask the frame for its height: it answers once its script runs, so a message posted before this listener
  // existed is not lost
  const ping = () => { try { f.contentWindow.postMessage({ swartbergEmbedPing: true }, local ? '*' : location.origin); } catch (e) {} };
  f.addEventListener('load', () => {
    ping();
    clearTimeout(timer);
    timer = setTimeout(() => { if (!heard) fig.classList.add('unavailable'); }, 10000);
  });
  f.addEventListener('error', () => fig.classList.add('unavailable'));
  window.swartbergEmbedPing = ping;   // the internal site's router asks again when its home view is shown
  ping();
})();
