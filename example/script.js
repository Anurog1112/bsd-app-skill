/* คิวดี — ตัวอย่างแอปตาม BSD App Skill 1.1
   เกณฑ์ผ่าน
   AC1: เมื่อกรอกชื่อและเบอร์ถูกแล้วกดจองคิว แล้วคิวขึ้นในรายการทันที และตัวนับเพิ่ม
   AC2: เมื่อกรอกเบอร์ผิดแล้วกดจองคิว แล้วเห็นคำแนะนำใต้ช่องเบอร์ และชื่อที่กรอกไม่หาย
   AC3: เมื่อรีเฟรชหน้า แล้วคิวที่จองไว้ยังอยู่
   AC4: เมื่อค้นหาด้วยเบอร์ แล้วเห็นเฉพาะคิวที่ตรง และค้นไม่เจอแล้วเห็นข้อความว่าไม่พบ
   AC5: เมื่อกดยกเลิกคิวและยืนยัน แล้วคิวหายจากรายการ
   AC6: เมื่อเปิดหน้าอากาศ แล้วเห็นอุณหภูมิ PM2.5 แหล่งที่มา และเวลาอัปเดต
   AC7: เมื่อดึงข้อมูลอากาศไม่สำเร็จ แล้วเห็นข้อความผิดพลาดและปุ่มลองใหม่
   [คนตรวจ] จอ 390px ไม่ล้นแนวนอน และอ่านง่าย */

// ===== CONFIG =====
const CONFIG = Object.freeze({
  appName: 'คิวดี', storageKey: 'kiwdee-v1', timeoutMs: 8000, features: { tests: true },
  api: {
    weather: 'https://api.open-meteo.com/v1/forecast?latitude=13.75&longitude=100.5&current=temperature_2m&timezone=Asia%2FBangkok',
    air: 'https://air-quality-api.open-meteo.com/v1/air-quality?latitude=13.75&longitude=100.5&current=pm2_5&timezone=Asia%2FBangkok',
  },
});

// ===== DB =====
const DB = (() => {
  const KEY = CONFIG.storageKey, empty = () => ({ items: [], nextId: 1 });
  const load = () => { try { const s = JSON.parse(localStorage.getItem(KEY)); return s && Array.isArray(s.items) ? s : empty(); } catch { return empty(); } };
  let state = load();
  const save = () => localStorage.setItem(KEY, JSON.stringify(state));
  function validate(x) {
    const errors = {};
    if (!x.name?.trim()) errors.name = 'กรอกชื่อ';
    if (x.phone !== undefined && !/^0\d{8,9}$/.test(String(x.phone).replace(/\D/g, ''))) errors.phone = 'เบอร์โทรต้องเป็นตัวเลข 9–10 หลัก ขึ้นต้นด้วย 0';
    return errors;
  }
  const fail = errors => ({ ok: false, errors });
  return {
    list: (q = '') => state.items.filter(x => JSON.stringify(x).toLowerCase().includes(q.trim().toLowerCase())),
    get: id => state.items.find(x => x.id === id) || null,
    add(input) { const e = validate(input); if (Object.keys(e).length) return fail(e);
      const item = { ...input, id: state.nextId++, createdAt: new Date().toISOString() }; state.items.push(item); save(); return { ok: true, item }; },
    update(id, patch) { const i = state.items.findIndex(x => x.id === id); if (i < 0) return fail({ id: 'ไม่พบรายการ' });
      const next = { ...state.items[i], ...patch, id }; const e = validate(next); if (Object.keys(e).length) return fail(e);
      state.items[i] = next; save(); return { ok: true, item: next }; },
    remove(id) { const n = state.items.length; state.items = state.items.filter(x => x.id !== id); save(); return { ok: state.items.length < n }; },
    reload() { state = load(); },
    exportJSON: () => JSON.stringify(state),
    importJSON(text) { try { const d = JSON.parse(text); if (!Array.isArray(d.items)) throw 0; state = d; save(); return { ok: true }; } catch { return fail({ file: 'ไฟล์ไม่ใช่ข้อมูลของแอปนี้' }); } },
    reset() { state = empty(); save(); },
  };
})();

// ===== API =====
const API = {
  async getJSON(url, { cacheKey, maxAgeMin = 30 } = {}) {
    const cached = (() => { try { return JSON.parse(localStorage.getItem('cache:' + cacheKey)); } catch { return null; } })();
    if (cached && Date.now() - cached.at < maxAgeMin * 60000) return { ok: true, data: cached.data, at: cached.at, fromCache: true };
    const ctrl = new AbortController(); const timer = setTimeout(() => ctrl.abort(), CONFIG.timeoutMs);
    try {
      const res = await fetch(url, { signal: ctrl.signal });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      if (cacheKey) localStorage.setItem('cache:' + cacheKey, JSON.stringify({ at: Date.now(), data }));
      return { ok: true, data, at: Date.now(), fromCache: false };
    } catch (e) {
      if (cached) return { ok: true, data: cached.data, at: cached.at, fromCache: true, stale: true };
      return { ok: false, error: e.name === 'AbortError' ? 'เชื่อมต่อนานเกินไป' : 'ดึงข้อมูลไม่สำเร็จ (' + e.message + ')' };
    } finally { clearTimeout(timer); }
  },
};

