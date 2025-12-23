// Mock API base URL
const API_BASE_URL = "/api";

// Mock form data for testing
const MOCK_FORM_DATA = {
  form_id: "12345678-1234-5678-9abc-123456789012",
  title: "Sample Survey Form",
  questions: [
    {
      question_id: "q1-1234-5678-9abc-123456789012",
      type: "short_answer",
      is_required: true,
      question_text: "What is your name?",
      options: [],
    },
    {
      question_id: "q2-1234-5678-9abc-123456789012",
      type: "select",
      is_required: true,
      question_text: "What is your favorite color?",
      options: [
        {
          option_id: "o1-1234-5678-9abc-123456789012",
          option_text: "Red",
        },
        {
          option_id: "o2-1234-5678-9abc-123456789012",
          option_text: "Blue",
        },
        {
          option_id: "o3-1234-5678-9abc-123456789012",
          option_text: "Green",
        },
        {
          option_id: "o4-1234-5678-9abc-123456789012",
          option_text: "Yellow",
        },
      ],
    },
    {
      question_id: "q3-1234-5678-9abc-123456789012",
      type: "multiple_select",
      is_required: false,
      question_text:
        "Which programming languages do you know? (Select all that apply)",
      options: [
        {
          option_id: "o5-1234-5678-9abc-123456789012",
          option_text: "JavaScript",
        },
        {
          option_id: "o6-1234-5678-9abc-123456789012",
          option_text: "Python",
        },
        {
          option_id: "o7-1234-5678-9abc-123456789012",
          option_text: "Go",
        },
        {
          option_id: "o8-1234-5678-9abc-123456789012",
          option_text: "Java",
        },
        {
          option_id: "o9-1234-5678-9abc-123456789012",
          option_text: "C++",
        },
      ],
    },
    {
      question_id: "q4-1234-5678-9abc-123456789012",
      type: "short_answer",
      is_required: false,
      question_text: "Any additional comments?",
      options: [],
    },
  ],
};

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

// Get form ID from URL parameters or use default
function getFormId() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("id") || "default-form-id";
}

// Load form data (using mock data for now)
async function loadFormData(id) {
  try {
    console.log("🔄 Loading form data for ID:", id);

    // TODO: Replace with real API call
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // For demo purposes, use mock data
    // In real implementation, this would be:
    // const response = await fetch(`${API_BASE_URL}/forms/${id}`);
    // const formData = await response.json();

    const formData = MOCK_FORM_DATA;
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

      case "multiple_select":
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

      case "multiple_select":
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

    // TODO: Replace with real API call
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // For demo purposes, just log the submission
    // In real implementation, this would be:
    // const response = await fetch(`${API_BASE_URL}/forms/${formId}/answers`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(payload)
    // });

    console.log("✅ Form submitted successfully!");
    console.log("🎉 Mock submission completed for demo purposes");
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
    showError("Failed to load form. Please try again later.");
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
  initializeForm();
});

// Log mock data for reference
console.log("📋 Mock form data structure:", MOCK_FORM_DATA);
console.log("🔧 Mock form can be accessed at: ?id=" + MOCK_FORM_DATA.form_id);
