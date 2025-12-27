// TODO: Replace with actual API base URL
const API_BASE_URL = "/api";

// TODO: Mock forms data for testing - replace with real API calls
const MOCK_FORMS_DATA = [
  {
    form_id: "12345678-1234-5678-9abc-123456789012",
    title: "Customer Satisfaction Survey",
    questions: [
      {
        question_id: "q1-1234-5678-9abc-123456789012",
        type: "select",
        is_required: true,
        question_text: "How satisfied are you with our service?",
        options: [
          {
            option_id: "o1-1234-5678-9abc-123456789012",
            option_text: "Very Satisfied",
          },
          {
            option_id: "o2-1234-5678-9abc-123456789012",
            option_text: "Satisfied",
          },
          {
            option_id: "o3-1234-5678-9abc-123456789012",
            option_text: "Neutral",
          },
          {
            option_id: "o4-1234-5678-9abc-123456789012",
            option_text: "Dissatisfied",
          },
          {
            option_id: "o5-1234-5678-9abc-123456789012",
            option_text: "Very Dissatisfied",
          },
        ],
      },
      {
        question_id: "q2-1234-5678-9abc-123456789012",
        type: "short_answer",
        is_required: false,
        question_text: "What can we improve?",
        options: [],
      },
    ],
  },
  {
    form_id: "23456789-2345-6789-abcd-234567890123",
    title: "Employee Feedback Form",
    questions: [
      {
        question_id: "q3-1234-5678-9abc-123456789012",
        type: "multiple_select",
        is_required: true,
        question_text: "Which benefits are important to you?",
        options: [
          {
            option_id: "o6-1234-5678-9abc-123456789012",
            option_text: "Health Insurance",
          },
          {
            option_id: "o7-1234-5678-9abc-123456789012",
            option_text: "Flexible Hours",
          },
          {
            option_id: "o8-1234-5678-9abc-123456789012",
            option_text: "Remote Work",
          },
          {
            option_id: "o9-1234-5678-9abc-123456789012",
            option_text: "Professional Development",
          },
          {
            option_id: "o10-1234-5678-9abc-123456789012",
            option_text: "Paid Time Off",
          },
        ],
      },
    ],
  },
  {
    form_id: "34567890-3456-7890-bcde-345678901234",
    title: "Product Registration Form",
    questions: [
      {
        question_id: "q4-1234-5678-9abc-123456789012",
        type: "short_answer",
        is_required: true,
        question_text: "Product Serial Number",
        options: [],
      },
      {
        question_id: "q5-1234-5678-9abc-123456789012",
        type: "select",
        is_required: true,
        question_text: "How did you hear about us?",
        options: [
          {
            option_id: "o11-1234-5678-9abc-123456789012",
            option_text: "Social Media",
          },
          {
            option_id: "o12-1234-5678-9abc-123456789012",
            option_text: "Friend/Family",
          },
          {
            option_id: "o13-1234-5678-9abc-123456789012",
            option_text: "Online Search",
          },
          {
            option_id: "o14-1234-5678-9abc-123456789012",
            option_text: "Advertisement",
          },
        ],
      },
    ],
  },
  {
    form_id: "45678901-4567-8901-cdef-456789012345",
    title: "Event Registration",
    questions: [
      {
        question_id: "q6-1234-5678-9abc-123456789012",
        type: "short_answer",
        is_required: true,
        question_text: "Full Name",
        options: [],
      },
      {
        question_id: "q7-1234-5678-9abc-123456789012",
        type: "short_answer",
        is_required: true,
        question_text: "Email Address",
        options: [],
      },
      {
        question_id: "q8-1234-5678-9abc-123456789012",
        type: "multiple_select",
        is_required: false,
        question_text: "Dietary Restrictions",
        options: [
          {
            option_id: "o15-1234-5678-9abc-123456789012",
            option_text: "Vegetarian",
          },
          {
            option_id: "o16-1234-5678-9abc-123456789012",
            option_text: "Vegan",
          },
          {
            option_id: "o17-1234-5678-9abc-123456789012",
            option_text: "Gluten-Free",
          },
          {
            option_id: "o18-1234-5678-9abc-123456789012",
            option_text: "No Restrictions",
          },
        ],
      },
    ],
  },
];

// DOM elements
const loadingDiv = document.getElementById("loadingDiv");
const errorDiv = document.getElementById("errorDiv");
const errorMessage = document.getElementById("errorMessage");
const formsContainer = document.getElementById("formsContainer");
const noFormsDiv = document.getElementById("noFormsDiv");
const refreshFormsBtn = document.getElementById("refreshFormsBtn");
const retryBtn = document.getElementById("retryBtn");

