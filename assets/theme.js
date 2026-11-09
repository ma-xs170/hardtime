(() => {

  // Scroll reveal + staggered children (skipped when reduced motion)
  const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!calm && 'IntersectionObserver' in window) {
    const groups = ['.trust', '.grid', '.tiles', '.collection-tiles'];
    document.querySelectorAll('.section .section__head, .section .section__title, .split__text, .split__media, .newsletter .container').forEach((el) => el.setAttribute('data-reveal', ''));
    document.querySelectorAll(groups.join(',')).forEach((g) => {
      Array.from(g.children).forEach((c, i) => { c.setAttribute('data-reveal', ''); c.style.setProperty('--d', (i % 6) * 80 + 'ms'); });
    });
    const items = document.querySelectorAll('[data-reveal]');
    document.documentElement.classList.add('js-reveal');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach((el) => io.observe(el));
  }

  // Hero dial: live local time
  const dial = document.querySelector('[data-dial]');
  if (dial) {
    const h = dial.querySelector('[data-hand="h"]');
    const m = dial.querySelector('[data-hand="m"]');
    const sec = dial.querySelector('[data-hand="s"]');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const rot = (el, deg) => el.setAttribute('transform', 'rotate(' + deg + ' 100 100)');
    const tick = () => {
      const d = new Date();
      const s = d.getSeconds();
      const min = d.getMinutes() + s / 60;
      rot(h, ((d.getHours() % 12) + min / 60) * 30);
      rot(m, min * 6);
      rot(sec, s * 6);
    };
    tick();
    if (reduce) { sec.setAttribute('display', 'none'); setInterval(tick, 60000); }
    else setInterval(tick, 1000);
  }

  // Mobile menu
  const toggle = document.querySelector('[data-menu-toggle]');
  const nav = document.querySelector('[data-nav]');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { nav.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); }
    });
  }

  // Collection: sort + filters
  const sort = document.querySelector('[data-sort]');
  if (sort) {
    sort.addEventListener('change', () => {
      const url = new URL(window.location.href);
      url.searchParams.set('sort_by', sort.value);
      url.searchParams.delete('page');
      window.location.href = url.toString();
    });
  }
  const filters = document.querySelector('[data-filters]');
  if (filters) {
    filters.addEventListener('change', () => {
      const url = new URL(window.location.href);
      [...url.searchParams.keys()].filter((k) => k.startsWith('filter.')).forEach((k) => url.searchParams.delete(k));
      url.searchParams.delete('page');
      new FormData(filters).forEach((v, k) => { if (v !== '') url.searchParams.append(k, v); });
      window.location.href = url.toString();
    });
  }

  // Product: variant selection + add to cart
  document.querySelectorAll('[data-product]').forEach((root) => {
    const data = root.querySelector('[data-variants]');
    const form = root.querySelector('[data-product-form]');
    if (!data || !form) return;
    const variants = JSON.parse(data.textContent);
    const idInput = form.querySelector('[data-variant-id]');
    const addBtn = form.querySelector('[data-add]');
    const addLabel = addBtn.textContent.trim();

    const selected = () => [...form.querySelectorAll('[data-option]')].map((fs) => {
      const checked = fs.querySelector('input:checked');
      return checked ? checked.value : null;
    });

    form.addEventListener('change', () => {
      const opts = selected();
      const v = variants.find((x) => x.options.every((o, i) => o === opts[i]));
      if (!v) { addBtn.disabled = true; return; }
      idInput.value = v.id;
      addBtn.disabled = !v.available;
      addBtn.textContent = v.available ? addLabel : addBtn.dataset.soldOut || addBtn.textContent;
      const url = new URL(window.location.href);
      url.searchParams.set('variant', v.id);
      history.replaceState({}, '', url);
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      addBtn.disabled = true;
      try {
        const res = await fetch(window.Shopify.routes.root + 'cart/add.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ items: [{ id: Number(idInput.value), quantity: 1 }] }),
        });
        if (!res.ok) throw new Error('add failed');
        window.location.href = window.Shopify.routes.root + 'cart';
      } catch (err) {
        addBtn.disabled = false;
        form.submit();
      }
    });
  });
})();
