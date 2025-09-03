document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const emailError = document.getElementById("emailError");
  const passwordError = document.getElementById("passwordError");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    emailError.style.display = "none";
    passwordError.style.display = "none";

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email) {
      emailError.textContent = "Email is required";
      emailError.style.display = "block";
      return;
    }

    // reCAPTCHA client-side presence check (optional)
    try {
      const captcha = (window.grecaptcha && window.grecaptcha.getResponse && window.grecaptcha.getResponse()) || "";
      // You can optionally require captcha to be filled; skipping to keep this demo simple
    } catch (_) { }

    try {
      const res = await fetch("http://localhost:9090/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        passwordError.textContent = "Invalid email or password";
        passwordError.style.display = "block";
        return;
      }

      const data = await res.json(); // { success, message, rollNo, department, name }
      if (!data.success) {
        passwordError.textContent = data.message || "Login failed";
        passwordError.style.display = "block";
        return;
      }

      // store details for course selection page
      localStorage.setItem("studentEmail", email);
      localStorage.setItem("rollNo", data.rollNo);
      localStorage.setItem("department", data.department);
      localStorage.setItem("studentName", data.name);

      // redirect to courseSelection page
      window.location.href = "courseSelection.html";
    } catch (err) {
      console.error(err);
      passwordError.textContent = "Network error. Please try again.";
      passwordError.style.display = "block";
    }
  });
});
