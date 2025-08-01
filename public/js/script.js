// DOM Elements
const tabButtons = document.querySelectorAll(".tab-button");
const formContainers = document.querySelectorAll(".form-container");
const passwordToggles = document.querySelectorAll(".password-toggle");

// Tab Switching
tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const targetTab = button.getAttribute("data-tab");

    tabButtons.forEach((btn) => btn.classList.remove("active"));
    formContainers.forEach((container) => container.classList.remove("active"));

    button.classList.add("active");
    document.getElementById(`${targetTab}-form`).classList.add("active");
  });
});

// Password Toggle
passwordToggles.forEach((toggle) => {
  toggle.addEventListener("click", () => {
    const targetId = toggle.getAttribute("data-target");
    const passwordInput = document.getElementById(targetId);
    const eyeIcon = toggle.querySelector(".eye-icon");

    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      eyeIcon.innerHTML = `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>`;
    } else {
      passwordInput.type = "password";
      eyeIcon.innerHTML = `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`;
    }
  });
});

// SIGNUP
document.getElementById("signup-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("signup-name").value;
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;

  try {
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();
    if (res.ok) {
      showMessage("Registration successful. Please sign in.", "success");
      document.querySelector('[data-tab="signin"]').click();
    } else {
      showMessage(data.message || "Signup failed", "error");
    }
  } catch (err) {
    console.error(err);
    showMessage("Error occurred during signup.", "error");
  }
});

// LOGIN
document.querySelector('#loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

const email = document.querySelector('#signin-email').value;
const password = document.querySelector('#signin-password').value;

  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      showMessage(data.message || 'Login successful!', 'success');
      setTimeout(() => window.location.href = '/dashboard.html', 1000);
    } else {
      showMessage(data.message || 'Invalid credentials.', 'error');
    }
  } catch (err) {
    console.error(err);
    showMessage('Something went wrong.', 'error');
  }
});


// Show Message
function showMessage(message, type) {
  const existing = document.querySelector(".message");
  if (existing) existing.remove();

  const msg = document.createElement("div");
  msg.className = `message message-${type}`;
  msg.textContent = message;
  msg.style.cssText = `
    position: fixed; top: 2rem; left: 50%; transform: translateX(-50%);
    padding: 1rem 1.5rem; border-radius: 0.75rem; font-size: 0.875rem;
    font-weight: 500; z-index: 1000; max-width: 90%; text-align: center;
    background-color: ${type === "success" ? "#43A047" : "#F44336"};
    color: #fff; animation: slideDown 0.3s ease-out;
  `;
  document.body.appendChild(msg);

  setTimeout(() => {
    msg.style.animation = "slideUp 0.3s ease-in forwards";
    setTimeout(() => msg.remove(), 300);
  }, 4000);
}

// Slide Animation
const style = document.createElement("style");
style.textContent = `
@keyframes slideDown { from {opacity: 0; transform: translateX(-50%) translateY(-20px);} to {opacity: 1; transform: translateX(-50%) translateY(0);} }
@keyframes slideUp { from {opacity: 1; transform: translateX(-50%) translateY(0);} to {opacity: 0; transform: translateX(-50%) translateY(-20px);} }
`;
document.head.appendChild(style);

// Focus Styling
document.querySelectorAll("input").forEach((input) => {
  input.addEventListener("focus", () => input.parentElement.classList.add("focused"));
  input.addEventListener("blur", () => input.parentElement.classList.remove("focused"));
  input.addEventListener("input", () => {
    input.classList.toggle("filled", input.value.trim() !== "");
  });
});

// Extra styles for filled input
const filledStyle = document.createElement("style");
filledStyle.textContent = `
.input-wrapper input.filled { background-color: rgba(25, 118, 210, 0.02); border-color: rgba(25, 118, 210, 0.2); }
.input-wrapper.focused .input-icon { color: #1976D2; }
`;
document.head.appendChild(filledStyle);