// Fetch all forms from API
async function fetchAllForms() {
  try {
    console.log("🔄 Fetching all forms from API...");

    // TODO: Replace with real API call
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1200));

    // In real implementation, this would be:
    // const response = await fetch(`${API_BASE_URL}/forms`);
    // if (!response.ok) {
    //   throw new Error(`HTTP error! status: ${response.status}`);
    // }
    // const formsData = await response.json();

    // TODO: Using mock data for demo purposes
    const formsData = MOCK_FORMS_DATA;

    console.log("✅ Forms data loaded:", formsData);
    return formsData;
  } catch (error) {
    console.error("❌ Error fetching forms:", error);
    throw error;
  }
}

// Render forms list
function renderFormsList(forms) {
  console.log("🎨 Rendering forms list:", forms);

  formsContainer.innerHTML = "";

  if (!forms || forms.length === 0) {
    showNoForms();
    return;
  }

  forms.forEach((form, index) => {
    const formItem = document.createElement("div");
    formItem.className = "form-item";
    formItem.dataset.formId = form.form_id;

    formItem.innerHTML = `
      <div class="form-title">${form.title}</div>
      <div class="form-id">ID: ${form.form_id}</div>
      <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">
        ${
          form.questions ? form.questions.length : 0
        } question(s) • Click to fill out
      </p>
    `;

    // Add click event listener to navigate to fillout page
    formItem.addEventListener("click", () => {
      console.log("📝 Navigating to fillout page for form:", form.form_id);
      navigateToFilloutPage(form.form_id);
    });

    // Add hover effects for better UX
    formItem.addEventListener("mouseenter", () => {
      formItem.style.transform = "translateY(-2px)";
      formItem.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)";
    });

    formItem.addEventListener("mouseleave", () => {
      formItem.style.transform = "translateY(0)";
      formItem.style.boxShadow = "none";
    });

    formsContainer.appendChild(formItem);
  });

  console.log("✅ Forms list rendered successfully");
}

// Navigate to fillout page with form ID
function navigateToFilloutPage(formId) {
  console.log("🔗 Navigating to fillout page with form ID:", formId);

  // TODO: Update path based on your server setup
  // For development, you might need to adjust this path
  const filloutUrl = `/fillout?id=${encodeURIComponent(formId)}`;

  console.log("🌐 Navigating to:", filloutUrl);
  window.location.href = filloutUrl;
}

// Show loading state
function showLoading() {
  console.log("⏳ Showing loading state");
  loadingDiv.style.display = "block";
  errorDiv.style.display = "none";
  formsContainer.style.display = "none";
  noFormsDiv.style.display = "none";
}

// Show error state
function showError(message) {
  console.error("❌ Showing error state:", message);
  loadingDiv.style.display = "none";
  errorDiv.style.display = "block";
  formsContainer.style.display = "none";
  noFormsDiv.style.display = "none";
  errorMessage.textContent = message;
}

// Show forms list
function showFormsList() {
  console.log("📋 Showing forms list");
  loadingDiv.style.display = "none";
  errorDiv.style.display = "none";
  formsContainer.style.display = "block";
  noFormsDiv.style.display = "none";
}

// Show no forms state
function showNoForms() {
  console.log("📭 Showing no forms state");
  loadingDiv.style.display = "none";
  errorDiv.style.display = "none";
  formsContainer.style.display = "none";
  noFormsDiv.style.display = "block";
}

// Load and display forms
async function loadForms() {
  try {
    showLoading();

    const forms = await fetchAllForms();

    if (forms && forms.length > 0) {
      renderFormsList(forms);
      showFormsList();
    } else {
      showNoForms();
    }
  } catch (error) {
    showError(
      "Failed to load forms. Please check your connection and try again."
    );
  }
}

// Initialize the page
function initializePage() {
  console.log("🚀 Initializing forms list page");

  // Load forms on page load
  loadForms();

  // Add event listeners for refresh and retry buttons
  refreshFormsBtn.addEventListener("click", (e) => {
    e.preventDefault();
    console.log("🔄 Refresh button clicked");
    loadForms();
  });

  retryBtn.addEventListener("click", (e) => {
    e.preventDefault();
    console.log("🔄 Retry button clicked");
    loadForms();
  });

  console.log("✅ Page initialization completed");
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  console.log("🌟 DOM loaded, initializing forms list page");
  initializePage();
});

// Log mock data for reference
console.log("📋 Mock forms data structure:", MOCK_FORMS_DATA);
console.log(
  "🔧 TODO: Replace mock data with real API calls to",
  API_BASE_URL + "/forms"
);
