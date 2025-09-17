function parseSchedule(text) {
  const lines = text.trim().split("\n").filter(l => l.trim());

  // Find header line
  const headerLine = lines.find(l => l.includes("MONDAY") || l.includes("Monday"));
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
  const [hhmm, meridiem] = timeStr.split(" ");
  let [hours, minutes] = hhmm.split(":").map(Number);
  if (meridiem === "PM" && hours !== 12) hours += 12;
  if (meridiem === "AM" && hours === 12) hours = 0;

  const now = new Date();
  const today = now.getDay(); // 0=Sun,1=Mon...
  const classDay = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"].indexOf(day);

  const diff = (classDay - today + 7) % 7;
  const date = new Date(now);
  date.setDate(now.getDate() + diff);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

function getCurrentOrNextClass(text) {
  const schedule = parseSchedule(text);
  if (!schedule.length) {
    return { status: "none", student: "", note: "⚠️ No valid schedule found." };
  }

  const now = new Date();

  // Check ongoing
  for (let entry of schedule) {
    const start = parseTime(entry.time, entry.day);
    const end = new Date(start.getTime() + 30 * 60000);
    if (now >= start && now < end) {
      return {
        status: "current",
        student: entry.student,
        note: `Current Class: ${entry.student} (${entry.time}, ${entry.day})`
      };
    }
  }

  // Check upcoming
  const upcoming = schedule
    .map(e => ({ ...e, date: parseTime(e.time, e.day) }))
    .filter(e => e.date > now)
    .sort((a, b) => a.date - b.date);

  if (upcoming.length) {
    const n = upcoming[0];
    return {
      status: "next",
      student: n.student,
      note: `Next Class: ${n.student} at ${n.time} on ${n.day}`
    };
  }

  return { status: "none", student: "", note: "No more classes scheduled." };
}
