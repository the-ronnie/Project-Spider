(function() {
  "use strict";

  const toggleForms = () => {
    const signinForm = document.getElementById('signin-form');
    const signupForm = document.getElementById('signup-form');
    const signinContainer = document.querySelector('.form-container:not(.hidden)');
    const signupContainer = document.querySelector('.form-container.hidden');

    if (!signinForm || !signupForm || !signinContainer || !signupContainer) {
      console.error("Error: One or more elements not found.");
      return;
    }

    console.log("Forms and containers found.");

    document.getElementById('signup-switch').addEventListener('click', function () {
      console.log("Signup switch clicked.");
      signinContainer.classList.add('hidden');
      signupContainer.classList.remove('hidden');
    });

    document.getElementById('signin-switch').addEventListener('click', function () {
      console.log("Signin switch clicked.");
      signupContainer.classList.add('hidden');
      signinContainer.classList.remove('hidden');
    });

    signinForm.addEventListener('submit', function (event) {
      event.preventDefault();
      console.log("Signin form submitted.");
      const formData = new FormData(signinForm);
      authenticateUser(formData);
    });

    signupForm.addEventListener('submit', function (event) {
      event.preventDefault();
      console.log("Signup form submitted.");
      const formData = new FormData(signupForm);
      registerUser(formData);
    });
  };

  const validatePassword = () => {
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return false;
    }
    return true;
  };

  const authenticateUser = (formData) => {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          if (response.success) {
            window.location.href = response.redirectTo;
          } else {
            alert(response.message);
          }
        } else {
          console.error('Error:', xhr.status);
        }
      }
    };
    xhr.open('POST', '/login', true); // Updated URL for Flask
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send(new URLSearchParams(formData));
  };

  const registerUser = (formData) => {
    if (!validatePassword()) {
      return;
    }
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          if (response.success) {
            displayWelcomeMessage(response.username, 'Welcome');
            setTimeout(() => {
              window.location.href = response.redirectTo;
            }, 3000);
          } else {
            alert(response.message);
          }
        } else {
          console.error('Error:', xhr.status);
        }
      }
    };
    xhr.open('POST', '/signup', true); // Updated URL for Flask
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send(new URLSearchParams(formData));
  };

  const displayWelcomeMessage = (username, message) => {
    const welcomeMessage = document.createElement('div');
    welcomeMessage.textContent = `${message}, ${username}!`;
    welcomeMessage.classList.add('welcome-message');

    const container = document.querySelector('.container');
    container.appendChild(welcomeMessage);
  };

  document.addEventListener('DOMContentLoaded', toggleForms);

})();
