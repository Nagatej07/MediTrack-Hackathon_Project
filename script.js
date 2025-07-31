// DOM Elements
const tabButtons = document.querySelectorAll(".tab-button");
const formContainers = document.querySelectorAll(".form-container");
const passwordToggles = document.querySelectorAll(".password-toggle");
const forms = document.querySelectorAll(".auth-form");

// Tab Switching Functionality
tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const targetTab = button.getAttribute("data-tab");

    // Remove active class from all tabs and forms
    tabButtons.forEach((btn) => btn.classList.remove("active"));
    formContainers.forEach((container) => container.classList.remove("active"));

    // Add active class to clicked tab and corresponding form
    button.classList.add("active");
    document.getElementById(`${targetTab}-form`).classList.add("active");
  });
});

// Password Toggle Functionality
passwordToggles.forEach((toggle) => {
  toggle.addEventListener("click", () => {
    const targetId = toggle.getAttribute("data-target");
    const passwordInput = document.getElementById(targetId);
    const eyeIcon = toggle.querySelector(".eye-icon");

    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      eyeIcon.innerHTML = `
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
            `;
    } else {
      passwordInput.type = "password";
      eyeIcon.innerHTML = `
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
            `;
    }
  });
});

// Form Validation and Submission
forms.forEach((form) => {
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const formId = form.id;
    const submitButton = form.querySelector('.btn[type="submit"]');

    // Add loading state
    submitButton.classList.add("loading");
    submitButton.disabled = true;

    // Simulate form submission
    setTimeout(() => {
      if (formId === "signin") {
        handleSignIn(form);
      } else if (formId === "signup") {
        handleSignUp(form);
      }

      // Remove loading state
      submitButton.classList.remove("loading");
      submitButton.disabled = false;
    }, 2000);
  });
});

// Sign In Handler
// LocalStorage signup
function handleSignUp(form) {
  const fullName = form.querySelector("#signup-name").value.trim();
  const email = form.querySelector("#signup-email").value.trim();
  const password = form.querySelector("#signup-password").value;
  const confirmPassword = form.querySelector("#signup-confirm-password").value;
  const termsAgreed = form.querySelector("#terms-agreement").checked;

  if (password !== confirmPassword) {
    showMessage("Passwords do not match.", "error");
    return;
  }
  if (password.length < 8) {
    showMessage("Password must be at least 8 characters.", "error");
    return;
  }
  if (!termsAgreed) {
    showMessage("Please agree to the Terms of Service.", "error");
    return;
  }

  // Check if user exists
  if (localStorage.getItem("user-" + email)) {
    showMessage("User already exists, please sign in.", "error");
    return;
  }

  const user = { fullName, email, password };
  localStorage.setItem("user-" + email, JSON.stringify(user));
  showMessage("Account created successfully!", "success");

  // Optionally clear form here
  setTimeout(() => {
    window.location.href = "dashboard.html"; // change to your target page
  }, 1500);
  form.reset();
}

// LocalStorage signin
function handleSignIn(form) {
  const email = form.querySelector("#signin-email").value.trim();
  const password = form.querySelector("#signin-password").value;

  const userData = localStorage.getItem("user-" + email);
  if (!userData) {
    showMessage("User not found. Please sign up.", "error");
    return;
  }

  const user = JSON.parse(userData);
  if (user.password !== password) {
    showMessage("Incorrect password.", "error");
    return;
  }

  showMessage("Sign in successful! Redirecting...", "success");
  setTimeout(() => {
    window.location.href = "dashboard.html"; // change to your target page
  }, 1500);
  // You can now redirect or set logged-in state
}

