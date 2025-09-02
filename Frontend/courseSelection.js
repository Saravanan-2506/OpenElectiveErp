

let courses = []; // will be loaded from backend
let selectedCourseId = null;

document.addEventListener("DOMContentLoaded", async function () {
  await fetchCourses();
  renderFilterButtons();
  renderCourses();
  setupEventListeners();
});

// Fetch courses from backend
async function fetchCourses() {
  try {
    const response = await fetch("http://localhost:9090/api/courses");
    if (!response.ok) throw new Error("Failed to fetch courses");
    courses = await response.json();
  } catch (err) {
    console.error("Error fetching courses:", err);
    courses = []; // fallback
  }
}

// Render filter buttons (departments)
function renderFilterButtons() {
  const filterContainer = document.getElementById("filterBar");
  if (!filterContainer) return;

  filterContainer.innerHTML = "";

  // Always add "All Courses" first
  const allBtn = document.createElement("button");
  allBtn.textContent = "All Courses";
  allBtn.className =
    "px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 transition";
  allBtn.addEventListener("click", () => renderCourses());
  filterContainer.appendChild(allBtn);

  // Add department buttons
  const departments = [...new Set(courses.map((c) => c.department))];
  departments.forEach((dept) => {
    const btn = document.createElement("button");
    btn.className =
      "dept-pill bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-full transition";
    btn.textContent = dept;

    btn.addEventListener("click", () => {
      renderCourses(dept);
    });

    filterContainer.appendChild(btn);
  });
}

// Render courses
function renderCourses(filterDept = null) {
  const container = document.getElementById("courseGrid");
  if (!container) return;

  container.innerHTML = "";

  let filteredCourses = filterDept
    ? courses.filter((c) => c.department === filterDept)
    : courses;

  if (filteredCourses.length === 0) {
    container.innerHTML = `<p class="text-gray-500">No courses found.</p>`;
    return;
  }

  filteredCourses.forEach((course) => {
    const card = document.createElement("div");
    card.className =
      "course-card p-4 bg-white rounded-2xl shadow hover:shadow-lg transition relative";

    card.innerHTML = `
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-800">${course.name}</h3>
        <label class="flex items-center cursor-pointer">
          <input type="radio" name="course" value="${course.id}" class="hidden" />
          <span class="radio-custom"></span>
        </label>
      </div>
      <p class="text-gray-600 mt-2">${course.description || "No description"}</p>
      <p class="text-sm text-gray-500 mt-1">Department: ${course.department}</p>
    `;

    const radio = card.querySelector("input[type='radio']");
    radio.addEventListener("change", () => {
      selectedCourseId = course.id;

      // Highlight selection
      document
        .querySelectorAll(".course-card")
        .forEach((c) => c.classList.remove("selected"));
      card.classList.add("selected");

      // Update right panel
      document.getElementById("selectedCourse").classList.add("hidden");
      document.getElementById("selectionDetails").classList.remove("hidden");
      document.getElementById("selectedCourseTitle").textContent = course.name;
      document.getElementById("selectedCourseInstructor").textContent =
        course.instructor || "Unknown instructor";
      document.getElementById("selectedCourseDetails").textContent =
        course.description || "No description available.";
    });

    container.appendChild(card);
  });
}

// Setup event listeners (submit, etc.)
function setupEventListeners() {
  const submitBtn = document.getElementById("submitBtn");
  if (!submitBtn) return;

  submitBtn.addEventListener("click", () => {
    if (!selectedCourseId) {
      alert("Please select a course before submitting.");
      return;
    }
    alert(`Course with ID ${selectedCourseId} submitted! ✅`);
  });
}
