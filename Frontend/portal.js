document.getElementById("loginForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  // Reset errors
  document.getElementById("emailError").style.display = "none";
  document.getElementById("passwordError").style.display = "none";

  // ✅ Check captcha
  var captchaResponse = grecaptcha.getResponse();
  if (captchaResponse.length === 0) {
    alert("Please verify you are not a robot.");
    return;
  }

  //  FETCH request to Java backend
  try {
    const response = await fetch("http://localhost:8080/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      window.location.href = "courseSelection.html"; 
    } else {
      document.getElementById("passwordError").style.display = "block";
    }
  } catch (err) {
    console.error("Error:", err);
    alert("Server error, please try again later.");
  }
});
