---
name: bsd-app-skill
description: สร้างและพัฒนาแอปบน BSD Online ให้ทำงานได้จริงตามเกณฑ์ผ่าน มีชั้นข้อมูล ชั้น API ชุดทดสอบอัตโนมัติจากเกณฑ์ผ่าน และตัวจับ error ที่ทำรายงานบั๊กให้ ใช้เมื่อผู้ใช้พิมพ์ /skill app, /skill add, /skill fix, /skill test หรือ /skill check
version: 1.1.0
source_type: adapted-from-BSD-AI-Workspace-IDE-skills
---

# BSD App Skill

คู่มือการทำงานของ AI สำหรับโปรเจกต์นี้ อ่านทั้งไฟล์ก่อนทำงานทุกครั้งที่ผู้ใช้พิมพ์ `/skill` ห้ามแก้หรือลบไฟล์นี้ เว้นแต่ผู้ใช้สั่ง

หลักใหญ่: **งานเสร็จ = เกณฑ์ผ่านทุกข้อมีการทดสอบอัตโนมัติ และผู้ใช้กด "ทดสอบ" แล้วผ่าน** ไม่ใช่ "AI บอกว่าเสร็จ"

## คำสั่ง

| ผู้ใช้พิมพ์ | ทำอะไร |
|---|---|
| `/skill` | แสดงตารางนี้และสรุปสถานะแอป 3 บรรทัด ไม่แก้ไฟล์ |
| `/skill app <โจทย์ + เกณฑ์ผ่าน>` | สร้างแอปใหม่ครบ: เกณฑ์ผ่าน → ข้อมูล → API → หน้าจอ → ทดสอบ → ตัวจับ error |
| `/skill add <ฟีเจอร์ + เกณฑ์ผ่าน>` | เพิ่มฟีเจอร์ทีละอย่าง พร้อมเพิ่มการทดสอบ ฟีเจอร์เดิมต้องยังผ่าน |
| `/skill fix <รายงานบั๊ก>` | หาสาเหตุ แก้เฉพาะจุด และเพิ่มการทดสอบที่จับบั๊กนี้ |
| `/skill test` | ตรวจว่าเกณฑ์ผ่านทุกข้อมีการทดสอบ เติมที่ขาด ไม่แก้ฟีเจอร์ |
| `/skill check` | ไล่เกณฑ์ผ่านจากโค้ดจริงทีละข้อ รายงาน ✓/✗/ยังตรวจไม่ได้ ไม่แก้ไฟล์ |

ถ้าผู้ใช้สั่งงานแอปโดยไม่พิมพ์ `/skill` ให้ทำตาม `/skill add` และบอกว่าใช้ไฟล์นี้

## 1. เกณฑ์ผ่านก่อนโค้ด (ทุกคำสั่ง)

เขียนในคำตอบก่อนโค้ดทุกครั้ง:
1. แอปช่วยใคร ทำงานหลักอะไร (1 ประโยค)
2. ข้อมูลหลักและฟิลด์ เช่น `order: id, items[{menuId, qty}], name, phone, address, status, createdAt`
3. **เกณฑ์ผ่านมีเลขกำกับ** รูปแบบ `ACn: เมื่อ <ทำอะไร> แล้ว <เห็นหรือได้อะไรที่วัดได้>`
   - ใช้เกณฑ์ที่ผู้ใช้ให้มาเป็นหลัก แปลงข้อที่คลุมเครือให้วัดได้ เช่น "ตะกร้าทำงาน" → "AC3: เมื่อกด + สองครั้ง จำนวนเป็น 3 และยอดรวม = ราคา×3 + ค่าส่ง"
   - ถ้าผู้ใช้ไม่ได้ให้เกณฑ์ ให้เขียนเอง 4–8 ข้อ ครอบ: งานหลักสำเร็จ, ข้อมูลผิดถูกปฏิเสธ, ข้อมูลอยู่หลังรีเฟรช, หน้าว่าง/ไม่พบ, ตัวเลขคำนวณถูก
   - ข้อที่ทดสอบอัตโนมัติไม่ได้ (ความสวย, การสั่น, เสียง) ให้ติดป้าย `[คนตรวจ]` พร้อมวิธีให้ผู้ใช้ลอง
