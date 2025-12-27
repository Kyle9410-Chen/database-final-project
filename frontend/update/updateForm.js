import { config } from "../config.js";

class UpdateForm {
  constructor() {
    this.forms = document.querySelectorAll("form");
    this.currentFormId = null;

    this.init();
  }

  init() {
    if (this.forms.length >= 2) {
      const firstForm = this.forms[0];
      const secondForm = this.forms[1];

      firstForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleFirstFormSubmit(firstForm);
      });

      secondForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleSecondFormSubmit(secondForm);
      });
    }
  }

  async handleFirstFormSubmit(form) {
    const formTitle = (form.querySelector("#formTitle").value || "").trim();

    if (!formTitle) {
      alert("Please enter a form title.");
      return;
    }

    try {
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Loading...";
      }

      // Search for forms with this title
      const formsResp = await fetch(`${config.apiBaseUrl}/api/forms`);
      if (!formsResp.ok) {
        throw new Error("Failed to fetch forms");
      }

      const forms = await formsResp.json();
      const matchedForm = forms.find(
        (f) => (f.title || "").trim().toLowerCase() === formTitle.toLowerCase()
      );

      if (!matchedForm) {
        alert(`No form found with title "${formTitle}".`);
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Submit";
        }
        return;
      }

      this.currentFormId = matchedForm.form_id || matchedForm.id;
      alert(`Form found! ID: ${this.currentFormId}`);

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Submit";
      }
    } catch (error) {
      console.error("Error loading form:", error);
      alert(`Error: ${error.message}`);

      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Submit";
      }
    }
  }

  async handleSecondFormSubmit(form) {
    if (!this.currentFormId) {
      alert("Please find the form first by entering its title.");
      return;
    }

    const newTitle = (form.querySelector("#formTitle").value || "").trim();

    if (!newTitle) {
      alert("Please enter a new title.");
      return;
    }

    // Note: Update functionality is not supported by the current API
    // The API specification does not include PUT /api/forms/{id} endpoint

    try {
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Checking...";
      }

      // Show message about unsupported functionality
      alert(
        `Update functionality is not currently supported.\n\n` +
          `The API does not include update endpoints for forms.\n` +
          `Current form ID: ${this.currentFormId}\n` +
          `Requested new title: "${newTitle}"`
      );

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
