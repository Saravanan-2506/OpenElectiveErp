let courses = [];
let selectedCourseId = null;
let enrolledCourseIds = []; // multiple courses allowed
let currentDeptFilter = null;
let currentSearch = "";

document.addEventListener("DOMContentLoaded", async function () {
  await fetchCourses();
  await fetchEnrolledCourses();
  renderFilterButtons();
  renderCourses();
  setupSubmitListener();
  setupRefreshButton();
  setupSearch();
  renderEnrolledList();
});

// --- API calls ---

async function fetchCourses() {
  try {
    const email = localStorage.getItem("studentEmail") || "test@svce.ac.in";
    const response = await fetch(`http://localhost:9090/api/courses/${encodeURIComponent(email)}`);
    if (!response.ok) throw new Error("Failed to fetch courses");
    courses = await response.json();
  } catch (err) {
    console.error("Error fetching courses:", err);
    courses = [];
  }
}

async function fetchEnrolledCourses() {
  try {
    const email = localStorage.getItem("studentEmail") || "test@svce.ac.in";
    const response = await fetch(`http://localhost:9090/api/enrolled/${encodeURIComponent(email)}`);
    if (!response.ok) {
      enrolledCourseIds = [];
      return;
    }
    const data = await response.json(); // array of courseSelection objects
    if (Array.isArray(data)) {
      enrolledCourseIds = data.map(c => c.id);
      // show most recent enrolled course in the right panel (if any)
      if (data.length) {
        updateSelectionPanel(data[data.length - 1]);
      }
    } else {
      enrolledCourseIds = [];
    }
    renderEnrolledList();
  } catch (err) {
    console.error("Error fetching enrolled courses:", err);
    enrolledCourseIds = [];
  }
}

// --- UI helpers ---

function setupSearch() {
  const input = document.getElementById("searchInput");
  if (!input) return;
  input.addEventListener("input", (e) => {
    currentSearch = (e.target.value || "").trim().toLowerCase();
    renderCourses();
  });
}

function renderFilterButtons() {
  const filterContainer = document.getElementById("filterBar");
  if (!filterContainer) return;

  filterContainer.innerHTML = "";

  const allBtn = document.createElement("button");
  allBtn.textContent = "All Courses";
  allBtn.className =
    "px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 transition";
  allBtn.addEventListener("click", () => {
    currentDeptFilter = null;
    renderCourses();
  });
  filterContainer.appendChild(allBtn);

  const departments = [...new Set(courses.map((c) => c.department))].filter(Boolean);
  departments.forEach((dept) => {
    const btn = document.createElement("button");
    btn.className =
      "dept-pill bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-full transition";
    btn.textContent = dept;

    btn.addEventListener("click", () => {
      currentDeptFilter = dept;
      renderCourses();
    });

    filterContainer.appendChild(btn);
  });
}

function renderCourses() {
  const container = document.getElementById("courseGrid");
  if (!container) return;
  container.innerHTML = "";

  let list = courses;

  // dept filter
  if (currentDeptFilter) {
    list = list.filter((c) => c.department === currentDeptFilter);
  }

  // search filter
  if (currentSearch) {
    const q = currentSearch;
    list = list.filter((c) => {
      const title = (c.title || "").toLowerCase();
      const inst = (c.instructor || "").toLowerCase();
      const code = (c.code || "").toLowerCase();
      return title.includes(q) || inst.includes(q) || code.includes(q);
    });
  }

  if (!list.length) {
    container.innerHTML = `<p class="text-gray-500">No courses found.</p>`;
    return;
  }

  list.forEach((course) => {
    const card = document.createElement("div");
    card.className =
      "course-card p-4 rounded-2xl shadow transition relative cursor-pointer " +
      (course.disabled
        ? "bg-gray-200 text-gray-500 opacity-60 cursor-not-allowed"
        : "bg-white hover:shadow-lg");

    // mark already enrolled courses
    if (enrolledCourseIds.includes(course.id)) {
      card.classList.add("bg-green-100", "border-green-500", "border-2");
    }

    card.innerHTML = `
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold">${course.title}</h3>
        ${
          course.disabled || enrolledCourseIds.includes(course.id)
            ? ""
            : `<input type="radio" name="course" value="${course.id}" class="hidden" />`
        }
      </div>
      <p class="text-gray-600 mt-2">Instructor: ${course.instructor || "N/A"}</p>
      <p class="text-sm text-gray-500 mt-1">Department: ${course.department}</p>
      <p class="text-xs text-gray-400 mt-1">Capacity: ${course.enrolled}/${course.capacity}</p>
    `;

    // allow selection if course is not restricted/full and not already enrolled
    if (!course.disabled && !enrolledCourseIds.includes(course.id)) {
      const radio = card.querySelector("input[type='radio']");
      card.addEventListener("click", () => {
        if (!radio) return;
        radio.checked = true;
        selectedCourseId = course.id;

        // highlight selected card
        document.querySelectorAll(".course-card").forEach((c) => c.classList.remove("selected"));
        card.classList.add("selected");

        // update right panel
        updateSelectionPanel(course);
      });
    }

    container.appendChild(card);
  });
}