4. ถ้าข้อมูลสำคัญขาดจนทำต่อไม่ได้ ถาม 1 คำถาม ถ้าไม่ขาด ให้ลงมือและระบุสิ่งที่สมมติ

## 2. สิ่งที่ใช้ได้และเงื่อนไข

| เรื่อง | ค่าเริ่มต้น | ใช้ได้เมื่อ |
|---|---|---|
| ภาษา/โครง | HTML + CSS + JavaScript ธรรมดา ไม่มี npm/build | — |
| API ภายนอก (ดึงข้อมูล) | ไม่ใช้ | ผู้ใช้ขอ และ API **ไม่ต้องใช้ key ลับ** และ **เรียกจากเบราว์เซอร์ได้ (CORS)** เช่น Open-Meteo สภาพอากาศ/PM2.5 ต้องทำตามหัวข้อ 4 |
| CDN (ไลบรารี) | ไม่ใช้ | ผู้ใช้ขอชื่อไลบรารี ระบุเวอร์ชันตายตัว เช่น `chart.js@4.4.1` และมีข้อความแทนเมื่อโหลดไม่ได้ |
| React/Vue ผ่าน CDN | ไม่แนะนำในแพลตฟอร์มนี้ | ผู้ใช้สั่งชัดเจน: ใช้แบบไม่ต้องคอมไพล์ JSX (ไม่ใช้ Babel ในเบราว์เซอร์) |
| key ลับ / รหัสผ่าน / token | **ห้ามเด็ดขาด** | ไม่มีกรณีใช้ได้ โค้ดหน้าเว็บทุกบรรทัดผู้ใช้เปิดดูได้ |
| ภาพ | กล่องสีหรือ SVG + "รอภาพ" | ผู้ใช้ให้ไฟล์หรือ URL ภาพที่ใช้ได้ |
| server จริง | ไม่มี ข้อมูลอยู่ในเบราว์เซอร์ | ผู้ใช้มี API ของตัวเอง ให้เปลี่ยนเฉพาะใน `DB`/`API` |

ไฟล์: ใช้ `index.html`, `style.css`, `script.js` ที่มีอยู่ ถ้า script.js เกิน 400 บรรทัด แยก `data.js` (CONFIG + DB + API) โหลดก่อน `script.js` ถ้าระบบกำหนดให้เป็นไฟล์เดียว ให้แบ่งเป็นส่วนด้วยหัวข้อคอมเมนต์ตามลำดับในหัวข้อ 3

## 3. โครงสร้างแบบ production (แทน .env)

เรียงส่วนในโค้ดตามนี้ ทุกส่วนมีหัวข้อคอมเมนต์ `// ===== ชื่อส่วน =====`

1. **ERROR REPORTER**: `<script>` แยกตัวแรกใน `<head>` (หัวข้อ 6) ต้องมาก่อนโค้ดอื่น เพื่อจับ SyntaxError ของโค้ดหลักได้
2. **CONFIG**: ค่าที่เปลี่ยนได้ทั้งหมดในอ็อบเจกต์เดียว แทน `.env` สำหรับค่าที่ไม่ลับ
   ```js
   const CONFIG = Object.freeze({ appName: 'อิ่มไว', storageKey: 'imwai-v1', currency: 'THB', deliveryFee: 25,
     api: { weather: 'https://api.open-meteo.com/v1/forecast' }, timeoutMs: 8000, features: { tests: true } });
   ```
3. **DB** (หลังบ้าน): ข้อมูล การตรวจข้อมูล กฎธุรกิจ (หัวข้อ 5)
4. **API**: การเรียกข้อมูลภายนอก (หัวข้อ 4) ถ้าไม่มีก็ข้าม
5. **UI**: `render()` และฟังก์ชันวาดแต่ละหน้าจอ อ่านข้อมูลจาก DB เท่านั้น
6. **EVENTS**: ผูกเหตุการณ์ครั้งเดียวด้วย event delegation บนกล่องแม่
7. **TESTS**: ชุดทดสอบจากเกณฑ์ผ่าน (หัวข้อ 7)

