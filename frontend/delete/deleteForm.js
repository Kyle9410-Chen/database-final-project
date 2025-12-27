import { config } from "../config.js";

class DeleteForm {
  constructor() {
    this.form = document.querySelector("form");
    this.formIdInput = document.getElementById("formTitle"); // Reusing existing input for form ID

    this.init();
  }

  init() {
    if (this.form) {
      this.form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleFormSubmit();
      });
    }
  }

  async handleFormSubmit() {
    const formId = (this.formIdInput.value || "").trim();

    if (!formId) {
      alert("Please enter a form ID.");
      return;
    }

    // Confirm deletion
    const confirmDelete = confirm(
      `Are you sure you want to delete the form with ID "${formId}"? This action cannot be undone.`
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const submitBtn = this.form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Deleting...";
      }

      // Delete the form using the API with the provided ID
      const deleteResp = await fetch(
        `${config.apiBaseUrl}/api/forms/${formId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!deleteResp.ok) {
        if (deleteResp.status === 404) {
          throw new Error(`Form with ID "${formId}" not found.`);
        }
        const errorText = await deleteResp.text();
        throw new Error(
          `Failed to delete form: ${deleteResp.status} ${errorText}`
        );
      }

      alert(`Form with ID "${formId}" has been successfully deleted.`);
      this.formIdInput.value = "";

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Delete Form";
      }
    } catch (error) {
      console.error("Error deleting form:", error);
      alert(`Error: ${error.message}`);

      const submitBtn = this.form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Delete Form";
      }
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new DeleteForm();
});