function updateSelectionPanel(course) {
  if (!course) return;

  document.getElementById("selectedCourse").classList.add("hidden");
  const details = document.getElementById("selectionDetails");
  details.classList.remove("hidden");

  const panel = details.querySelector("div");
  panel.classList.remove("bg-blue-50", "bg-green-100", "border-green-500", "border-2");

  if (enrolledCourseIds.includes(course.id)) {
    panel.classList.add("bg-green-100", "border-green-500", "border-2");
  } else {
    panel.classList.add("bg-blue-50");
  }

  document.getElementById("selectedCourseTitle").textContent = course.title;
  document.getElementById("selectedCourseInstructor").textContent =
    course.instructor || "Unknown instructor";
  document.getElementById("selectedCourseDetails").textContent =
    `Code: ${course.code} | Capacity: ${course.capacity} | Enrolled: ${course.enrolled}`;
}

function renderEnrolledList() {
  const ul = document.getElementById("enrolledCoursesList");
  if (!ul) return;
  ul.innerHTML = "";

  if (!enrolledCourseIds.length) {
    ul.innerHTML = `<li class="text-gray-500">Not enrolled in any course yet.</li>`;
    return;
  }

  const enrolledCourses = courses.filter(c => enrolledCourseIds.includes(c.id));
  enrolledCourses.forEach(c => {
    const li = document.createElement("li");
    li.textContent = `${c.title} (${c.code}) — ${c.instructor || "N/A"}`;
    ul.appendChild(li);
  });
}

function setupSubmitListener() {
  const submitBtn = document.getElementById("submitBtn");
  if (!submitBtn) return;

  submitBtn.addEventListener("click", async () => {
    if (!selectedCourseId) {
      alert("Please select a course before submitting.");
      return;
    }

    if (enrolledCourseIds.includes(selectedCourseId)) {
      alert("You are already enrolled in this course!");
      return;
    }

    const enrollment = {
      email: localStorage.getItem("studentEmail"),
      rollNo: localStorage.getItem("rollNo"),
      name: localStorage.getItem("studentName"),
      department: localStorage.getItem("department"),
      courseId: selectedCourseId,
    };

    try {
      const response = await fetch("http://localhost:9090/api/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(enrollment),
      });

      const result = await response.text();
      alert(result);

      if (result.toLowerCase().includes("successful")) {
        // add to enrolled list locally and refresh remote counts
        enrolledCourseIds.push(selectedCourseId);
        await fetchCourses();
        await fetchEnrolledCourses();
        renderCourses();
        renderEnrolledList();
      }
    } catch (err) {
      console.error("Error enrolling:", err);
      alert("⚠️ Enrollment failed, please try again later.");
    }
  });
}

function setupRefreshButton() {
  const btn = document.getElementById("refreshBtn");
  if (!btn) return;
  btn.addEventListener("click", async () => {
    await fetchCourses();
    await fetchEnrolledCourses();
    renderFilterButtons();
    renderCourses();
    renderEnrolledList();
  });
}
