'use strict';
(() => {
  document.documentElement.classList.add('js');
  const $ = id => document.getElementById(id);
  const labels = {work: '館藏作品', note: '知識筆記', source: '來源紀錄', application: '應用方案'};
  const verification = {partial: '部分查核', verified: '已查核（範圍見正文）', disputed: '證據有分歧', unverified: '未查核'};
  const statusLabels = {draft:'草稿',superseded:'已被取代',retired:'已停用',candidate:'候選提案',planned:'已規劃','in-use':'使用中',completed:'已完成執行'};
  const make = (tag, text, cls) => {const node = document.createElement(tag); if (text != null) node.textContent = text; if (cls) node.className = cls; return node;};
  const normal = text => String(text).normalize('NFKC').toLowerCase().replaceAll('臺','台').replaceAll('基本薪資','最低工資').replaceAll('基本工資','最低工資');
  const groups = [['基本薪資','基本工資','最低工資'],['api key','api_key'],['台灣','臺灣']];
  const scripts = new Map();
  function loadData(file, globalName) {
    if (window[globalName]) return Promise.resolve(window[globalName]);
    if (scripts.has(file)) return scripts.get(file);
    const promise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      const version = document.querySelector('script[src*="reader.js"]')?.src.split('?')[1] || '';
      script.src = 'assets/' + file + (version ? '?' + version : '');
      script.onload = () => {
        if (window[globalName]) resolve(window[globalName]);
        else {script.remove(); scripts.delete(file); reject(new Error('missing data'));}
      };
      script.onerror = () => {script.remove(); scripts.delete(file); reject(new Error('load failed'));};
      document.head.append(script);
    });
    scripts.set(file, promise);
    return promise;
  }
  if ($('menu-toggle')) {
    $('menu-toggle').hidden = false;
    $('menu-toggle').addEventListener('click', () => {
      const open = $('menu-toggle').getAttribute('aria-expanded') !== 'true';
      $('menu-toggle').setAttribute('aria-expanded', String(open));
      $('sidebar').classList.toggle('open', open);
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && $('sidebar').classList.contains('open')) {
        $('sidebar').classList.remove('open'); $('menu-toggle').setAttribute('aria-expanded','false'); $('menu-toggle').focus();
      }
    });
  }
  if ($('reading-size')) {
    document.querySelector('.reading-tools').hidden = false;
    const sizes = {normal:'18px',large:'21px',larger:'24px'};
    const apply = value => {document.documentElement.style.setProperty('--text-size',sizes[value] || sizes.normal); $('reading-size').value = value in sizes ? value : 'normal';};
    try {apply(localStorage.getItem('kb-reading-size') || 'normal');} catch (_) {apply('normal');}
    $('reading-size').addEventListener('change', e => {apply(e.target.value); try {localStorage.setItem('kb-reading-size',e.target.value);} catch (_) { /* Reading remains available when storage is blocked. */ }});
    $('print-page').addEventListener('click', () => window.print());
    if (window.matchMedia('(max-width:1150px)').matches) document.querySelector('.toc')?.removeAttribute('open');
    document.querySelector('.back-to-toc')?.addEventListener('click', () => {
      document.querySelector('.toc')?.setAttribute('open','');
    });
  }
  const dialog = $('source-dialog');
  let previewGeneration = 0;
  document.addEventListener('click', async e => {
    const link = e.target.closest('a[data-source]');
    if (!link || e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || !dialog?.showModal) return;
    e.preventDefault();
    const generation = ++previewGeneration;
    $('source-title').textContent = '載入來源…'; $('source-summary').textContent = '';
    $('source-meta').replaceChildren(); $('source-open').href = link.href;
    if (!dialog.open) dialog.showModal();
    try {
      const data = await loadData('source-data.js','KB_SOURCE_DATA');
      if (generation !== previewGeneration || !dialog.open) return;
      const source = data.find(item => item.id === link.dataset.source);
      if (!source) throw new Error('source unavailable');
      $('source-title').textContent = source.title;
      $('source-summary').textContent = source.summary;
      for (const [key,value] of [['來源分級',source.evidence || '尚未分級'],['採用界線',source.evidenceUse || '尚未記錄'],['取得範圍',source.scope],['完整性',source.completeness],['查核狀態',source.verification],['來源日期',source.sourceDate],['最後查核',source.verified]]) {
        $('source-meta').append(make('dt',key),make('dd',value));
      }
      // Keep the citation's original fragment so its exact evidence location survives preview.
      $('source-open').href = link.href;
    } catch (_) {
      if (generation !== previewGeneration || !dialog.open) return;
      $('source-title').textContent = '來源預覽暫時無法載入';
      $('source-summary').textContent = '你仍可直接閱讀完整來源紀錄。';
    }
  });
  dialog?.addEventListener('close', () => ++previewGeneration);

  for (const widget of document.querySelectorAll('.wage-history')) {
    const rows = JSON.parse(widget.dataset.wageRows);
    const from = widget.querySelector('.wage-from'), to = widget.querySelector('.wage-to');
    const output = widget.querySelector('.wage-comparison'), evidence = widget.querySelector('.wage-evidence');
    const money = value => value.toLocaleString('zh-TW',{maximumFractionDigits:2});
    function compare() {
      evidence.replaceChildren();
      if (+from.value > +to.value) {
        output.textContent = '比較終點不能早於起點，請重新選擇。'; return;
      }
      const a = rows[+from.value], b = rows[+to.value];
      const delta = key => {const n=(b[key]/a[key]-1)*100; return (n>0?'＋':'')+n.toFixed(2)+'%';};
      output.textContent = `${a.date} → ${b.date}：每月 ${money(a.monthly)} → ${money(b.monthly)} 元（${delta('monthly')}）；每小時 ${money(a.hourly)} → ${money(b.hourly)} 元（${delta('hourly')}）。這是名目變化，不是實質所得增幅。`;
      for (const [label,row] of [['起點依據',a],['終點依據',b]]) {
        const link=make('a',`${label}：${row.locator}`,'source-ref');link.href=row.source;link.dataset.source=row.sourceId;evidence.append(link);
      }
    }
    widget.querySelector('.wage-controls').hidden=false;
    from.addEventListener('change',compare);to.addEventListener('change',compare);compare();
  }

  if (!$('search-form')) return;
  let generation = 0, results = [], shown = 0, timer, composing = false, dataPromise;
  const query = $('query'), kind = $('kind'), topic = $('topic');
  function readURL() {
    const params = new URLSearchParams(location.search);
    query.value = (params.get('q') || '').slice(0,200);
    kind.value = [...kind.options].some(x => x.value === params.get('kind')) ? params.get('kind') : 'knowledge';
    topic.value = [...topic.options].some(x => x.value === params.get('topic')) ? params.get('topic') : '';
  }
  function saveURL() {
    const params = new URLSearchParams();
    if (query.value.trim()) params.set('q',query.value.trim());
    if (kind.value !== 'knowledge') params.set('kind',kind.value);
    if (topic.value) params.set('topic',topic.value);
    try {history.replaceState(null,'','search.html' + (params.size ? '?' + params : ''));} catch (_) { /* file:// may deny history changes. */ }
  }
  const waitTurn = () => new Promise(resolve => setTimeout(resolve,0));
  function tokens(value) {
    return normal(value).trim().split(/\s+/u).filter(Boolean).map(term => {
      const group = groups.find(g => g.some(w => normal(w) === term));
      return group ? [...new Set(group.map(normal))] : [term];
    });
  }
  function resultCard(row) {
    const card = make('article',null,'record-card');
    const badges = make('div',null,'badges');
    badges.append(make('span',row.type === 'note' && $('search-form').dataset.library ? '研究詳情' : labels[row.type],'badge'),make('span',verification[row.verification] || '未查核','badge amber'));
    if (statusLabels[row.status]) badges.append(make('span',statusLabels[row.status],'badge'));
    const h = make('h3'), a = make('a',row.title); a.href = row.href; h.append(a);
    card.append(badges,h,make('p',row.summary),make('div',`更新 ${row.updated} · 最後查核 ${row.verified}`,'card-foot'));
    return card;
  }
  function more() {
    const fragment = document.createDocumentFragment();
    for (const item of results.slice(shown,shown+30)) fragment.append(resultCard(item.row));
    shown += Math.min(30,results.length-shown); $('results').append(fragment);
    $('load-more').hidden = shown >= results.length;
    $('load-more').textContent = `顯示更多結果（已顯示 ${shown}／${results.length}）`;
  }
  async function search(updateURL = true) {
    const current = ++generation;
    if (updateURL) saveURL();
    const terms = tokens(query.value), selectedKind = kind.value, selectedTopic = topic.value;
    const output = []; let searched = 0;
    $('search-status').textContent = '正在搜尋…'; $('results').replaceChildren(); $('load-more').hidden = true;
    try {
      if (!dataPromise) dataPromise = loadData('search-data.js','KB_SEARCH_DATA').catch(e => {dataPromise = null; throw e;});
      const data = await dataPromise;
      if (current !== generation) return;
      for (let i=0;i<data.length;i++) {
        if (i % 100 === 0) {await waitTurn(); if (current !== generation) return;}
        const row = data[i];
        if (selectedKind === 'knowledge' ? ($('search-form').dataset.library ? row.type !== 'work' : row.type === 'source') : selectedKind !== 'all' && row.type !== selectedKind) continue;
        if (selectedTopic && !row.topics.includes(selectedTopic)) continue;
        searched++;
        const title = row._title ??= normal(row.title), tags = row._tags ??= normal(row.tags.join(' '));
        const text = row._text ??= normal(row.text);
        if (!terms.every(group => group.some(term => title.includes(term) || tags.includes(term) || text.includes(term) || normal(row.id).includes(term)))) continue;
        let score = row.type === 'source' ? 0 : 10;
        for (const group of terms) score += group.some(t => title.includes(t)) ? 20 : group.some(t => tags.includes(t)) ? 8 : 1;
        output.push({row,score});
      }
      if (current !== generation) return;
      output.sort((a,b) => b.score-a.score || b.row.updated.localeCompare(a.row.updated) || a.row.id.localeCompare(b.row.id));
      results = output; shown = 0; more();
      const scope = `${kind.selectedOptions[0].textContent}／${topic.selectedOptions[0].textContent}`;
      $('search-status').textContent = output.length ? `找到 ${output.length} 筆 · 已搜尋 ${searched} 筆（${scope}）` : `在本次範圍內未找到符合資料 · 已搜尋 ${searched} 筆（${scope}）。可更換近義詞、減少關鍵字或切換「全部正式紀錄」；這不代表資料不存在。`;
    } catch (_) {
      if (current !== generation) return;
      $('search-status').textContent = '搜尋資料未能載入。請重新按「搜尋」重試；也可從主題入口閱讀。';
    }
  }
  $('search-form').addEventListener('submit', e => {e.preventDefault(); clearTimeout(timer); search();});
  query.addEventListener('compositionstart', () => {composing = true; clearTimeout(timer); ++generation;});
  query.addEventListener('compositionend', () => {composing = false; clearTimeout(timer); timer = setTimeout(search,180);});
  query.addEventListener('input', () => {++generation; clearTimeout(timer); if (!composing) timer = setTimeout(search,180);});
  for (const select of [kind,topic]) select.addEventListener('change', () => {clearTimeout(timer); search();});
  $('load-more').addEventListener('click',more);
  window.addEventListener('popstate', () => {readURL(); search(false);});
  readURL(); search(false);
})();
