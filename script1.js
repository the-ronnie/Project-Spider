(function() {
    "use strict";
  
    // Function to toggle between sign-in and sign-up forms
    const toggleForms = () => {
      const signinForm = document.getElementById('signin-form');
      const signupForm = document.getElementById('signup-form');
      const signinContainer = document.querySelector('.form-container:not(.hidden)');
      const signupContainer = document.querySelector('.form-container.hidden');
  
      // Show the sign-up form and hide the sign-in form when the "Sign Up" button is clicked
      document.getElementById('signup-switch').addEventListener('click', function () {
        signinContainer.classList.add('hidden');
        signupContainer.classList.remove('hidden');
      });
  
      // Show the sign-in form and hide the sign-up form when the "Sign In" button is clicked
      document.getElementById('signin-switch').addEventListener('click', function () {
        signupContainer.classList.add('hidden');
        signinContainer.classList.remove('hidden');
      });
  
      // Submit event listener for sign-in form
      signinForm.addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent the default form submission behavior
        // Here you can add your sign-in logic, for example, validating credentials
        // After signing in successfully, redirect to a new page
        window.location.href = 'index.html';
      });
  
      // Submit event listener for sign-up form
      signupForm.addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent the default form submission behavior
        // Here you can add your sign-up logic, for example, registering new user
        // After signing up successfully, redirect to a new page
        window.location.href = 'index.html';
      });
    };
  
    // Wait for the DOM content to be fully loaded before executing the code
    document.addEventListener('DOMContentLoaded', toggleForms);
  
  })();
  