/* Router + rendering + event handling (loaded last) */
const TABS = {
  admin: [['manage', 'Manage Students'], ['submissions', 'Code Submissions']],
  student: [['courses', 'My Courses'], ['quiz', 'Take Quiz'], ['progress', 'My Progress'], ['submit', 'Submit Code']]
};
const VIEWS = {
  manage: renderManage, submissions: renderSubmissionsAdmin,
  courses: renderCourses, quiz: renderQuiz, progress: renderProgress, submit: renderSubmit
};

function render() {
  const nav = $('nav'), app = $('app');
  if (!session) { nav.innerHTML = ''; app.innerHTML = renderAuth(); return; }
  const tabs = TABS[session.role];
  if (!tabs.some(t => t[0] === ui.tab)) ui.tab = defaultTab();
  nav.innerHTML = `<span class="who">${session.role === 'admin' ? 'Admin' : 'Student'}: ${esc(session.username)}</span>` +
    tabs.map(([id, label]) => `<button class="${ui.tab === id ? 'active' : ''}" data-action="tab" data-tab="${id}">${label}</button>`).join('') +
    `<button data-action="logout">Logout</button>`;
  app.innerHTML = VIEWS[ui.tab]();
}

const ACTIONS = {
  login: doLogin,
  register: doRegister,
  logout: logout,
  authMode: d => { ui.authMode = d.mode; ui.authError = ''; ui.authSuccess = ''; render(); },
  tab: d => { ui.tab = d.tab; ui.submitResult = ''; render(); },
  assign: d => toggleAssign(d.student, d.course),
  done: d => toggleDone(d.student, d.course, d.lesson),
  startQuiz: d => startQuiz(d.course),
  selectOpt: d => selectOpt(Number(d.i)),
  nextQ: nextQ,
  quizBack: () => { ui.quiz = null; render(); },
  submitCode: submitCode
};

document.addEventListener('click', e => {
  const el = e.target.closest('[data-action]');
  if (el && !el.disabled && ACTIONS[el.dataset.action]) ACTIONS[el.dataset.action](el.dataset);
});

// Press Enter inside the login/register form to submit
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target.matches('.login-card input')) {
    const btn = document.querySelector('.login-card .submit-btn');
    if (btn) btn.click();
  }
});

render();
