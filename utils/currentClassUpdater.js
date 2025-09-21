// utils/currentClassUpdater.js
export function updateCurrentClassAndReload() {
  const schedule = JSON.parse(localStorage.getItem("schedule") || "[]");
  if (!schedule.length) {
    console.warn("No schedule found in localStorage.");
    return;
  }

  const now = new Date();

  // Convert time string + day to Date object
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

    const today = now.getDay();
    const classDay = ["SUNDAY","MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY"].indexOf(day);
    const diff = (classDay - today + 7) % 7;

    const date = new Date(now);
    date.setDate(now.getDate() + diff);
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  let currentClass = null;

  for (const entry of schedule) {
    const start = parseTime(entry.time, entry.day);
    const end = new Date(start.getTime() + 30 * 60000); // 30 min class
    if (now >= start && now < end) {
      currentClass = {
        studentName: entry.student,
        classTime: start.toISOString().replace(/[-:]/g,"").slice(0, 12) // e.g., 202509210930
      };
      break;
    }
  }

  // Update localStorage
  if (currentClass) {
    localStorage.setItem("currentClass", JSON.stringify(currentClass));
  } else {
    localStorage.removeItem("currentClass");
  }

  // Reload page
  location.reload();
}
