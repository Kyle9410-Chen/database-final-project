import { config } from "../config.js";

const API_BASE_URL = config.apiBaseUrl;

// Form data will be fetched from the API

// Global variables
let currentFormData = null;
let formId = null;

// DOM elements
const loadingDiv = document.getElementById("loadingDiv");
const errorDiv = document.getElementById("errorDiv");
const errorMessage = document.getElementById("errorMessage");
const formContainer = document.getElementById("formContainer");
const successDiv = document.getElementById("successDiv");
const formTitle = document.getElementById("formTitle");
const questionsContainer = document.getElementById("questionsContainer");
const filloutForm = document.getElementById("filloutForm");

// Get form ID from URL parameters or show error
function getFormId() {
  const urlParams = new URLSearchParams(window.location.search);
  const formId = urlParams.get("id");

  console.log("🔍 URL search params:", window.location.search);
  console.log("🆔 Extracted form ID:", formId);

  if (!formId) {
    console.error("❌ No form ID found in URL parameters");
    return null;
  }

  return formId;
}

// Load form data from API
async function loadFormData(id) {
  try {
    console.log("🔄 Loading form data for ID:", id);

    const response = await fetch(`${API_BASE_URL}/api/forms/${id}`);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(
          `Form not found. The form with ID "${id}" does not exist.`
        );
      } else if (response.status === 400) {
        throw new Error(
          `Invalid form ID format. Please check the form ID in the URL.`
        );
      } else {
        throw new Error(
          `Failed to load form: ${response.status} ${response.statusText}`
        );
      }
    }

    const formData = await response.json();

    console.log("✅ Form data loaded:", formData);
    return formData;
  } catch (error) {
    console.error("❌ Error loading form data:", error);
    throw error;
  }
}

// Render the form questions
function renderQuestions(questions) {
  console.log("🎨 Rendering questions:", questions);

  questionsContainer.innerHTML = "";

  questions.forEach((question, index) => {
    const questionDiv = document.createElement("div");
    questionDiv.className = "question";
    questionDiv.dataset.questionId = question.question_id;

    let questionHtml = `
      <h3>Question ${index + 1} ${
      question.is_required ? '<span class="required">*</span>' : ""
    }</h3>
      <p><strong>${question.question_text}</strong></p>
    `;

    // Render different input types based on question type
    switch (question.type) {
      case "short_answer":
        questionHtml += `
          <textarea 
            name="question_${question.question_id}" 
            placeholder="Enter your answer..." 
            rows="3"
            ${question.is_required ? "required" : ""}
          ></textarea>
        `;
        break;

      case "select":
        questionHtml += '<div class="option-group">';
        question.options.forEach((option) => {
          questionHtml += `
            <div class="option-item">
              <input 
                type="radio" 
                name="question_${question.question_id}" 
                value="${option.option_id}" 
                id="${option.option_id}"
                ${question.is_required ? "required" : ""}
              />
              <label for="${option.option_id}">${option.option_text}</label>
            </div>
          `;
        });
        questionHtml += "</div>";
        break;

      case "multiselect":
        questionHtml += '<div class="option-group">';
        question.options.forEach((option) => {
          questionHtml += `
            <div class="option-item">
              <input 
                type="checkbox" 
                name="question_${question.question_id}" 
                value="${option.option_id}" 
                id="${option.option_id}"
              />
              <label for="${option.option_id}">${option.option_text}</label>
            </div>
          `;
        });
        questionHtml += "</div>";
        break;
    }

    questionDiv.innerHTML = questionHtml;
    questionsContainer.appendChild(questionDiv);
  });

  console.log("✅ Questions rendered successfully");
}

