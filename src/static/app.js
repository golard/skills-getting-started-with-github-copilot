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

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="activity-card-participants">
            <div class="activity-card-participants-title">Teilnehmer:</div>
            <ul class="activity-card-participants-list no-bullets" data-activity="${encodeURIComponent(name)}">
              ${
                details.participants.length > 0
                  ? details.participants.map(p =>
                      `<li style="display:flex;align-items:center;list-style:none;">
                        <span>${p}</span>
                        <span class="delete-participant" title="Entfernen" style="cursor:pointer;margin-left:8px;">🗑️</span>
                      </li>`
                    ).join("")
                  : '<li><em>Keine Teilnehmer</em></li>'
              }
            </ul>
          </div>
        `;

        // Event-Delegation für Löschen
        const ul = activityCard.querySelector(".activity-card-participants-list");
        ul.addEventListener("click", async function(e) {
          if (e.target.classList.contains("delete-participant")) {
            const li = e.target.closest("li");
            const participantName = li.querySelector("span").textContent;
            const activityName = decodeURIComponent(ul.getAttribute("data-activity"));
            // API-Request zum Entfernen
            try {
              const response = await fetch(`/activities/${encodeURIComponent(activityName)}/unregister?name=${encodeURIComponent(participantName)}`, {
                method: "POST"
              });
              if (response.ok) {
                li.remove();
              } else {
                alert("Fehler beim Entfernen des Teilnehmers.");
              }
            } catch (err) {
              alert("Fehler beim Entfernen des Teilnehmers.");
            }
          }
        });

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
        // Aktivitätenliste neu laden
        await fetchActivities();
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