// Message Display Function
function showMessage(message, type) {
  // Remove existing messages
  const existingMessage = document.querySelector(".message");
  if (existingMessage) {
    existingMessage.remove();
  }

  // Create message element
  const messageElement = document.createElement("div");
  messageElement.className = `message message-${type}`;
  messageElement.textContent = message;

  // Add styles
  messageElement.style.cssText = `
        position: fixed;
        top: 2rem;
        left: 50%;
        transform: translateX(-50%);
        padding: 1rem 1.5rem;
        border-radius: 0.75rem;
        font-size: 0.875rem;
        font-weight: 500;
        z-index: 1000;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
        animation: slideDown 0.3s ease-out;
        max-width: 90%;
        text-align: center;
    `;

  if (type === "success") {
    messageElement.style.backgroundColor = "#43A047";
    messageElement.style.color = "#FFFFFF";
  } else if (type === "error") {
    messageElement.style.backgroundColor = "#F44336";
    messageElement.style.color = "#FFFFFF";
  }

  // Add to DOM
  document.body.appendChild(messageElement);

  // Remove after 4 seconds
  setTimeout(() => {
    messageElement.style.animation = "slideUp 0.3s ease-in forwards";
    setTimeout(() => {
      if (messageElement.parentNode) {
        messageElement.remove();
      }
    }, 300);
  }, 4000);
}

// Add CSS animations for messages
const style = document.createElement("style");
style.textContent = `
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
    }
    
    @keyframes slideUp {
        from {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
        to {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
        }
    }
`;
document.head.appendChild(style);

// Input Focus Enhancement
const inputs = document.querySelectorAll("input");
inputs.forEach((input) => {
  input.addEventListener("focus", () => {
    input.parentElement.classList.add("focused");
  });

  input.addEventListener("blur", () => {
    input.parentElement.classList.remove("focused");
  });
});

// Forgot Password Handler
const forgotPasswordButton = document.querySelector(".forgot-password");
if (forgotPasswordButton) {
  forgotPasswordButton.addEventListener("click", () => {
    showMessage("Password reset link sent to your email address.", "success");
  });
}

// Terms and Privacy Policy Handlers
const linkButtons = document.querySelectorAll(".link-button");
linkButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const text = button.textContent.trim();
    showMessage(`${text} will open in a new window.`, "success");
  });
});

// Keyboard Navigation Enhancement
document.addEventListener("keydown", (e) => {
  // Tab navigation with arrow keys
  if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
    const activeTab = document.querySelector(".tab-button.active");
    const tabs = Array.from(tabButtons);
    const currentIndex = tabs.indexOf(activeTab);

    let newIndex;
    if (e.key === "ArrowLeft") {
      newIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
    } else {
      newIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
    }

    tabs[newIndex].click();
    tabs[newIndex].focus();
    e.preventDefault();
  }
});

// Form Auto-completion Enhancement
inputs.forEach((input) => {
  input.addEventListener("input", () => {
    // Add visual feedback for filled inputs
    if (input.value.trim() !== "") {
      input.classList.add("filled");
    } else {
      input.classList.remove("filled");
    }
  });
});

// Add CSS for filled inputs
const filledInputStyle = document.createElement("style");
filledInputStyle.textContent = `
    .input-wrapper input.filled {
        background-color: rgba(25, 118, 210, 0.02);
        border-color: rgba(25, 118, 210, 0.2);
    }
    
    .input-wrapper.focused .input-icon {
        color: #1976D2;
    }
`;
document.head.appendChild(filledInputStyle);

console.log("MediTrack+ Authentication System Initialized");
console.log(
  "Features: Tab switching, password toggle, form validation, accessibility enhancements"
);

document.getElementById("download-users").addEventListener("click", () => {
  const users = [];

  // Collect all users from localStorage
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith("user-")) {
      users.push(JSON.parse(localStorage.getItem(key)));
    }
  }

  if (users.length === 0) {
    showMessage("No users found to export.", "error");
    return;
  }

  const dataStr = JSON.stringify(users, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "user.json";
  document.body.appendChild(a);
  a.click();

  a.remove();
  URL.revokeObjectURL(url);
});
