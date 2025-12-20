import { config } from "../config.js";

class UpdateForm {
  constructor() {
    this.form = document.querySelector("form");
    this.titleInput = document.getElementById("formTitle");
    this.submitBtn = this.form?.querySelector('button[type="submit"]');
    this.formId = this.getFormIdFromUrl();
    this.init();
  }

  getFormIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return (
      params.get("form_id") || params.get("formId") || params.get("id") || null
    );
  }

  async init() {
    if (!this.form) return;

    if (!this.formId) {
      alert("Missing form id in URL (e.g., ?form_id=123)");
      if (this.submitBtn) this.submitBtn.disabled = true;
      return;
    }

    this.form.addEventListener("submit", (e) => this.handleSubmit(e));
    await this.loadForm();
  }

  async loadForm() {
    try {
      this.setSubmitting(true, "Loading...");
      const response = await fetch(`${config.apiBaseUrl}/api/forms/${this.formId}`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to load form: ${response.status} ${errorText}`);
      }
      const formData = await response.json();
      if (this.titleInput && formData.title) {
        this.titleInput.value = formData.title;
      }
    } catch (error) {
      console.error("Error loading form:", error);
      alert(`Error loading form: ${error.message}`);
    } finally {
      this.setSubmitting(false);
    }
  }

  setSubmitting(isSubmitting, text) {
    if (!this.submitBtn) return;
    this.submitBtn.disabled = isSubmitting;
    if (text) {
      this.submitBtn.textContent = text;
    } else {
      this.submitBtn.textContent = "Update";
    }
  }

  async handleSubmit(event) {
    event.preventDefault();
    if (!this.formId) return;

    const title = this.titleInput?.value.trim() || "";
    if (!title) {
      alert("Form title is required");
      return;
    }

    try {
      this.setSubmitting(true, "Updating...");
      const response = await fetch(`${config.apiBaseUrl}/api/forms/${this.formId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update form: ${response.status} ${errorText}`);
      }

      const updatedForm = await response.json();
      alert(`Form "${updatedForm.title}" updated successfully!`);
      window.location.href = "/";
    } catch (error) {
      console.error("Error updating form:", error);
      alert(`Error updating form: ${error.message}`);
    } finally {
      this.setSubmitting(false);
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new UpdateForm();
});
