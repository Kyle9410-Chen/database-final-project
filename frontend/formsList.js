import { config } from "./config.js";

const API_BASE_URL = config.apiBaseUrl;

// Forms data will be fetched from the API

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

    const response = await fetch(`${API_BASE_URL}/api/forms`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const formsData = await response.json();

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

  // Use relative path that works with Live Server
  const filloutUrl = `./fillout/index.html?id=${encodeURIComponent(formId)}`;

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

// Log API configuration
console.log("🔧 Using real API calls to:", API_BASE_URL + "/api/forms");
