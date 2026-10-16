/* Code submission: local similarity check + heuristic AI-pattern indicator (demo only) */
const tokenize = code => new Set(code.toLowerCase().replace(/[^a-z0-9_]+/g, ' ').split(' ').filter(Boolean));
function jaccard(a, b) {
  const inter = [...a].filter(x => b.has(x)).length, uni = new Set([...a, ...b]).size;
  return uni ? inter / uni : 0;
}

function estimateAIScore(code) {
  const lines = code.split('\n').filter(l => l.trim());
  if (lines.length < 3) return { score: 0, notes: ['Too short to analyze'] };
  const lens = lines.map(l => l.length), avg = lens.reduce((a, b) => a + b, 0) / lens.length;
  const sd = Math.sqrt(lens.reduce((a, b) => a + (b - avg) ** 2, 0) / lens.length);
  const comments = lines.filter(l => /^\s*(\/\/|#|\/\*|\*)/.test(l)).length / lines.length;
  const indents = new Set(lines.map(l => l.match(/^\s*/)[0].length));
  let score = 0; const notes = [];
  if (sd < 8) { score += 30; notes.push('Unusually uniform line lengths'); }
  if (comments > 0.25) { score += 25; notes.push('High comment density'); }
  if (indents.size <= 2 && lines.length > 10) { score += 20; notes.push('Very consistent indentation'); }
  if (/here is|as an ai|certainly|sure,? here/i.test(code)) { score += 40; notes.push('Contains AI-assistant style phrasing'); }
  if (!notes.length) notes.push('No strong AI-pattern indicators found');
  return { score: Math.min(score, 100), notes };
}

function renderSubmit() {
  const mine = myCourses();
  const past = state.submissions.filter(s => s.student === session.username);
  if (!mine.length)
    return `<div class="card"><h2>Submit Code for Review</h2><p class="note">No courses assigned yet. Ask your instructor to assign courses.</p></div>`;
  return `<div class="card"><h2>Submit Code for Review</h2>
    <p class="note">Runs a local similarity check against other submissions and a heuristic AI-pattern indicator. This is a lightweight demo check, not a certified detector.</p>
    <select id="subCourse">${mine.map(c => `<option value="${c.id}" ${c.id === ui.subCourse ? 'selected' : ''}>${esc(c.title)}</option>`).join('')}</select>
    <textarea id="subCode" placeholder="Paste your code here..."></textarea>
    <button class="submit-btn" data-action="submitCode">Run Check &amp; Submit</button>
    ${ui.submitResult}
  </div>
  <div class="card"><h2>My Past Submissions</h2>
  ${past.length ? past.map(s => `<div class="lesson-row"><span>${esc(courseTitle(s.course))} &middot; ${esc(s.date)}</span>
    <span><span class="badge ${aiClass(s.aiScore)}">AI-pattern ${s.aiScore}%</span> <span class="badge ${simClass(s.plagMax)}">Similarity ${s.plagMax}%</span></span></div>`).join('')
    : '<p class="note">No submissions yet.</p>'}</div>`;
}

function submitCode() {
  const courseId = val('subCourse'), code = val('subCode');
  if (!code.trim()) return;
  const ai = estimateAIScore(code), mine = tokenize(code);
  let plagMax = 0, plagWith = '';
  state.submissions.filter(s => s.course === courseId && s.student !== session.username).forEach(s => {
    const sim = Math.round(jaccard(mine, tokenize(s.code)) * 100);
    if (sim > plagMax) { plagMax = sim; plagWith = s.student; }
  });
  state.submissions.push({ student: session.username, course: courseId, code, aiScore: ai.score, aiNotes: ai.notes, plagMax, plagWith, date: new Date().toLocaleString() });
  save();
  fetch(`${API_BASE}/api/submissions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ student: session.username, course: courseId, code, aiScore: ai.score, aiNotes: ai.notes, plagMax, plagWith })
  }).catch(() => {});
  ui.subCourse = courseId;
  ui.submitResult = `<div class="result-box" style="background:var(--bg)">
    <div>AI-pattern indicator: <span class="badge ${aiClass(ai.score)}">${ai.score}%</span></div>
    <ul style="margin:6px 0 10px 18px; font-weight:normal; font-size:13px">${ai.notes.map(n => `<li>${esc(n)}</li>`).join('')}</ul>
    <div>Highest similarity to another submission: <span class="badge ${simClass(plagMax)}">${plagMax}%${plagWith ? ' (vs ' + esc(plagWith) + ')' : ''}</span></div></div>`;
  render();
}