กฎวิศวกรรม:
- ข้อความจากผู้ใช้หรือจาก API ใส่หน้าจอด้วย `textContent` หรือผ่าน `esc()` ก่อนใช้ `innerHTML` เสมอ (กันโค้ดแฝง)
  `const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);`
- ตัวเลขเงินคำนวณเป็นจำนวนเต็ม แสดงด้วย `toLocaleString('th-TH')` วันที่เก็บเป็น ISO string
- ทุก element ที่ JS ใช้มี `id` หรือ `data-action` ชัดเจน ห้ามหา element จากข้อความบนปุ่ม
- ค้นหาแบบพิมพ์สด: หน่วง 200ms ก่อนกรอง
- สถานะหน้าจอ (หน้าไหน ตัวกรอง) เก็บใน `location.hash` ย้อนกลับแล้วข้อมูลไม่หาย
- ทุกปุ่มมีผลที่เห็นได้ ไม่มีปุ่มหลอก ข้อมูลจำลองติดป้าย "ข้อมูลตัวอย่าง"

## 4. API ภายนอก (เมื่อผู้ใช้ขอ)

```js
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
```
- หน้าจอแสดง: กำลังโหลด → ข้อมูล + "แหล่งที่มา" + "อัปเดตเมื่อ" → หรือข้อความผิดพลาดพร้อมปุ่ม "ลองใหม่"
- ตรวจรูปแบบข้อมูลที่ได้ก่อนใช้ ถ้าไม่มีฟิลด์ที่ต้องการให้แสดงว่าข้อมูลไม่ครบ ห้ามแสดง `undefined`
- ถ้า API เรียกจากเบราว์เซอร์ไม่ได้ (error เรื่อง CORS) ให้บอกผู้ใช้ตรง ๆ ว่าต้องมี server กลาง ห้ามแต่งข้อมูลแทน
- ในการทดสอบ ให้แทน `API.getJSON` ด้วยข้อมูลตัวอย่างชั่วคราว (หัวข้อ 7) เพื่อไม่พึ่งอินเทอร์เน็ต

## 5. DB = หลังบ้านในเบราว์เซอร์

```js
// ===== DB =====
const DB = (() => {
  const KEY = CONFIG.storageKey, empty = () => ({ items: [], nextId: 1 });
  const load = () => { try { const s = JSON.parse(localStorage.getItem(KEY)); return s && Array.isArray(s.items) ? s : empty(); } catch { return empty(); } };
  let state = load();
  const save = () => localStorage.setItem(KEY, JSON.stringify(state));
  function validate(x) {                       // { field: ข้อความที่บอกวิธีแก้ }
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
    reload() { state = load(); },              // อ่านจาก localStorage ใหม่ (ใช้ทดสอบ "รีเฟรชแล้วข้อมูลอยู่")
    exportJSON: () => JSON.stringify(state),
    importJSON(text) { try { const d = JSON.parse(text); if (!Array.isArray(d.items)) throw 0; state = d; save(); return { ok: true }; } catch { return fail({ file: 'ไฟล์ไม่ใช่ข้อมูลของแอปนี้' }); } },
    reset() { state = empty(); save(); },
  };
})();
```
- ฟังก์ชันที่เขียนข้อมูลคืน `{ ok, item | errors }` เสมอ ไม่ throw ถึงหน้าจอ
- กฎธุรกิจอยู่ใน DB เช่น ตะกร้าร้านเดียว, ห้ามจองเกินจำนวน, ห้ามวันที่ย้อนหลัง ข้อความบอกค่าจริง "เหลือ 2 ที่ แต่จอง 3"
- ยอดรวม/สถิติคำนวณจากข้อมูลจริงทุกครั้ง ห้ามพิมพ์ตัวเลขตายตัว
- ข้อมูลหลายชนิด: อาร์เรย์แยกใน state เชื่อมด้วย id
- เปลี่ยนโครงสร้างข้อมูลมาก: เปลี่ยน `storageKey` เป็น `-v2` และย้ายข้อมูลเดิมครั้งเดียว

## 6. ตัวจับ error และรายงานบั๊ก (บังคับ)

