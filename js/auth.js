/* Login / register / logout with MongoDB API integration and offline fallback */
const defaultTab = () => (session && session.role === 'admin' ? 'manage' : 'courses');

// Backend API URL (empty string uses relative URL when served from the Express server)
const API_BASE = window.location.port === '5000' || window.location.pathname.startsWith('/api') 
  ? '' 
  : 'http://localhost:5000';

function renderAuth() {
  const err = ui.authError ? `<p class="error">${esc(ui.authError)}</p>` : '';
  const success = ui.authSuccess ? `<p class="note" style="color:var(--ok);font-weight:600">${esc(ui.authSuccess)}</p>` : '';
  
  if (ui.authMode === 'login') {
    return `<div class="login-wrap"><div class="login-card">
      <h2>Sign in</h2>
      <p class="note">Admin demo login: <b>admin</b> / <b>admin123</b></p>
      ${err}${success}
      <input type="text" id="luser" placeholder="Username" autocomplete="username">
      <input type="password" id="lpass" placeholder="Password" autocomplete="current-password">
      <button class="submit-btn" style="width:100%" data-action="login">Sign In</button>
      <p style="margin-top:12px">New student? <button class="link" data-action="authMode" data-mode="register">Register here</button></p>
      <div style="margin-top:14px; font-size:12px; color:var(--text-muted); text-align:center;">
        🍃 Connected to MongoDB backend
      </div>
    </div></div>`;
  }
  return `<div class="login-wrap"><div class="login-card">
    <h2>Student Registration</h2>
    <p class="note">Account details will be saved to your MongoDB database.</p>
    ${err}${success}
    <input type="text" id="ruser" placeholder="Choose a username" autocomplete="username">
    <input type="password" id="rpass" placeholder="Choose a password" autocomplete="new-password">
    <input type="password" id="rpass2" placeholder="Confirm password" autocomplete="new-password">
    <button class="submit-btn" style="width:100%" data-action="register">Create Account</button>
    <p style="margin-top:12px"><button class="link" data-action="authMode" data-mode="login">Back to sign in</button></p>
    <div style="margin-top:14px; font-size:12px; color:var(--text-muted); text-align:center;">
      🍃 Stored directly in MongoDB collection: <code>users</code>
    </div>
  </div></div>`;
}

async function doLogin() {
  const u = val('luser').trim(), p = val('lpass');
  ui.authError = '';
  ui.authSuccess = '';
  
  if (!u || !p) {
    ui.authError = 'Enter both username and password.';
    render();
    return;
  }
  
  if (u.toLowerCase() === ADMIN_USER) {
    if (p !== ADMIN_PASS) {
      ui.authError = 'Incorrect admin password.';
    } else {
      session = { username: 'admin', role: 'admin' };
      // Sync registered students from MongoDB
      try {
        const res = await fetch(`${API_BASE}/api/auth/students`);
        const data = await res.json();
        if (data.success && Array.isArray(data.students)) {
          data.students.forEach(st => {
            if (!state.students.some(s => s.username === st.username)) {
              state.students.push({ username: st.username, password: '' });
            }
            if (st.assignedCourses) {
              state.assignments[st.username] = st.assignedCourses;
            }
          });
          save();
        }
      } catch (err) {
        console.warn('Could not sync students from MongoDB:', err);
      }
    }
    if (session) { saveSession(); ui.tab = defaultTab(); ui.quiz = null; }
    render();
    return;
  }

  // Attempt login via MongoDB API
  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: u, password: p })
    });
    const data = await res.json();
    
    if (data.success && data.user) {
      session = { username: data.user.username, role: data.user.role || 'student' };
      // Sync assignments and progress from MongoDB to local state
      if (data.user.assignedCourses) {
        state.assignments[data.user.username] = data.user.assignedCourses;
      }
      if (data.user.completedLessons && Array.isArray(data.user.completedLessons)) {
        data.user.completedLessons.forEach(l => {
          state.completed[lessonKey(data.user.username, l.courseId, l.lesson)] = true;
        });
      }
      if (data.user.quizAttempts) {
        state.attempts = state.attempts.filter(a => a.student !== data.user.username).concat(data.user.quizAttempts.map(q => ({
          student: data.user.username,
          course: q.course,
          score: q.score,
          total: q.total,
          date: q.date
        })));
      }
      save();
      saveSession();
      ui.tab = defaultTab();
      ui.quiz = null;
      render();
      return;
    } else {
      ui.authError = data.error || 'Login failed.';
      render();
      return;
    }
  } catch (netErr) {
    // If backend server is not running, fallback to localStorage
    console.warn('API server unreachable, falling back to local storage:', netErr);
    const st = findStudent(u);
    if (!st) ui.authError = 'No account found. Register below first.';
    else if (st.password !== p) ui.authError = 'Incorrect password.';
    else {
      session = { username: st.username, role: 'student' };
      saveSession();
      ui.tab = defaultTab();
      ui.quiz = null;
    }
    render();
  }
}

async function doRegister() {
  const u = val('ruser').trim(), p = val('rpass'), p2 = val('rpass2');
  ui.authError = '';
  ui.authSuccess = '';
  
  if (!u || !p) {
    ui.authError = 'Enter a username and password.';
    render();
    return;
  }
  if (u.toLowerCase() === ADMIN_USER) {
    ui.authError = 'That username is reserved.';
    render();
    return;
  }
  if (p !== p2) {
    ui.authError = 'Passwords do not match.';
    render();
    return;
  }

  // Attempt registration in MongoDB via backend API
  try {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: u, password: p })
    });
    const data = await res.json();
    
    if (data.success) {
      // Also cache in local state
      if (!findStudent(u)) {
        state.students.push({ username: u, password: p });
        state.assignments[u] = [];
        save();
      }
      ui.authMode = 'login';
      ui.authSuccess = 'Account saved in MongoDB! Please log in.';
    } else {
      ui.authError = data.error || 'Registration failed.';
    }
  } catch (netErr) {
    // If server is not reachable, fallback to localStorage
    console.warn('MongoDB API offline, saving to local storage:', netErr);
    if (findStudent(u)) {
      ui.authError = 'Username already taken. Please login instead.';
    } else {
      state.students.push({ username: u, password: p });
      state.assignments[u] = [];
      save();
      ui.authMode = 'login';
      ui.authSuccess = 'Account created locally (MongoDB backend offline). Please log in.';
    }
  }
  render();
}

function logout() {
  session = null; 
  saveSession();
  Object.assign(ui, { tab: null, quiz: null, authMode: 'login', authError: '', authSuccess: '', submitResult: '' });
  render();
}
