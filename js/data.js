/* Static course + quiz data and demo admin credentials (prototype only) */
const ADMIN_USER='admin', ADMIN_PASS='admin123';
const COURSES = [
  {id:'c1', title:'Web Development Basics', lessons:['HTML Fundamentals','CSS Styling','JavaScript Basics']},
  {id:'c2', title:'Data Structures', lessons:['Arrays & Strings','Linked Lists','Trees & Graphs']},
  {id:'c3', title:'Assessment Skills', lessons:['Time Management','Problem Solving','Mock Test Strategy']}
];
const QUIZZES = {
  c1:[{q:'Which tag creates a hyperlink in HTML?', opts:['<link>','<a>','<href>','<nav>'], correct:1},
      {q:'Which property changes text color in CSS?', opts:['font-color','text-color','color','fg-color'], correct:2},
      {q:'Which keyword declares a block-scoped variable in JS?', opts:['var','let','global','static'], correct:1}],
  c2:[{q:'Time complexity of array index access?', opts:['O(n)','O(log n)','O(1)','O(n^2)'], correct:2},
      {q:'Which structure uses FIFO order?', opts:['Stack','Queue','Tree','Graph'], correct:1},
      {q:'A BST keeps left children...', opts:['Greater than parent','Equal to parent','Less than parent','Random'], correct:2}],
  c3:[{q:'What helps most when time is limited?', opts:['Skip easy ones','Read all questions first','Guess randomly','Ignore instructions'], correct:1},
      {q:'Reviewing wrong answers helps with...', opts:['Nothing','Finding weak areas','Wasting time','Losing marks'], correct:1},
      {q:'Good first step in problem-solving?', opts:['Start coding immediately','Understand the problem','Skip it','Copy a solution'], correct:1}],
};
