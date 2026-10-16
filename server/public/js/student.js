/* Student: courses (read-only status), quiz, progress */
function renderCourses() {
  const mine = myCourses();
  if (!mine.length)
    return `<div class="card"><h2>My Courses</h2><p class="note">No courses assigned yet. Ask your instructor to assign courses.</p></div>`;
  return `<div class="grid">${mine.map(c => {
    const done = c.lessons.filter(l => isDone(session.username, c.id, l)).length;
    return `<div class="card"><h2>${esc(c.title)}</h2>
      <div class="progress-bar"><div class="progress-fill" style="width:${done / c.lessons.length * 100}%"></div></div>
      <p class="note">Marked complete by your instructor as you finish each lesson.</p>
      ${c.lessons.map(l => {
        const d = isDone(session.username, c.id, l);
        return `<div class="lesson-row"><span>${esc(l)}</span><span class="badge ${d ? 'done' : 'pending'}">${d ? 'Done' : 'Pending'}</span></div>`;
      }).join('')}</div>`;
  }).join('')}</div>`;
}

function renderQuiz() {
  const mine = myCourses(), q = ui.quiz;
  if (!q) {
    if (!mine.length) return `<div class="card"><h2>Take Quiz</h2><p class="note">No assigned courses yet.</p></div>`;
    return `<div class="card"><h2>Choose a course to test yourself</h2>${mine.map(c =>
      `<button class="small" style="margin:6px 6px 0 0" data-action="startQuiz" data-course="${c.id}">${esc(c.title)}</button>`).join('')}</div>`;
  }
  const qs = QUIZZES[q.courseId];
  if (q.idx >= qs.length) {
    const correct = q.answers.filter((a, i) => a === qs[i].correct).length;
    const pct = Math.round(correct / qs.length * 100), pass = pct >= 60;
    return `<div class="card"><h2>Quiz Result (auto-graded)</h2>
      <div class="result-box" style="background:${pass ? '#16A34A22' : '#DC262622'}; color:${pass ? 'var(--ok)' : 'var(--danger)'}">You scored ${correct} / ${qs.length} (${pct}%)</div>
      <button class="small" style="margin-top:14px" data-action="quizBack">Back</button></div>`;
  }
  const cur = qs[q.idx], none = q.selected === null;
  return `<div class="card"><h2>Question ${q.idx + 1} of ${qs.length}</h2><p>${esc(cur.q)}</p>
    ${cur.opts.map((o, i) => `<button class="opt ${q.selected === i ? 'selected' : ''}" data-action="selectOpt" data-i="${i}">${esc(o)}</button>`).join('')}
    <br><button class="submit-btn" ${none ? 'disabled style="opacity:.5"' : ''} data-action="nextQ">Next</button></div>`;
}

function startQuiz(courseId) { ui.quiz = { courseId, idx: 0, answers: [], selected: null }; render(); }
function selectOpt(i) { ui.quiz.selected = i; render(); }
function nextQ() {
  const q = ui.quiz;
  if (q.selected === null) return;
  q.answers.push(q.selected); q.idx++; q.selected = null;
  const qs = QUIZZES[q.courseId];
  if (q.idx >= qs.length) {
    const score = q.answers.filter((a, i) => a === qs[i].correct).length;
    state.attempts.push({ student: session.username, course: q.courseId, score, total: qs.length, date: new Date().toLocaleDateString() });
    save();
    fetch(`${API_BASE}/api/auth/quiz`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student: session.username, course: q.courseId, score, total: qs.length })
    }).catch(() => {});
  }
  render();
}

function renderProgress() {
  const mine = myCourses();
  const total = mine.reduce((s, c) => s + c.lessons.length, 0);
  const done = mine.reduce((s, c) => s + c.lessons.filter(l => isDone(session.username, c.id, l)).length, 0);
  const attempts = state.attempts.filter(a => a.student === session.username);
  return `<div class="card"><h2>Overall Lesson Progress</h2>
    <div class="progress-bar"><div class="progress-fill" style="width:${total ? done / total * 100 : 0}%"></div></div>
    <p class="note">${done} of ${total} lessons completed</p></div>
    <div class="card"><h2>Quiz Attempt History (auto-graded)</h2>
    ${attempts.length ? attempts.map(a => {
      const pct = Math.round(a.score / a.total * 100);
      return `<div class="bar-row"><span class="label">${esc(courseTitle(a.course))}</span><div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div><span style="font-size:12px">${pct}%</span></div>`;
    }).join('') : '<p class="note">No quizzes attempted yet.</p>'}</div>`;
}
