document.getElementById("login-btn").addEventListener("click", () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    alert("Please enter both email and password.");
    return;
  }

  // Save login state
  localStorage.setItem("isLoggedIn", "true");
  localStorage.setItem("userId", email);  // save as logged-in user ID

  alert("Sign-in Successful!");

  // Redirect to home page
  window.location.href = "index.html";
});
