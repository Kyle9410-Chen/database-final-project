import { config } from "../config.js";

class FormBuilder {
  constructor() {
    this.questionCount = 0;
    this.questionContainer = document.getElementById("questionContainer");
    this.addQuestionBtn = document.getElementById("addQuestionBtn");

    this.init();
  }

  init() {
    // Set up event listeners
    this.addQuestionBtn.addEventListener("click", () => this.addQuestion());

    // Set up existing question event listeners
    this.setupQuestionEventListeners(
      this.questionContainer.querySelector(".question")
    );

    // Handle form submission
    const form = document.querySelector("form");
    form.addEventListener("submit", (e) => this.handleSubmit(e));

    this.questionCount = 1; // Account for the existing question
  }

  addQuestion() {
    this.questionCount++;

    const questionDiv = document.createElement("div");
    questionDiv.className = "question";
    questionDiv.innerHTML = `
      <hr style="margin: 20px 0;">
      <h3>Question ${this.questionCount}</h3>
      <label>Question:</label><br />
      <input type="text" name="questionText" required /><br />
      
      <label>Required:</label>
      <input type="checkbox" name="isRequired" /><br />
      
      <label>Type:</label>
      <select name="questionType">
        <option value="short_answer">Short Answer</option>
        <option value="select">Select</option>
        <option value="multiple_select">Multiple Select</option>
      </select>
      
      <div class="options" style="display: none; margin-top: 10px;">
        <label>Options:</label><br />
        <div class="options-list">
          <div class="option-item">
            <input type="text" name="option" placeholder="Enter option text" required />
            <button type="button" class="remove-option" style="margin-left: 5px; padding: 2px 8px;">×</button>
          </div>
        </div>
        <button type="button" class="add-option" style="margin-top: 5px; padding: 5px 10px;">Add Option</button>
      </div>
      
      <button type="button" class="remove-question" style="margin-top: 10px;">Remove Question</button>
    `;

    // Insert before the "Add Question" button
    this.questionContainer.insertBefore(questionDiv, this.addQuestionBtn);

    // Set up event listeners for the new question
    this.setupQuestionEventListeners(questionDiv);
  }

  setupQuestionEventListeners(questionDiv) {
    const typeSelect = questionDiv.querySelector('[name="questionType"]');
    const optionsDiv = questionDiv.querySelector(".options");
    const removeBtn = questionDiv.querySelector(".remove-question");

    // Show/hide options based on question type
    typeSelect.addEventListener("change", () => {
      console.log("Question type changed to:", typeSelect.value);
      const needsOptions =
        typeSelect.value === "select" || typeSelect.value === "multiple_select";
      optionsDiv.style.display = needsOptions ? "block" : "none";
      console.log("Options div display set to:", optionsDiv.style.display);

      // Set required attribute on option inputs
      const optionInputs = optionsDiv.querySelectorAll('[name="option"]');
      optionInputs.forEach((input) => {
        input.required = needsOptions;
        if (!needsOptions) {
          input.value = "";
        }
      });
    });

    // Set up option management
    this.setupOptionListeners(optionsDiv);

    // Remove question functionality
    if (removeBtn) {
      removeBtn.addEventListener("click", () => {
        questionDiv.remove();
        this.renumberQuestions();
      });
    }
  }

  setupOptionListeners(optionsDiv) {
    const addOptionBtn = optionsDiv.querySelector(".add-option");
    const optionsList = optionsDiv.querySelector(".options-list");

    // Add option functionality
    addOptionBtn.addEventListener("click", () => {
      const optionItem = document.createElement("div");
      optionItem.className = "option-item";
      optionItem.innerHTML = `
        <input type="text" name="option" placeholder="Enter option text" required />
        <button type="button" class="remove-option" style="margin-left: 5px; padding: 2px 8px;">×</button>
      `;
      optionsList.appendChild(optionItem);

      // Set up remove listener for the new option
      const removeBtn = optionItem.querySelector(".remove-option");
      removeBtn.addEventListener("click", () => {
        // Only remove if there's more than one option
        const totalOptions =
          optionsList.querySelectorAll(".option-item").length;
        if (totalOptions > 1) {
          optionItem.remove();
        }
      });
    });

    // Set up remove listeners for existing options
    const existingRemoveBtns = optionsDiv.querySelectorAll(".remove-option");
    existingRemoveBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const optionItem = e.target.closest(".option-item");
        const totalOptions =
          optionsList.querySelectorAll(".option-item").length;
        if (totalOptions > 1) {
          optionItem.remove();
        }
      });
    });
  }

  renumberQuestions() {
    const questions = this.questionContainer.querySelectorAll(".question");
    questions.forEach((question, index) => {
      const heading = question.querySelector("h3");
      if (heading) {
        heading.textContent = `Question ${index + 1}`;
      }
    });
    this.questionCount = questions.length;
  }

  collectFormData() {
    const titleInput = document.getElementById("formTitle");
    const title = titleInput.value.trim();

    if (!title) {
      throw new Error("Form title is required");
    }

    const questions = Array.from(
      this.questionContainer.querySelectorAll(".question")
    ).map((questionDiv) => {
      const questionText = questionDiv
        .querySelector('[name="questionText"]')
        .value.trim();
      const isRequired = questionDiv.querySelector(
        '[name="isRequired"]'
      ).checked;
      const type = questionDiv.querySelector('[name="questionType"]').value;

      if (!questionText) {
        throw new Error("All questions must have text");
      }

      const question = {
        type: type,
        is_required: isRequired,
        question_text: questionText,
      };

      // Add options for select/multiple_select types
      if (type === "select" || type === "multiple_select") {
        const optionInputs = questionDiv.querySelectorAll('[name="option"]');
        const options = Array.from(optionInputs)
          .map((input) => input.value.trim())
          .filter((opt) => opt.length > 0);

        if (options.length === 0) {
          throw new Error(
            `At least one option is required for ${type} questions`
          );
        }

        question.options = options;

        if (question.options.length === 0) {
          throw new Error(
            `At least one option is required for ${type} questions`
          );
        }
      }

      return question;
    });

    if (questions.length === 0) {
      throw new Error("At least one question is required");
    }

    return {
      title: title,
      questions: questions,
    };
  }

  async handleSubmit(event) {
    event.preventDefault();

    try {
      const formData = this.collectFormData();

      // Show loading state
      const submitBtn = document.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Creating Form...";
      }

      console.log("Submitting form data:", formData);

      const response = await fetch(`${config.apiBaseUrl}/api/forms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to create form: ${response.status} ${errorText}`
        );
      }

      const createdForm = await response.json();

      // Show success message
      alert(
        `Form "${createdForm.title}" created successfully! Form ID: ${createdForm.form_id}`
      );

      // Optionally redirect or reset form
      window.location.href = "/"; // Redirect to home page
    } catch (error) {
      console.error("Error creating form:", error);
      alert(`Error creating form: ${error.message}`);
    } finally {
      // Reset button state
      const submitBtn = document.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Create Form";
      }
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new FormBuilder();
});
