// ---------- UI Helpers ----------
function populateDropdown(students, activeStudent) {
  const dropdown = document.getElementById("student-dropdown");
  const selected = dropdown.querySelector(".dropdown-selected");
  const list = dropdown.querySelector(".dropdown-options");

  list.innerHTML = "";
  students.forEach(name => {
    const li = document.createElement("li");
    li.textContent = name;
    li.onclick = () => {
      selected.textContent = name;
      dropdown.classList.remove("open");
      localStorage.setItem("activeStudent", name);
    };
    list.appendChild(li);
  });

  setDropdownToStudent(activeStudent);
}

function setDropdownToStudent(student) {
  const dropdown = document.getElementById("student-dropdown");
  const selected = dropdown.querySelector(".dropdown-selected");
  selected.textContent = student || "-- Select Student --";
}

// Toggle dropdown open/close
document.addEventListener("click", e => {
  const dropdown = document.getElementById("student-dropdown");
  if (!dropdown) return;

  if (dropdown.contains(e.target)) {
    dropdown.classList.toggle("open");
  } else {
    dropdown.classList.remove("open");
  }
});

// ---------- Restore UI on page load ----------
window.addEventListener("DOMContentLoaded", () => {
  const schedule = JSON.parse(localStorage.getItem("schedule") || "[]");
  const students = JSON.parse(localStorage.getItem("listOfStudents") || "[]");

  // decide active student
  let activeStudent = null;
  if (schedule.length) {
    const currentClass = getCurrentClass(schedule);
    if (currentClass) {
      activeStudent = currentClass.student;
    } else {
      const nextClass = getNextClass(schedule);
      if (nextClass) {
        activeStudent = nextClass.student;
      }
    }
  }

  if (!activeStudent) {
    activeStudent = localStorage.getItem("activeStudent");
  } else {
    localStorage.setItem("activeStudent", activeStudent);
  }

  populateDropdown(students, activeStudent);
});
