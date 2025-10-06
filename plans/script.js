// List of Islamic vocabulary for autocompletion
const islamicTerms = [
  "Tajweed", "Makharij", "Qiraat", "Tilawah", "Sajdah", "Hifz",
  "Tafsir", "Iqra", "Noorani Qaida", "Fiqh", "Taqwa", "Hadith",
  "Shahadah", "Akhlaq", "Adab", "Surah", "Ayah", "Barakah",
  "Niyyah", "Iman"
];

const studentSelect = document.getElementById("studentSelect");
const filterSelect = document.getElementById("filterSelect");
const plansContainer = document.getElementById("plansContainer");
const title = document.getElementById("title");

function capitalizeName(name) {
  return name.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

// ✅ Only reads from localStorage key 'listOfStudents'
function getAllStudents() {
  const list = JSON.parse(localStorage.getItem("listOfStudents") || "[]");
  const students = {};

  list.forEach(name => {
    const formattedName = capitalizeName(name);
    // Each student's plans stored separately under "plans_<name>"
    const storedPlans = JSON.parse(localStorage.getItem(`plans_${formattedName}`) || "null");
    students[formattedName] = storedPlans || Array(5).fill("").map(() => ({ text: "", done: false }));
  });

  return students;
}

// ✅ Save all plan data per student (not the list itself)
function saveAllStudents(students) {
  Object.entries(students).forEach(([name, plans]) => {
    localStorage.setItem(`plans_${name}`, JSON.stringify(plans));
  });
}

function loadStudents() {
  const students = getAllStudents();
  studentSelect.innerHTML = "<option disabled selected>Select Student</option>";

  Object.keys(students).forEach(name => {
    const option = document.createElement("option");
    option.textContent = name;
    studentSelect.appendChild(option);
  });

  const savedStudent = localStorage.getItem("selectedStudent");
  if (savedStudent && students[savedStudent]) {
    studentSelect.value = savedStudent;
    title.innerText = `${savedStudent}'s Class Plans`;
    loadPlans(savedStudent);
  } else {
    plansContainer.innerHTML = "";
    title.innerText = "Student's Class Plans";
  }

  filterSelect.value = "incomplete"; // Default filter
}

studentSelect.onchange = () => {
  const selected = studentSelect.value;
  localStorage.setItem("selectedStudent", selected);
  title.innerText = `${selected}'s Class Plans`;
  loadPlans(selected);
};

filterSelect.onchange = () => {
  loadPlans(studentSelect.value);
};

function loadPlans(student) {
  const students = getAllStudents();
  let allPlans = students[student] || [];
  const completedPlans = allPlans.filter(p => p.done);
  let incompletePlans = allPlans.filter(p => !p.done);

  const filter = filterSelect.value;
  plansContainer.innerHTML = "";

  if (filter === "completed") {
    completedPlans.forEach((plan, i) => {
      renderPlan(plan, i, completedPlans, student, true);
    });
  } else {
    while (incompletePlans.length < 5) {
      incompletePlans.push({ text: "", done: false });
    }
    incompletePlans.forEach((plan, i) => {
      renderPlan(plan, i, incompletePlans, student, false);
    });
    students[student] = [...incompletePlans, ...completedPlans];
    saveAllStudents(students);
  }
}

function renderPlan(plan, i, plans, student, isCompletedView) {
  const div = document.createElement("div");
  div.className = "plan" + (plan.done ? " completed" : "");

  const textarea = document.createElement("textarea");
  textarea.value = plan.text;
  textarea.style.height = 'auto';

  const suggestion = document.createElement("div");
  suggestion.className = "suggestion";

  textarea.oninput = () => {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
    plan.text = textarea.value;
    plans[i].text = textarea.value;
    const allStudents = getAllStudents();
    allStudents[student] = mergePlans(plans, student, isCompletedView);
    saveAllStudents(allStudents);
    updateSuggestion(textarea, suggestion);
  };

  textarea.onkeydown = e => {
    if (e.key === "Tab" && suggestion.textContent) {
      e.preventDefault();
      textarea.value = suggestion.textContent;
      plan.text = textarea.value;
      plans[i].text = textarea.value;
      const allStudents = getAllStudents();
      allStudents[student] = mergePlans(plans, student, isCompletedView);
      saveAllStudents(allStudents);
      updateSuggestion(textarea, suggestion);
    }
  };

  textarea.onblur = () => {
    if (!textarea.value.trim()) {
      plans.splice(i, 1);
      if (!isCompletedView) {
        while (plans.length < 5)
          plans.push({ text: "", done: false });
      }
      const allStudents = getAllStudents();
      allStudents[student] = mergePlans(plans, student, isCompletedView);
      saveAllStudents(allStudents);
      loadPlans(student);
    }
  };

  div.appendChild(textarea);
  div.appendChild(suggestion);
  plansContainer.appendChild(div);
  textarea.style.height = 'auto';
  textarea.style.height = textarea.scrollHeight + 'px';

  updateSuggestion(textarea, suggestion);

  const actions = document.createElement("div");
  actions.className = "actions";

  const doneBtn = document.createElement("button");
  doneBtn.textContent = plan.done ? "Undo" : "Complete";
  doneBtn.onclick = () => {
    plan.done = !plan.done;
    const allStudents = getAllStudents();
    allStudents[student] = mergePlans(plans, student, isCompletedView);
    saveAllStudents(allStudents);
    loadPlans(student);
  };

  const delBtn = document.createElement("button");
  delBtn.textContent = "Delete";
  delBtn.onclick = () => {
    plans.splice(i, 1);
    if (!isCompletedView) {
      while (plans.length < 5)
        plans.push({ text: "", done: false });
    }
    const allStudents = getAllStudents();
    allStudents[student] = mergePlans(plans, student, isCompletedView);
    saveAllStudents(allStudents);
    loadPlans(student);
  };

  actions.appendChild(doneBtn);
  actions.appendChild(delBtn);
  div.appendChild(actions);
}

function mergePlans(plansSubset, student, isCompletedView) {
  const all = getAllStudents()[student];
  const others = all.filter(p => p.done !== isCompletedView);
  return isCompletedView ? [...others, ...plansSubset] : [...plansSubset, ...others];
}

function updateSuggestion(input, suggestionEl) {
  const val = input.value;
  if (!val) return (suggestionEl.textContent = "");
  const match = islamicTerms.find(word => word.toLowerCase().startsWith(val.toLowerCase()));
  suggestionEl.textContent = match && match.toLowerCase() !== val.toLowerCase() ? match : "";
}

loadStudents();
