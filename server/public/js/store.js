/* Persistent state (localStorage) + session (sessionStorage) + small helpers */
const STORE_KEY = 'edtech_v3', SESSION_KEY = 'edtech_session_v3';

function readJSON(store, key, fallback) {
  try { const s = store.getItem(key); return s ? JSON.parse(s) : fallback; }
  catch (e) { return fallback; }
}

let state = Object.assign(
  { students: [], assignments: {}, completed: {}, attempts: [], submissions: [] },
  readJSON(localStorage, STORE_KEY, {})
);
let session = readJSON(sessionStorage, SESSION_KEY, null);

// UI-only state (not persisted)
const ui = { tab: null, quiz: null, authMode: 'login', authError: '', submitResult: '', subCourse: '' };

function save() { try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) {} }
function saveSession() {
  try {
    if (session) sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else sessionStorage.removeItem(SESSION_KEY);
  } catch (e) {}
}

const $ = id => document.getElementById(id);
const val = id => ($(id) ? $(id).value : '');
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const findStudent = u => state.students.find(s => s.username.toLowerCase() === u.toLowerCase());
const lessonKey = (student, courseId, lesson) => student + '|' + courseId + '|' + lesson;
const isDone = (student, courseId, lesson) => !!state.completed[lessonKey(student, courseId, lesson)];
const courseTitle = id => (COURSES.find(c => c.id === id) || {}).title || id;
const myCourses = () => COURSES.filter(c => (state.assignments[session.username] || []).includes(c.id));
const aiClass = n => (n >= 50 ? 'bad' : n >= 25 ? 'warn' : 'done');
const simClass = n => (n >= 60 ? 'bad' : 'done');
