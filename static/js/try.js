window.onload = async function() {
  const userListContainer = document.getElementById('user-list');
  try {
      const response = await fetch('/admin'); // Sending a request to the backend endpoint
      if (!response.ok) {
          throw new Error('Failed to load user data');
      }
      const users = await response.json(); // Assuming the response is in JSON format

      // Clear previous content before appending new data
      userListContainer.innerHTML = '';

      // Loop through the users array and create HTML elements to display user data
      users.forEach(user => {
          const userElement = document.createElement('div');
          userElement.textContent = `Username: ${user.username}, Email: ${user.email}`;
          userListContainer.appendChild(userElement);
      });
  } catch (error) {
      console.error(error);
  }
};
