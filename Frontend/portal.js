const validCredentials = {
  "2024it0007@svce.ac.in": "password",
  "2024cs0003@svce.ac.in": "password1",
  "2024me0318@svce.ac.in": "password2",
  "2024mn0660@svce.ac.in":"password3",
  "2024bt0715@svce.ac.in":"password4",
  "2024ad0183@svce.ac.in":"password5",
  "2024ee0479@svce.ac.in":"password6",
  "2024ec0292@svce.ac.in":"password7",
  "2024ch0699@svce.ac.in":"password8",
  "2024ce0676@svce.ac.in":"password9",
  "2024ae0366@svce.ac.in":"password10"

};

document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  console.log(email);
  document.getElementById("emailError").style.display = "none";
  document.getElementById("passwordError").style.display = "none";

  // ✅ Check if captcha is verified
  var captchaResponse = grecaptcha.getResponse();
  if (captchaResponse.length === 0) {
    alert("Please verify you are not a robot.");
    return;
  }

  // if (!email.endsWith("@university.edu")) {
  //   document.getElementById("emailError").style.display = "block";
  //   return;
  // }

  if (validCredentials[email] && validCredentials[email] === password) {
    alert("Login successful! Redirecting to course selection...");
  } else {
    document.getElementById("passwordError").style.display = "block";
  }

});



