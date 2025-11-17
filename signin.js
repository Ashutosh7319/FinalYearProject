document.getElementById("login-btn").addEventListener("click", () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    alert("Please enter both email and password.");
    return;
  }

  // Save login state in localStorage
  localStorage.setItem("loggedInUser", email);

  alert("Sign-in Successful!");
  window.location.href = "index.html";  // redirect back to main page
});