AI ในแพลตฟอร์มมองไม่เห็น Console ของผู้ใช้ แอปจึงต้องรายงาน error ให้เอง วางเป็น `<script>` แรกใน `<head>`:

```html
<script>
// ===== ERROR REPORTER ===== (แยกจากโค้ดหลัก เพื่อจับ SyntaxError ของโค้ดหลักได้)
window.APP_LOG = [];
window.note = m => { APP_LOG.push(new Date().toLocaleTimeString('th-TH') + ' ' + m); APP_LOG.splice(0, APP_LOG.length - 15); };
window.reportError = (message, where) => {
  const report = ['/skill fix', 'ข้อความ error: ' + message, 'ตำแหน่ง: ' + where, 'หน้าจอ: ' + (location.hash || '#home'),
    'การกระทำล่าสุด:', ...APP_LOG.map(x => '- ' + x)].join('\n');
  const show = () => {
    let box = document.getElementById('app-error');
    if (!box) { box = document.createElement('div'); box.id = 'app-error'; box.setAttribute('role', 'alert');
      box.style.cssText = 'position:fixed;left:8px;right:8px;bottom:8px;z-index:9999;background:#7f1d1d;color:#fff;padding:12px;border-radius:12px;font:14px/1.5 system-ui';
      document.body.appendChild(box); }
    box.textContent = 'เกิดข้อผิดพลาด: ' + message + ' (' + where + ') ' + (message === 'Script error.' ? 'รายละเอียดถูกซ่อน เปิด Console (F12) แล้วคัดลอกข้อความสีแดงมาด้วย ' : '');
    const b = document.createElement('button'); b.textContent = 'คัดลอกรายงานบั๊ก'; b.style.cssText = 'min-height:44px;margin-left:8px';
    b.onclick = () => navigator.clipboard?.writeText(report).then(() => { b.textContent = 'คัดลอกแล้ว วางในแชทได้เลย'; });
    box.appendChild(b);
  };
  document.body ? show() : addEventListener('DOMContentLoaded', show);
};
addEventListener('error', e => reportError(e.message, (e.filename || '').split('/').pop() + ':' + e.lineno + ':' + e.colno));
addEventListener('unhandledrejection', e => reportError(String(e.reason && e.reason.message || e.reason), 'promise'));
</script>
```
- เรียก `note('กดเพิ่มลงตะกร้า เมนู 3')` ในทุก event สำคัญ รายงานบั๊กจะมีลำดับการกระทำ
- ห้ามลบตัวจับ error นี้เมื่อแก้โค้ด

## 7. ชุดทดสอบจากเกณฑ์ผ่าน (บังคับ สำคัญที่สุด)

ทุก `ACn` ต้องมี `test('ACn', ...)` อย่างน้อยหนึ่งข้อ (ยกเว้นข้อ `[คนตรวจ]`) การทดสอบต้อง **กดปุ่มและกรอกช่องจริงบนหน้าจอ** แล้วตรวจผลที่ผู้ใช้เห็น ไม่ใช่เรียกแค่ DB

