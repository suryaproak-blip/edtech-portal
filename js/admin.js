/* Admin: assign courses, mark lessons complete, review submissions */
function renderManage() {
  if (!state.students.length)
    return `<div class="card"><h2>Manage Students</h2><p class="note">No students have registered yet.</p></div>`;
  return state.students.map(st => {
    const assigned = state.assignments[st.username] || [];
    return `<div class="card"><h2>${esc(st.username)}</h2>
      <p class="note">Assign courses:</p>
      <div class="checks">${COURSES.map(c =>
        `<span class="chk ${assigned.includes(c.id) ? 'on' : ''}" data-action="assign" data-student="${esc(st.username)}" data-course="${c.id}">${esc(c.title)}</span>`).join('')}</div>
      ${COURSES.filter(c => assigned.includes(c.id)).map(c => `<div class="subcard"><b>${esc(c.title)}</b>
        ${c.lessons.map(l => {
          const done = isDone(st.username, c.id, l);
          return `<div class="lesson-row"><span>${esc(l)}</span>
            <button class="small ${done ? 'outline' : ''}" data-action="done" data-student="${esc(st.username)}" data-course="${c.id}" data-lesson="${esc(l)}">${done ? 'Mark Incomplete' : 'Mark Complete'}</button></div>`;
        }).join('')}</div>`).join('')}
    </div>`;
  }).join('');
}

function toggleAssign(student, courseId) {
  const list = state.assignments[student] || [];
  const i = list.indexOf(courseId);
  if (i >= 0) list.splice(i, 1); else list.push(courseId);
  state.assignments[student] = list;
  save(); render();
  fetch(`${API_BASE}/api/auth/assign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ student, courseId })
  }).catch(() => {});
}

function toggleDone(student, courseId, lesson) {
  const k = lessonKey(student, courseId, lesson);
  state.completed[k] = !state.completed[k];
  save(); render();
  fetch(`${API_BASE}/api/auth/progress`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ student, courseId, lesson })
  }).catch(() => {});
}

function renderSubmissionsAdmin() {
  if (!state.submissions.length)
    return `<div class="card"><h2>Code Submissions</h2><p class="note">No submissions yet.</p></div>`;
  return `<div class="card"><h2>All Code Submissions</h2><table>
    <tr><th>Student</th><th>Course</th><th>AI-pattern</th><th>Similarity</th><th>Date</th></tr>
    ${state.submissions.map(s => `<tr><td>${esc(s.student)}</td><td>${esc(courseTitle(s.course))}</td>
      <td><span class="badge ${aiClass(s.aiScore)}">${s.aiScore}%</span></td>
      <td><span class="badge ${simClass(s.plagMax)}">${s.plagMax}%${s.plagWith ? ' / ' + esc(s.plagWith) : ''}</span></td>
      <td>${esc(s.date)}</td></tr>`).join('')}</table></div>`;
}
