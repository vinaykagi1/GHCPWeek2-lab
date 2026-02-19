document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Participants toggle logic
        let participantsHTML = '<div class="participants-section">';
        participantsHTML += '<strong>Participants:</strong>';
        if (details.participants && details.participants.length > 0) {
          participantsHTML += `<ul class="participants-list" style="display: none;"></ul>`;
          participantsHTML += `<div class="participants-summary">${details.participants[0]}${details.participants.length > 1 ? ' <span class="more-count">(+ ' + (details.participants.length - 1) + ' more)</span>' : ''}</div>`;
          participantsHTML += `<button class="toggle-participants">Show All</button>`;
        } else {
          participantsHTML += '<span class="no-participants">No participants yet</span>';
        }
        participantsHTML += '</div>';

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          ${participantsHTML}
        `;

        // Add participants list dynamically
        if (details.participants && details.participants.length > 0) {
          const participantsSection = activityCard.querySelector('.participants-section');
          const participantsList = participantsSection.querySelector('.participants-list');
          details.participants.forEach(email => {
            const li = document.createElement('li');
            li.textContent = email;
            participantsList.appendChild(li);
          });

          const toggleBtn = participantsSection.querySelector('.toggle-participants');
          const summaryDiv = participantsSection.querySelector('.participants-summary');
          toggleBtn.addEventListener('click', () => {
            if (participantsList.style.display === 'none') {
              participantsList.style.display = 'block';
              summaryDiv.style.display = 'none';
              toggleBtn.textContent = 'Hide';
            } else {
              participantsList.style.display = 'none';
              summaryDiv.style.display = 'block';
              toggleBtn.textContent = 'Show All';
            }
          });
        }

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
