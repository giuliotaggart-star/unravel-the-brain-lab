/**
 * Unravel poll collector — Google Apps Script for a Google Sheet.
 *
 * Receives the anonymous warm-up and exit poll rows the Unravel site sends
 * (see src/lib/unravel/poll.ts) and writes them to two tabs, "Start" and
 * "Exit". The Unravel menu builds a "Summary" tab: overall and per class code.
 *
 * Setup (once):
 *   1. In the Google Sheet: Extensions > Apps Script. Delete what is there,
 *      paste this whole file, click Save.
 *   2. Deploy > New deployment > type "Web app".
 *      Execute as: Me. Who has access: Anyone. Click Deploy, allow access.
 *   3. Copy the Web app URL (ends in /exec). It goes in config.pollEndpoint.
 *   4. Test: open the URL in a browser; it should say the collector is running.
 *
 * After editing this script, use Deploy > Manage deployments > Edit (pencil)
 * > Version: New version, so the same URL keeps working.
 */

var ITEMS = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6'];
var CONF = ['c1', 'c2', 'c3'];
var CORRECT = { q1: 'true', q2: 'false', q3: 'false', q4: 'false', q5: 'true', q6: 'true' };

var START_HEADERS = ['received', 'sent_at', 'anon_id', 'class_code', 'year']
  .concat(ITEMS, ['score'], CONF);
var EXIT_HEADERS = ['received', 'sent_at', 'anon_id', 'class_code']
  .concat(ITEMS, ['score'], CONF, ['r1_before_report_conf', 'e1_useful', 'e2_degree', 'e3_next', 'e4_learned']);

/** Health check: open the /exec URL in a browser. */
function doGet() {
  return ContentService.createTextOutput('Unravel poll collector is running.');
}

/** Receives one poll row from the site. */
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    var body = (e && e.postData && e.postData.contents) || '';
    if (body.length > 5000) return reply('too large');
    var row = JSON.parse(body);
    if (row.kind !== 'start' && row.kind !== 'exit') return reply('ignored');
    lock.waitLock(10000);
    if (row.kind === 'start') {
      sheet_('Start', START_HEADERS).appendRow(startRow_(row));
    } else {
      sheet_('Exit', EXIT_HEADERS).appendRow(exitRow_(row));
    }
    return reply('ok');
  } catch (err) {
    return reply('error');
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
}

function startRow_(r) {
  var a = r.answers || {}, c = r.conf || {};
  return [new Date(), text_(r.at, 40), text_(r.anonId, 64), code_(r.classCode), text_(r.year, 20)]
    .concat(ITEMS.map(function (q) { return answer_(a[q]); }), [num_(r.score)], CONF.map(function (k) { return num_(c[k]); }));
}

function exitRow_(r) {
  var a = r.answers || {}, c = r.conf || {};
  var e3 = Array.isArray(r.e3) ? r.e3.map(function (x) { return text_(x, 60); }).join('; ') : '';
  return [new Date(), text_(r.at, 40), text_(r.anonId, 64), code_(r.classCode)]
    .concat(ITEMS.map(function (q) { return answer_(a[q]); }), [num_(r.score)], CONF.map(function (k) { return num_(c[k]); }),
      [num_(r.r1), num_(r.e1), text_(r.e2, 40), e3, text_(r.e4, 140)]);
}

/* ---------- cleaning: never let a student's text become a formula ---------- */
function text_(v, max) {
  var s = (v == null ? '' : String(v)).slice(0, max || 100);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}
function code_(v) { return text_(String(v || '').trim().toUpperCase(), 24); }
function answer_(v) { return v === 'true' || v === 'false' || v === 'dk' ? v : ''; }
function num_(v) { return typeof v === 'number' && isFinite(v) ? v : ''; }
function reply(msg) { return ContentService.createTextOutput(msg); }

function sheet_(name, headers) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(headers);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  }
  return sh;
}

/* ---------- Summary tab ---------- */
function onOpen() {
  SpreadsheetApp.getUi().createMenu('Unravel')
    .addItem('Refresh summary', 'buildSummary')
    .addItem('Add a test row', 'addTestRows')
    .addToUi();
}

function rows_(name) {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  if (!sh || sh.getLastRow() < 2) return [];
  var v = sh.getDataRange().getValues(), h = v.shift();
  return v.map(function (r) { var o = {}; h.forEach(function (k, i) { o[k] = r[i]; }); return o; });
}

