(() => {
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
