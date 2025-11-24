document.getElementById("login-btn").addEventListener("click", () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    alert("Please enter both email and password.");
    return;
  }

  // Save login state
  localStorage.setItem("isLoggedIn", "true");
  localStorage.setItem("userId", email);

  alert("Sign-in Successful!");

  window.location.href = "/";
});
