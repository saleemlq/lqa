// ---------- Helpers ----------
function parseSchedule(text) {
  const lines = text.trim().split("\n").filter(l => l.trim());
  const headerLine = lines.find(l => l.toLowerCase().includes("monday"));
  if (!headerLine) return [];
  const header = headerLine.split("\t");
  const days = header.slice(1).map(d => d.trim());

  const schedule = [];
  for (let i = lines.indexOf(headerLine) + 1; i < lines.length; i++) {
    const parts = lines[i].split("\t");
    if (parts.length < 2) continue;

    const time = parts[0].trim();
    for (let d = 1; d < parts.length; d++) {
      const student = parts[d].trim();
      if (student) {
        schedule.push({
          day: days[d - 1].toUpperCase(),
          time,
          student
        });
      }
    }
  }
  return schedule;
}

function parseTime(timeStr, day) {
  let hours, minutes;

  if (timeStr.includes("AM") || timeStr.includes("PM")) {
    const [hhmm, meridiem] = timeStr.split(" ");
    [hours, minutes] = hhmm.split(":").map(Number);
    if (meridiem === "PM" && hours !== 12) hours += 12;
    if (meridiem === "AM" && hours === 12) hours = 0;
  } else {
    [hours, minutes] = timeStr.split(":").map(Number);
  }

  const now = new Date();
  const today = now.getDay();
  const classDay = ["SUNDAY","MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY"].indexOf(day);

  const diff = (classDay - today + 7) % 7;
  const date = new Date(now);
  date.setDate(now.getDate() + diff);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

function getCurrentClass(schedule) {
  const now = new Date();

  for (let entry of schedule) {
    const start = parseTime(entry.time, entry.day);
    const end = new Date(start.getTime() + 30 * 60000);

    if (now >= start && now < end) {
      return { start, student: entry.student };
    }
  }
  return null;
}

function getNextClass(schedule) {
  const now = new Date();
  let nearest = null;

  for (let entry of schedule) {
    const start = parseTime(entry.time, entry.day);
    if (start > now && (!nearest || start < nearest.start)) {
      nearest = { start, student: entry.student };
    }
  }

  return nearest;
}

function getListOfStudents(schedule) {
  return [...new Set(schedule.map(e => e.student))];
}

// ---------- NEW: Auto-update current class on page load ----------
function updateCurrentClassOnLoad() {
  const scheduleJSON = localStorage.getItem("schedule");
  if (!scheduleJSON) return;

  const schedule = JSON.parse(scheduleJSON);

  // find current class
  const currentClass = getCurrentClass(schedule);

  if (currentClass) {
    const classTimeStr =
      currentClass.start.getFullYear().toString() +
      String(currentClass.start.getMonth() + 1).padStart(2, "0") +
      String(currentClass.start.getDate()).padStart(2, "0") +
      String(currentClass.start.getHours()).padStart(2, "0") +
      String(currentClass.start.getMinutes()).padStart(2, "0");

    localStorage.setItem(
      "currentClass",
      JSON.stringify({
        studentName: currentClass.student,
        classTime: classTimeStr
      })
    );

    localStorage.setItem("activeStudent", currentClass.student);
    return;
  }

  // otherwise next class
  const nextClass = getNextClass(schedule);
  if (nextClass) {
    localStorage.setItem("activeStudent", nextClass.student);
  }

  localStorage.removeItem("currentClass");
}

// ---------- Save Schedule ----------
async function saveScheduleFromClipboard() {
  try {
    const text = await navigator.clipboard.readText();
    if (!text) {
      alert("Clipboard is empty or permission denied.");
      return;
    }

    const schedule = parseSchedule(text);
    const students = getListOfStudents(schedule);

    if (!schedule.length || !students.length) {
      alert("No Valid Schedule Found!");
      return;
    }

    localStorage.setItem("schedule", JSON.stringify(schedule));
    localStorage.setItem("listOfStudents", JSON.stringify(students));

    // decide active student + current class
    let activeStudent = null;
    let currentClass = getCurrentClass(schedule);

    if (currentClass) {
      activeStudent = currentClass.student;
      const classTimeStr =
        currentClass.start.getFullYear().toString() +
        String(currentClass.start.getMonth() + 1).padStart(2, "0") +
        String(currentClass.start.getDate()).padStart(2, "0") +
        String(currentClass.start.getHours()).padStart(2, "0") +
        String(currentClass.start.getMinutes()).padStart(2, "0");

      localStorage.setItem(
        "currentClass",
        JSON.stringify({
          studentName: currentClass.student,
          classTime: classTimeStr
        })
      );
    } else {
      const nextClass = getNextClass(schedule);
      if (nextClass) {
        activeStudent = nextClass.student;
      }
      localStorage.removeItem("currentClass");
    }

    if (activeStudent) {
      localStorage.setItem("activeStudent", activeStudent);
    }

    location.reload();

  } catch (err) {
    console.error("Error fetching clipboard text:", err);
    alert("Failed to read clipboard. Please allow clipboard permissions.");
  }
}

// attach handler
window.addEventListener("DOMContentLoaded", () => {
  updateCurrentClassOnLoad(); // 👈 NEW: auto update on load

  const btn = document.getElementById("manage-schedule-btn");
  if (btn) {
    btn.addEventListener("click", saveScheduleFromClipboard);
  }
});
