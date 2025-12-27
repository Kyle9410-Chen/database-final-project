import { config } from "../config.js";

class UpdateForm {
  constructor() {
    this.form = document.querySelector("form");

    this.init();
  }

  init() {
    if (this.form) {
      this.form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleFormSubmit(this.form);
      });
    }
  }

  async handleFormSubmit(form) {
    const formId = (form.querySelector("#formId").value || "").trim();
    const newTitle = (form.querySelector("#formTitle").value || "").trim();

    if (!formId) {
      alert("Please enter a form ID.");
      return;
    }

    if (!newTitle) {
      alert("Please enter a new title.");
      return;
    }

    try {
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Updating...";
      }

      const response = await fetch(`${config.apiBaseUrl}/api/forms/${formId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newTitle,
        }),
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Form with ID "${formId}" not found.`);
        }
        const errorText = await response.text();
        throw new Error(
          `Failed to update form: ${response.status} ${errorText}`
        );
      }

      const updatedForm = await response.json();
      alert(`Form title updated successfully to "${updatedForm.title}"!`);
      form.querySelector("#formId").value = "";
      form.querySelector("#formTitle").value = "";

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Update Form";
      }
    } catch (error) {
      console.error("Error:", error);
      alert(`Error: ${error.message}`);

      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Update Form";
      }
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new UpdateForm();
});