```js
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
  const backup = DB.exportJSON(), realGet = typeof API !== 'undefined' ? API.getJSON : null, results = [];
  for (const t of TESTS) {
    DB.reset(); ui.go('#home'); render();
    try { await t.fn(); results.push({ id: t.id, name: t.name, pass: true }); }
    catch (e) { results.push({ id: t.id, name: t.name, pass: false, error: e.message }); }
    finally { if (realGet) API.getJSON = realGet; }
  }
  DB.importJSON(backup); document.querySelectorAll('form').forEach(f => f.reset());      // คืนข้อมูลและหน้าจอของผู้ใช้
  document.querySelectorAll('[id$="-error"]').forEach(e => { e.textContent = ''; }); ui.go('#home'); render();
  showTestReport(results); console.table(results);
  return results;
}
// ตัวอย่าง: เขียนตามเกณฑ์ผ่านจริงของแอป
test('AC1', 'เพิ่มรายการแล้วเห็นในรายการทันที', async () => {
  ui.fill('#name', 'สมชาย'); ui.fill('#phone', '0812345678'); ui.click('[data-action="save"]');
  await ui.until(() => ui.count('#list > li') === 1, 'รายการไม่ขึ้น');
});
test('AC2', 'เบอร์ผิดแล้วเห็นคำแนะนำ และชื่อที่กรอกไม่หาย', async () => {
  ui.fill('#name', 'สมชาย'); ui.fill('#phone', '12'); ui.click('[data-action="save"]');
  await ui.until(() => ui.text('#phone-error').includes('เบอร์'), 'ไม่มีข้อความแนะนำ');
  expect(ui.$('#name').value === 'สมชาย', 'ชื่อที่กรอกหายไป');
});
test('AC3', 'รีเฟรชแล้วข้อมูลยังอยู่', () => { DB.add({ name: 'ก', phone: '0812345678' }); DB.reload(); expect(DB.list().length === 1, 'ข้อมูลหาย'); });
test('AC4', 'ดึงข้อมูลภายนอกไม่สำเร็จแล้วเห็นข้อความและปุ่มลองใหม่', async () => {
  API.getJSON = async () => ({ ok: false, error: 'ดึงข้อมูลไม่สำเร็จ' });   // ไม่พึ่งอินเทอร์เน็ตจริง
  ui.go('#weather'); await ui.until(() => ui.count('[data-action="retry"]') === 1, 'ไม่มีปุ่มลองใหม่');
});
```
- `showTestReport(results)` แสดงกล่องบนหน้า: แต่ละข้อ ✓/✗ + id + ชื่อ + เหตุผลที่ไม่ผ่าน และสรุป "ผ่าน 7/8"
- ปุ่ม "ทดสอบ" มุมล่างของแอปเรียก `runTests()` และเปิด `index.html#test` แล้วรันอัตโนมัติ (ซ่อนปุ่มได้ด้วย `CONFIG.features.tests`)
- selector ในการทดสอบต้องจับ element เดียวต่อหนึ่งสิ่งที่นับ เช่นนับรายการด้วย `#list > li` ไม่ใช่ `[data-id]` (ปุ่มข้างในอาจมี data-id ด้วยจนนับเกิน)
- ห้ามเขียนการทดสอบที่ผ่านเสมอ ห้ามแก้การทดสอบให้ผ่านโดยไม่แก้ต้นเหตุ
- ทดสอบบนข้อมูลชั่วคราวแล้วคืนข้อมูลผู้ใช้เสมอ
- บั๊กที่แก้ใน `/skill fix` ต้องได้การทดสอบใหม่ที่ "ล้มก่อนแก้ ผ่านหลังแก้"

## 8. หน้าบ้าน

- โครงแอป: หัวแอป → เนื้อหา → เมนูล่างบนมือถือ (3–5 เมนู ไอคอน + ข้อความ) / เมนูข้างบนจอกว้าง 900px+
- ทุกหน้าจอวาดจาก DB ผ่าน `render()` เรียกหลังทุกการเปลี่ยนข้อมูล
- ฟอร์ม: `<label>` ที่มองเห็น, `type` ถูก, error ใต้ช่อง (`id="<ช่อง>-error"`), ข้อมูลไม่หายเมื่อไม่ผ่าน
- สถานะครบ: ว่าง, กำลังโหลด, สำเร็จ, ผิดพลาด (บอกวิธีแก้)
- ลบต้องยืนยันหรือมี "เลิกทำ"
- ปุ่ม 44px+, ตัวอักษร 16px+, contrast ชัด, สถานะไม่ใช้สีอย่างเดียว, ใช้งานด้วยคีย์บอร์ดได้
- สีและขนาดเป็นตัวแปรใน `:root` มือถือ 390px ไม่ล้นแนวนอน

## 9. ขั้นตอนตามคำสั่ง