function pct_(list, fn) { return list.length ? Math.round(100 * list.filter(fn).length / list.length) : ''; }
function mean_(list, k) {
  var xs = list.map(function (r) { return r[k]; }).filter(function (x) { return typeof x === 'number'; });
  return xs.length ? Math.round(100 * xs.reduce(function (s, x) { return s + x; }, 0) / xs.length) / 100 : '';
}
function agree_(list, k) {
  var xs = list.filter(function (r) { return typeof r[k] === 'number'; });
  return pct_(xs, function (r) { return r[k] >= 4; });
}

/** One line per class code (plus ALL): paired students only, so start and end are the same people. */
function buildSummary() {
  var start = rows_('Start'), exit = rows_('Exit');
  var byId = {};
  start.forEach(function (r) { byId[r.anon_id] = r; });
  var pairs = exit.filter(function (r) { return byId[r.anon_id]; })
    .map(function (r) { var s = byId[r.anon_id]; return { s: s, e: r, code: s.class_code || r.class_code || '(no code)' }; });

  var groups = { ALL: pairs };
  pairs.forEach(function (p) { (groups[p.code] = groups[p.code] || []).push(p); });

  var head = ['class_code', 'warm-up polls', 'exit polls', 'paired students', 'completion %',
    'mean score start (of 6)', 'mean score end (of 6)'];
  ITEMS.forEach(function (q) { head.push(q + ' correct start %', q + ' correct end %'); });
  CONF.forEach(function (k) { head.push(k + ' agree start %', k + ' agree end %'); });
  head.push('report conf: before today (r1) mean', 'report conf: now (c2) mean', 'useful (e1) mean', 'degree more likely %');

  var out = [head];
  Object.keys(groups).sort(function (a, b) { return a === 'ALL' ? -1 : b === 'ALL' ? 1 : a < b ? -1 : 1; }).forEach(function (g) {
    var P = groups[g], S = P.map(function (p) { return p.s; }), E = P.map(function (p) { return p.e; });
    var nStart = g === 'ALL' ? start.length : start.filter(function (r) { return (r.class_code || '(no code)') === g; }).length;
    var nExit = g === 'ALL' ? exit.length : exit.filter(function (r) { var s = byId[r.anon_id]; return ((s && s.class_code) || r.class_code || '(no code)') === g; }).length;
    var line = [g, nStart, nExit, P.length, nStart ? Math.round(100 * P.length / nStart) : '', mean_(S, 'score'), mean_(E, 'score')];
    ITEMS.forEach(function (q) {
      line.push(pct_(S, function (r) { return r[q] === CORRECT[q]; }), pct_(E, function (r) { return r[q] === CORRECT[q]; }));
    });
    CONF.forEach(function (k) { line.push(agree_(S, k), agree_(E, k)); });
    line.push(mean_(E, 'r1_before_report_conf'), mean_(E, 'c2'), mean_(E, 'e1_useful'),
      pct_(E.filter(function (r) { return r.e2_degree; }), function (r) { return r.e2_degree === 'More likely'; }));
    out.push(line);
  });

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName('Summary') || ss.insertSheet('Summary', 0);
  sh.clear();
  sh.getRange(1, 1, out.length, head.length).setValues(out);
  sh.getRange(1, 1, 1, head.length).setFontWeight('bold').setWrap(true);
  sh.setFrozenRows(1);
  sh.setFrozenColumns(1);
  sh.getRange(out.length + 2, 1).setValue('Only students with both a warm-up and an exit poll on the same device are counted in the start/end columns. Refreshed ' + new Date());
}

/** Adds one paired test student under class code TEST, so you can see the layout. Delete those rows afterwards. */
function addTestRows() {
  var id = 'test-' + new Date().getTime();
  sheet_('Start', START_HEADERS).appendRow(startRow_({ at: new Date().toISOString(), anonId: id, classCode: 'TEST', year: 'Year 12',
    answers: { q1: 'true', q2: 'true', q3: 'true', q4: 'true', q5: 'true', q6: 'false' }, conf: { c1: 2, c2: 2, c3: 3 }, score: 2 }));
  sheet_('Exit', EXIT_HEADERS).appendRow(exitRow_({ at: new Date().toISOString(), anonId: id, classCode: 'TEST',
    answers: { q1: 'true', q2: 'false', q3: 'false', q4: 'false', q5: 'true', q6: 'true' }, conf: { c1: 4, c2: 4, c3: 4 },
    r1: 2, e1: 4, e2: 'More likely', e3: ['Try Solo explore'], e4: 'Test row', score: 6 }));
  buildSummary();
}
