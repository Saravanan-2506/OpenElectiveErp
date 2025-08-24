const validCredentials = {
  "student@university.edu": "password123",
  "demo@university.edu": "demo123",
};

document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  document.getElementById("emailError").style.display = "none";
  document.getElementById("passwordError").style.display = "none";

  // ✅ Check if captcha is verified
  var captchaResponse = grecaptcha.getResponse();
  if (captchaResponse.length === 0) {
    alert("Please verify you are not a robot.");
    return;
  }

  if (!email.endsWith("@university.edu")) {
    document.getElementById("emailError").style.display = "block";
    return;
  }

  if (validCredentials[email] && validCredentials[email] === password) {
    alert("Login successful! Redirecting to course selection...");
  } else {
    document.getElementById("passwordError").style.display = "block";
  }
});