- **`/skill app`**: หัวข้อ 1 → CONFIG → DB → API (ถ้ามี) → UI/EVENTS → ERROR REPORTER → TESTS ครบทุก AC → รายงาน (หัวข้อ 11) ส่งไฟล์ครบทุกไฟล์
- **`/skill add`**: อ่านทุกไฟล์ก่อน → เพิ่ม AC ใหม่ → แก้เฉพาะส่วนที่เกี่ยว → เพิ่ม test ของ AC ใหม่ → test เดิมต้องไม่ถูกลบ ห้ามเปลี่ยน id/ชื่อฟังก์ชันที่ใช้อยู่
- **`/skill fix`**: หัวข้อ 10
- **`/skill test`**: จับคู่ AC กับ test ทีละข้อ แสดงตาราง AC → test → สถานะ เติม test ที่ขาด
- **`/skill check`**: ไล่ AC จากโค้ดจริง บอก ✓/✗/ยังตรวจไม่ได้ และให้ผู้ใช้กด "ทดสอบ" เพื่อยืนยัน

## 10. การแก้บั๊ก (`/skill fix`)

AI ไม่ได้รันโค้ด จึงต้องใช้หลักฐานจากรายงานบั๊ก (ข้อความ error, ตำแหน่ง, การกระทำล่าสุด, ผลทดสอบที่ไม่ผ่าน) ห้ามเดา
1. อ่านรายงานให้ครบ เปิดไฟล์และบรรทัดที่ระบุ อ่านบรรทัดรอบ ๆ 10 บรรทัด
2. หาสาเหตุแรก ไม่ใช่อาการ เขียน 1 ประโยค: "บรรทัด 389 ขาดคำว่า document"
3. ตารางสาเหตุที่พบบ่อย:
   | อาการ | สาเหตุ |
   |---|---|
   | `SyntaxError: Unexpected token '.'` | คำหายหน้าจุด เช่น `steps:.querySelectorAll` → `steps: document.querySelectorAll` |
   | `Unexpected end of input` | ปีกกา/วงเล็บไม่ครบ |
   | `Cannot read properties of null` | id ใน JS ไม่มีใน HTML หรือ script โหลดก่อน element (ใส่ `defer`) |
   | `X is not defined` | ใช้ก่อนประกาศ สะกดผิด ลำดับ `<script>` ผิด |
   | กดแล้วไม่เกิดอะไร | ลืม `render()` ผูก event กับ element ที่ถูกวาดใหม่ (ใช้ delegation) |
   | ตัวเลขผิด | บวก string ไม่ได้แปลง `Number()` |
   | CORS / Failed to fetch | API ไม่อนุญาตให้เรียกจากเบราว์เซอร์ หรือไม่มีอินเทอร์เน็ต |
4. แก้จุดเดียว เพิ่ม test ที่จับบั๊กนี้ บอกให้ผู้ใช้กด "ทดสอบ"
5. แก้ 2 ครั้งแล้วยังไม่ผ่าน: หยุด สรุปสิ่งที่ลองแล้ว ขอรายงานบั๊กใหม่หลังแก้

## 11. รายงานท้ายคำตอบ (ทุกครั้ง)

```
เกณฑ์ผ่าน: AC1 … ACn (ข้อ [คนตรวจ]: …)
ไฟล์ที่แก้: …
การทดสอบ: AC1→test ✓ เขียนแล้ว … ACn→test …
ผู้ใช้ต้องทำ: กด "ทดสอบ" ต้องได้ ผ่าน n/n · ลองเองข้อ [คนตรวจ]: …
ข้อมูลเก็บที่: เบราว์เซอร์เครื่องนี้ (key: …) · API ที่ใช้: … (แหล่งที่มา)
```
ห้ามบอกว่า "ทดสอบแล้วผ่าน" เพราะ AI ไม่ได้รันโค้ด ให้บอกว่า "เขียนการทดสอบแล้ว รอผู้ใช้กดทดสอบ"

## รายละเอียดเพิ่มเติม

ถ้าโปรเจกต์มีโฟลเดอร์ `references/` ให้อ่านเฉพาะไฟล์ที่เกี่ยว: `app-data.md` (ข้อมูลซับซ้อน รายงาน นำเข้า/ส่งออก), `app-ui.md` (หน้าจอแอป), `app-check.md` (เขียนเกณฑ์และการทดสอบ), `app-fix.md` (แก้บั๊ก) ถ้าไม่มี ไฟล์นี้เพียงพอ

ต้นฉบับ: https://raw.githubusercontent.com/Anurog1112/bsd-app-skill/v1.1.0/SKILL.md

— จบ SKILL.md v1.1.0 —