// ===== UI =====
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
let query = '';

function render() {
  const screen = (location.hash || '#home').slice(1);
  document.querySelectorAll('[data-screen]').forEach(s => { s.hidden = s.id !== screen && !(screen === 'test' && s.id === 'home'); });
  document.querySelectorAll('.tabs a').forEach(a => { if (a.getAttribute('href') === '#' + screen) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
  const items = DB.list(query);
  $('list').innerHTML = items.map(x => `<li data-id="${x.id}"><span>${esc(x.name)} · ${esc(x.phone)}</span><button type="button" data-action="cancel" data-id="${x.id}" aria-label="ยกเลิกคิวของ ${esc(x.name)}">ยกเลิก</button></li>`).join('');
  $('count').textContent = `(${DB.list().length} คิว)`;
  $('empty').textContent = DB.list().length === 0 ? 'ยังไม่มีคิว เริ่มจองได้เลย' : items.length === 0 ? 'ไม่พบคิวที่ค้นหา' : '';
  if (screen === 'weather') loadWeather();
}

let weatherLoading = false;
async function loadWeather() {
  if (weatherLoading) return;
  weatherLoading = true;
  const box = $('weather-box');
  box.innerHTML = '<p class="muted">กำลังโหลด…</p>';
  const [w, a] = await Promise.all([API.getJSON(CONFIG.api.weather, { cacheKey: 'weather' }), API.getJSON(CONFIG.api.air, { cacheKey: 'air' })]);
  weatherLoading = false;
  if (!w.ok || !a.ok) {
    box.innerHTML = `<p class="err">${esc(w.error || a.error)}</p><button type="button" data-action="retry">ลองใหม่</button>`;
    return;
  }
  const temp = w.data?.current?.temperature_2m, pm = a.data?.current?.pm2_5;
  if (typeof temp !== 'number' || typeof pm !== 'number') { box.innerHTML = '<p class="err">ข้อมูลจากแหล่งที่มาไม่ครบ</p><button type="button" data-action="retry">ลองใหม่</button>'; return; }
  box.innerHTML = `<div class="card"><p><strong id="temp">${temp.toFixed(1)} °C</strong></p><p>PM2.5 <strong id="pm25">${pm.toFixed(1)}</strong> µg/m³</p>
    <p class="muted">แหล่งที่มา: Open-Meteo · อัปเดตเมื่อ <span id="updated">${new Date(w.at).toLocaleTimeString('th-TH')}</span>${w.stale ? ' (ข้อมูลเก่า ออฟไลน์อยู่)' : ''}</p></div>`;
}

function showErrors(errors) {
  for (const f of ['name', 'phone']) {
    $(f + '-error').textContent = errors[f] || '';
    $(f).setAttribute('aria-invalid', errors[f] ? 'true' : 'false');
  }
}

// ===== EVENTS =====
let searchTimer;
document.addEventListener('click', e => {
  const el = e.target.closest('[data-action]');
  if (!el) return;
  const action = el.dataset.action;
  if (action === 'save') {
    note('กดจองคิว');
    const r = DB.add({ name: $('name').value, phone: $('phone').value.replace(/\D/g, '') });
    showErrors(r.ok ? {} : r.errors);
    if (r.ok) { $('name').value = ''; $('phone').value = ''; render(); }
  } else if (action === 'cancel') {
    note('กดยกเลิกคิว ' + el.dataset.id);
    if (window.confirmCancel ? window.confirmCancel() : confirm('ยกเลิกคิวนี้?')) { DB.remove(Number(el.dataset.id)); render(); }
  } else if (action === 'retry') {
    note('กดลองใหม่ (อากาศ)'); loadWeather();
  } else if (action === 'test') {
    note('กดทดสอบ'); runTests();
  }
});
$('search').addEventListener('input', e => { clearTimeout(searchTimer); searchTimer = setTimeout(() => { query = e.target.value; render(); }, 200); });
addEventListener('hashchange', render);

// ===== TESTS =====
const TESTS = [], test = (id, name, fn) => TESTS.push({ id, name, fn });
const expect = (ok, why) => { if (!ok) throw new Error(why); };
const ui = {
  $(sel) { const el = document.querySelector(sel); if (!el) throw new Error('ไม่พบ ' + sel); return el; },
  fill(sel, v) { const el = ui.$(sel); el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); },
  click(sel) { ui.$(sel).click(); },
  text: sel => ui.$(sel).textContent.trim(),
  count: sel => document.querySelectorAll(sel).length,
  go(hash) { location.hash = hash; dispatchEvent(new HashChangeEvent('hashchange')); },
  async until(cond, why, ms = 2000) { const end = Date.now() + ms; while (Date.now() < end) { try { if (cond()) return; } catch {} await new Promise(r => setTimeout(r, 25)); } throw new Error('รอเกิน ' + ms + 'ms: ' + why); },
};
async function runTests() {
  const backup = DB.exportJSON(), realGet = API.getJSON, realConfirm = window.confirmCancel, results = [];
  for (const t of TESTS) {
    DB.reset(); query = ''; $('search').value = ''; ui.go('#home'); render();
    try { await t.fn(); results.push({ id: t.id, name: t.name, pass: true }); }
    catch (e) { results.push({ id: t.id, name: t.name, pass: false, error: e.message }); }
    finally { API.getJSON = realGet; window.confirmCancel = realConfirm; weatherLoading = false; }
  }
  DB.importJSON(backup); document.querySelectorAll('form').forEach(f => f.reset());
  document.querySelectorAll('[id$="-error"]').forEach(e => { e.textContent = ''; }); document.querySelectorAll('[aria-invalid]').forEach(e => e.removeAttribute('aria-invalid'));
  query = ''; ui.go('#home'); render();
  showTestReport(results); console.table(results);
  return results;
}
function showTestReport(results) {
  const box = $('test-report'), passed = results.filter(r => r.pass).length;
  box.hidden = false;
  box.innerHTML = `<strong>ผ่าน ${passed}/${results.length}</strong><ul>` + results.map(r =>
    `<li class="${r.pass ? 'pass' : 'fail'}">${r.pass ? '✓' : '✗'} ${esc(r.id)} ${esc(r.name)}${r.pass ? '' : ' — ' + esc(r.error)}</li>`).join('') + '</ul><button type="button" onclick="this.parentElement.hidden=true">ปิด</button>';
}

const fakeWeather = (temp, pm) => async url => ({ ok: true, at: Date.now(), data: url.includes('air-quality') ? { current: { pm2_5: pm } } : { current: { temperature_2m: temp } } });

test('AC1', 'จองคิวแล้วขึ้นในรายการทันทีและตัวนับเพิ่ม', async () => {
  ui.fill('#name', 'สมชาย'); ui.fill('#phone', '081-234-5678'); ui.click('[data-action="save"]');
  await ui.until(() => ui.count('#list > li') === 1, 'คิวไม่ขึ้นในรายการ');
  expect(ui.text('#count').includes('1'), 'ตัวนับไม่เพิ่ม');
});
test('AC2', 'เบอร์ผิดแล้วเห็นคำแนะนำ และชื่อที่กรอกไม่หาย', async () => {
  ui.fill('#name', 'สมชาย'); ui.fill('#phone', '12'); ui.click('[data-action="save"]');
  await ui.until(() => ui.text('#phone-error').includes('เบอร์'), 'ไม่มีคำแนะนำใต้ช่องเบอร์');
  expect(ui.$('#name').value === 'สมชาย', 'ชื่อที่กรอกหายไป');
  expect(ui.count('#list > li') === 0, 'บันทึกข้อมูลที่ผิด');
});
test('AC3', 'รีเฟรชแล้วคิวยังอยู่', () => {
  DB.add({ name: 'ก', phone: '0812345678' }); DB.reload();
  expect(DB.list().length === 1, 'ข้อมูลหายหลังโหลดใหม่');
});
test('AC4', 'ค้นหาด้วยเบอร์เห็นเฉพาะที่ตรง และไม่พบแล้วมีข้อความ', async () => {
  DB.add({ name: 'ก', phone: '0811111111' }); DB.add({ name: 'ข', phone: '0822222222' }); render();
  ui.fill('#search', '0822');
  await ui.until(() => ui.count('#list > li') === 1, 'ผลค้นหาไม่ตรง');
  ui.fill('#search', '0999');
  await ui.until(() => ui.text('#empty') === 'ไม่พบคิวที่ค้นหา', 'ไม่มีข้อความไม่พบ');
});
test('AC5', 'ยกเลิกคิวแล้วหายจากรายการ', async () => {
  DB.add({ name: 'ก', phone: '0811111111' }); render();
  window.confirmCancel = () => true;
  ui.click('[data-action="cancel"]');
  await ui.until(() => ui.count('#list > li') === 0, 'คิวยังอยู่');
});
test('AC6', 'หน้าอากาศแสดงอุณหภูมิ PM2.5 แหล่งที่มา และเวลาอัปเดต', async () => {
  API.getJSON = fakeWeather(31.4, 42.5);
  ui.go('#weather');
  await ui.until(() => ui.text('#temp') === '31.4 °C' && ui.text('#pm25') === '42.5', 'ไม่แสดงค่าที่ได้');
  expect(ui.text('#weather-box').includes('Open-Meteo') && ui.text('#updated'), 'ไม่มีแหล่งที่มาหรือเวลา');
});
test('AC7', 'ดึงข้อมูลไม่สำเร็จแล้วเห็นข้อความและปุ่มลองใหม่', async () => {
  API.getJSON = async () => ({ ok: false, error: 'ดึงข้อมูลไม่สำเร็จ (HTTP 503)' });
  ui.go('#weather');
  await ui.until(() => ui.count('[data-action="retry"]') === 1, 'ไม่มีปุ่มลองใหม่');
  expect(ui.text('#weather-box').includes('HTTP 503'), 'ไม่บอกสาเหตุ');
});

render();
if (location.hash === '#test' && CONFIG.features.tests) runTests();