// Collect form answers
function collectAnswers() {
  const answers = [];

  currentFormData.questions.forEach((question) => {
    const questionId = question.question_id;
    const answer = {
      question_id: questionId,
    };

    switch (question.type) {
      case "short_answer":
        const textArea = document.querySelector(
          `textarea[name="question_${questionId}"]`
        );
        if (textArea && textArea.value.trim()) {
          answer.answer_text = textArea.value.trim();
          answers.push(answer);
        } else if (question.is_required) {
          throw new Error(
            `Please answer the required question: "${question.question_text}"`
          );
        }
        break;

      case "select":
        const radioInput = document.querySelector(
          `input[name="question_${questionId}"]:checked`
        );
        if (radioInput) {
          answer.answer_options = [radioInput.value];
          answers.push(answer);
        } else if (question.is_required) {
          throw new Error(
            `Please select an option for: "${question.question_text}"`
          );
        }
        break;

      case "multiselect":
        const checkboxes = document.querySelectorAll(
          `input[name="question_${questionId}"]:checked`
        );
        if (checkboxes.length > 0) {
          answer.answer_options = Array.from(checkboxes).map((cb) => cb.value);
          answers.push(answer);
        } else if (question.is_required) {
          throw new Error(
            `Please select at least one option for: "${question.question_text}"`
          );
        }
        break;
    }
  });

  return answers;
}

// Submit form answers
async function submitFormAnswers(formId, answers) {
  try {
    console.log("📤 Submitting form answers for form ID:", formId);
    console.log("📋 Answers data:", answers);

    const payload = { answers };
    console.log("📦 Payload to submit:", JSON.stringify(payload, null, 2));

    const response = await fetch(
      `${API_BASE_URL}/api/forms/${formId}/answers`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log("✅ Form submitted successfully!");
    return true;
  } catch (error) {
    console.error("❌ Error submitting form:", error);
    throw error;
  }
}

// Show error message
function showError(message) {
  console.error("❌ Showing error:", message);
  loadingDiv.style.display = "none";
  formContainer.style.display = "none";
  successDiv.style.display = "none";
  errorMessage.textContent = message;
  errorDiv.style.display = "block";
}

// Show success message
function showSuccess() {
  console.log("🎉 Showing success message");
  loadingDiv.style.display = "none";
  formContainer.style.display = "none";
  errorDiv.style.display = "none";
  successDiv.style.display = "block";
}

// Initialize the form
async function initializeForm() {
  try {
    formId = getFormId();

    if (!formId) {
      throw new Error(
        "No form ID provided in URL. Please access this page with a valid form ID parameter (e.g., ?id=form-uuid)"
      );
    }

    console.log("🚀 Initializing fillout form for ID:", formId);

    // Load form data
    currentFormData = await loadFormData(formId);

    // Display form
    formTitle.textContent = currentFormData.title;
    renderQuestions(currentFormData.questions);

    // Hide loading and show form
    loadingDiv.style.display = "none";
    formContainer.style.display = "block";

    console.log("✅ Form initialization completed");
  } catch (error) {
    console.error("❌ Form initialization error:", error);
    showError(error.message || "Failed to load form. Please try again later.");
  }
}

// Handle form submission
filloutForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  console.log("📝 Form submission started");

  try {
    const answers = collectAnswers();
    console.log("📊 Collected answers:", answers);

    // Disable submit button during submission
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";

    await submitFormAnswers(formId, answers);

    showSuccess();
  } catch (error) {
    console.error("❌ Form submission error:", error);
    alert(error.message || "Failed to submit form. Please try again.");

    // Re-enable submit button
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
});

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  console.log("🌟 DOM loaded, initializing form fillout page");
  console.log("🌐 Current URL:", window.location.href);
  console.log("🔍 Current search params:", window.location.search);

  // Additional debugging for URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  console.log("📋 All URL parameters:");
  for (const [key, value] of urlParams.entries()) {
    console.log(`   ${key}: ${value}`);
  }

  initializeForm();
});

// Log API configuration
console.log("🔧 Using real API calls to:", API_BASE_URL + "/api/forms/{id}");
