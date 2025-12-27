import { config } from "../config.js";

class DeleteForm {
  constructor() {
    this.form = document.querySelector("form");
    this.formTitleInput = document.getElementById("formTitle");

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
    const title = (this.formTitleInput.value || "").trim();

    if (!title) {
      alert("Please enter a form title.");
      return;
    }

    // Confirm deletion
    const confirmDelete = confirm(
      `Are you sure you want to delete the form titled "${title}"? This action cannot be undone.`
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

      // First, search for forms with this title to get the form ID
      const formsResp = await fetch(`${config.apiBaseUrl}/api/forms`);
      if (!formsResp.ok) {
        throw new Error("Failed to fetch forms");
      }

      const forms = await formsResp.json();
      const formToDelete = forms.find(
        (f) => (f.title || "").trim().toLowerCase() === title.toLowerCase()
      );

      if (!formToDelete) {
        alert(`No form found with title "${title}".`);
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Delete Form";
        }
        return;
      }

      const formId = formToDelete.form_id || formToDelete.id;

      // Note: Delete functionality is not supported by the current API
      // The API specification does not include DELETE /api/forms/{id} endpoint

      alert(
        `Delete functionality is not currently supported.\n\n` +
          `The API does not include delete endpoints for forms.\n` +
          `Found form: "${formToDelete.title}" (ID: ${formId})\n\n` +
          `To delete this form, you would need to contact the system administrator.`
      );

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
