// --- LOCAL STORAGE KEYS USED IN THIS FILE ---
// schedule        → stores all class schedule entries (day, time, student)
// leavesArray     → stores all leave identifiers (formatted as "date|time|student")
// listOfStudents  → array of all student names
// activeStudent   → currently selected student name
// ------------------------------------------------

// --- LOCAL STORAGE DATA ---
let schedule = JSON.parse(localStorage.getItem("schedule") || "[]");
let leaves = JSON.parse(localStorage.getItem("leavesArray") || "[]");
let listOfStudents = JSON.parse(localStorage.getItem("listOfStudents") || "[]");
let activeStudent =
  localStorage.getItem("activeStudent") || (listOfStudents[0] || "");

function saveLeaves() {
  localStorage.setItem("leavesArray", JSON.stringify(leaves));
}

function toggleLeave(key) {
  leaves.includes(key)
    ? (leaves = leaves.filter(x => x !== key))
    : leaves.push(key);
  saveLeaves();
  render();
}

function setActiveStudent(student) {
  activeStudent = student;
  localStorage.setItem("activeStudent", student);
  render();
}

// --- DISPLAY MONTH ---
const today = new Date();
const currentMonth = today.getMonth();
const currentYear = today.getFullYear();

let displayMonth = currentMonth;
let displayYear = currentYear;

// LIMITS: allow only previous, current, next month
const minMonth = new Date(currentYear, currentMonth - 1, 1);
const maxMonth = new Date(currentYear, currentMonth + 1, 1);

const monthNames = [
  "January", "February", "March", "April", "May", "June", "July",
  "August", "September", "October", "November", "December"
];

// --- STUDENT DROPDOWN ---
const studentSelect = document.getElementById("studentSelect");
listOfStudents.forEach(s => {
  let opt = document.createElement("option");
  opt.value = s;
  opt.textContent = s;
  studentSelect.appendChild(opt);
});
studentSelect.value = activeStudent;
studentSelect.addEventListener("change", e => setActiveStudent(e.target.value));

function buildMonthlyMatrix() {
  const last = new Date(displayYear, displayMonth + 1, 0);
  let matrix = [];
  let week = [];

  for (let d = 1; d <= last.getDate(); d++) {
    let date = new Date(displayYear, displayMonth, d);

    if (date.getDay() === 0 && week.length) {
      matrix.push(week);
      week = [];
    }
    week.push(date);
  }

  if (week.length) matrix.push(week);
  return matrix;
}

function getUniqueTimes() {
  return [...new Set(schedule.map(s => s.time))].sort(
    (a, b) => new Date("2000-1-1 " + a) - new Date("2000-1-1 " + b)
  );
}

function renderCalendar() {
  document.getElementById("monthYear").textContent =
    `${monthNames[displayMonth]} ${displayYear}`;

  const weeks = buildMonthlyMatrix();
  const times = getUniqueTimes();
  let html = "";
  const today = new Date();

  weeks.forEach((week, wIndex) => {
    html += `<div class='week-label'>Week ${wIndex + 1}</div>`;
    html += `<table><tr><th class='time-col'>Time</th>`;

    week.forEach(d => {
      let wd = d.toLocaleString("en-US", { weekday: "short" }).toUpperCase();
      html += `<th>${wd}<br>${d.getDate()}</th>`;
    });

    html += `</tr>`;

    times.forEach(time => {
      html += `<tr><td class='time-col'>${time}</td>`;

      week.forEach(d => {
        let weekday = d.toLocaleString("en-US", { weekday: "long" }).toUpperCase();
        let classEntry = schedule.find(s => s.day === weekday && s.time === time);
        let isToday = today.toDateString() === d.toDateString();

        let htmlClass = "class-cell";
        let content = "";
        let key = null;

        if (classEntry) {
          key = `${d.getDate()}|${time}|${classEntry.student}`;

          if (classEntry.student === activeStudent)
            htmlClass += " active-student";

          if (isToday) htmlClass += " today";

          if (leaves.includes(key)) htmlClass += " leave";

          content = classEntry.student;
        }

        html += `<td class='${htmlClass}' onclick="${
          key ? `toggleLeave('${key}')` : ""
        }">${content}</td>`;
      });

      html += `</tr>`;
    });

    html += `</table>`;
  });

  document.getElementById("calendarOutput").innerHTML = html;

  // Scroll current week
  let todayCell = document.querySelector(".today");
  if (todayCell) {
    let weekTable = todayCell.closest("table");
    let container = document.getElementById("calendar-section");
    container.scrollTop = weekTable.offsetTop - 10;
  }
}

function render() {
  let currentDisplayDate = new Date(displayYear, displayMonth, 1);

  document.getElementById("prevBtn").disabled =
    currentDisplayDate <= minMonth;

  document.getElementById("nextBtn").disabled =
    currentDisplayDate >= maxMonth;

  renderCalendar();
}

document.getElementById("prevBtn").addEventListener("click", () => {
  const newDate = new Date(displayYear, displayMonth - 1, 1);
  if (newDate >= minMonth) {
    displayYear = newDate.getFullYear();
    displayMonth = newDate.getMonth();
    render();
  }
});

document.getElementById("nextBtn").addEventListener("click", () => {
  const newDate = new Date(displayYear, displayMonth + 1, 1);
  if (newDate <= maxMonth) {
    displayYear = newDate.getFullYear();
    displayMonth = newDate.getMonth();
    render();
  }
});

render();
