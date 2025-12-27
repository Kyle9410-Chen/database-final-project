import { config } from "../config.js";

class ViewFormReplies {
  constructor() {
    this.formIdInput = document.getElementById("formIdForReply");
    this.loadRepliesBtn = document.getElementById("loadRepliesBtn");
    this.loadAllRepliesBtn = document.getElementById("loadAllRepliesBtn");
    this.replyChooser = document.getElementById("replyChooser");
    this.replySelect = document.getElementById("replySelect");
    this.proceedReplyUpdateBtn = document.getElementById("proceedReplyUpdate");

    this.formMetadata = null;
    this.replies = [];

    this.replyCardsContainer = this.ensureReplyCardsContainer();
    this.statusDiv = this.ensureStatusDiv();

    this.init();
  }

  init() {
    if (this.loadRepliesBtn && this.formIdInput) {
      this.loadRepliesBtn.addEventListener("click", async () => {
        const formId = (this.formIdInput.value || "").trim();
        if (!formId) {
          alert("Please enter a Form ID.");
          return;
        }
        await this.loadReplies(formId);
      });
    }

    if (this.loadAllRepliesBtn) {
      this.loadAllRepliesBtn.addEventListener("click", async () => {
        await this.loadAllReplies();
      });
    }

    if (this.replySelect && this.proceedReplyUpdateBtn) {
      this.replySelect.addEventListener("change", () => {
        const selected = this.replySelect.value;
        this.proceedReplyUpdateBtn.disabled = !selected;
      });

      this.proceedReplyUpdateBtn.addEventListener("click", () => {
        const selected = this.replySelect?.value;
        if (!selected) return;
        this.scrollToReplyCard(selected);
      });
    }
  }

  ensureReplyCardsContainer() {
    const existing = document.getElementById("replyCardsContainer");
    if (existing) return existing;

    const section = document.querySelector("section") || document.body;
    const container = document.createElement("div");
    container.id = "replyCardsContainer";
    container.style.marginTop = "20px";
    section.appendChild(container);
    return container;
  }

  ensureStatusDiv() {
    const status = document.createElement("div");
    status.id = "replyStatus";
    status.style.marginTop = "12px";
    status.style.color = "#444";
    this.replyCardsContainer.parentElement.insertBefore(
      status,
      this.replyCardsContainer
    );
    return status;
  }

  async loadAllReplies() {
    try {
      if (this.loadAllRepliesBtn) {
        this.loadAllRepliesBtn.disabled = true;
        this.loadAllRepliesBtn.textContent = "Loading...";
      }

      this.setStatus("Fetching all forms...");

      // First, fetch all forms
      const formsResp = await fetch(`${config.apiBaseUrl}/api/forms`);
      if (!formsResp.ok) {
        const errorText = await formsResp.text();
        throw new Error(
          `Failed to load forms: ${formsResp.status} ${errorText}`
        );
      }
      const forms = await formsResp.json();

      if (!forms || forms.length === 0) {
        this.setStatus("No forms found.");
        this.replyCardsContainer.innerHTML = "<p>No forms exist yet.</p>";
        if (this.replyChooser) this.replyChooser.style.display = "none";
        return;
      }

      this.setStatus(`Loading replies from ${forms.length} form(s)...`);

      // Fetch replies for each form
      const allRepliesData = [];
      for (const form of forms) {
        const formId = form.form_id || form.id;
        try {
          const repliesResp = await fetch(
            `${config.apiBaseUrl}/api/forms/${formId}/answers`
          );
          if (repliesResp.ok) {
            const replies = await repliesResp.json();
            if (replies && replies.length > 0) {
              allRepliesData.push({
                formId: formId,
                formTitle: form.title || `Form ${formId}`,
                formMetadata: form,
                replies: replies,
              });
            }
          }
        } catch (error) {
          console.error(`Error loading replies for form ${formId}:`, error);
        }
      }

      if (allRepliesData.length === 0) {
        this.setStatus("No replies found across all forms.");
        this.replyCardsContainer.innerHTML =
          "<p>No replies have been submitted yet.</p>";
        if (this.replyChooser) this.replyChooser.style.display = "none";
        return;
      }

      const totalReplies = allRepliesData.reduce(
        (sum, data) => sum + data.replies.length,
        0
      );
      this.setStatus(
        `Loaded ${totalReplies} repl${totalReplies === 1 ? "y" : "ies"} from ${
          allRepliesData.length
        } form(s).`
      );

      this.renderAllRepliesCards(allRepliesData);
      if (this.replyChooser) this.replyChooser.style.display = "none";
    } catch (error) {
      console.error("Error loading all replies:", error);
      alert(`Error loading all replies: ${error.message}`);
      this.setStatus("Failed to load replies.");
      this.replyCardsContainer.innerHTML = "";
    } finally {
      if (this.loadAllRepliesBtn) {
        this.loadAllRepliesBtn.disabled = false;
        this.loadAllRepliesBtn.textContent = "View All Replies from All Forms";
      }
    }
  }

  renderAllRepliesCards(allRepliesData) {
    this.replyCardsContainer.innerHTML = "";

    const title = document.createElement("h2");
    title.textContent = "All Replies from All Forms";
    this.replyCardsContainer.appendChild(title);

    allRepliesData.forEach((formData) => {
      const formSection = document.createElement("div");
      formSection.style.marginBottom = "30px";
      formSection.style.padding = "15px";
      formSection.style.border = "2px solid #4caf50";
      formSection.style.borderRadius = "8px";
      formSection.style.background = "#f0f9f0";

      const formHeader = document.createElement("h3");
      formHeader.textContent = `${formData.formTitle} (Form ID: ${formData.formId})`;
      formHeader.style.marginTop = "0";
      formHeader.style.color = "#2e7d32";
      formSection.appendChild(formHeader);

      const repliesCount = document.createElement("p");
      repliesCount.textContent = `${formData.replies.length} repl${
        formData.replies.length === 1 ? "y" : "ies"
      }`;
      repliesCount.style.fontWeight = "bold";
      repliesCount.style.marginBottom = "10px";
      formSection.appendChild(repliesCount);

      const questionMap = this.buildQuestionLookup(formData.formMetadata);

      formData.replies.forEach((reply, idx) => {
        const card = document.createElement("div");
        card.className = "reply-card";
        card.dataset.replyId = this.getReplyId(reply, idx);
        card.style.border = "1px solid #ddd";
        card.style.borderRadius = "6px";
        card.style.padding = "12px";
        card.style.marginBottom = "12px";
        card.style.background = "#ffffff";

        const header = document.createElement("div");
        header.style.fontWeight = "bold";
        header.textContent = `Reply ${card.dataset.replyId}`;
        const meta = document.createElement("div");
        meta.style.fontSize = "13px";
        meta.style.color = "#666";
        meta.textContent = reply.created_at || reply.createdAt || "";

        card.appendChild(header);
        if (meta.textContent) card.appendChild(meta);

        const answersList = document.createElement("div");
        answersList.style.marginTop = "8px";

        const answers = reply.answers || reply.responses || [];
        if (!answers.length) {
          const noAns = document.createElement("p");
          noAns.textContent = "No answers recorded for this reply.";
          answersList.appendChild(noAns);
        } else {
          answers.forEach((ans) => {
            const row = document.createElement("div");
            row.style.marginBottom = "6px";

            const questionId = ans.question_id || ans.questionId;
            const questionLabel = this.describeQuestion(
              questionId,
              questionMap
            );
            const answerValue = this.describeAnswer(
              ans,
              questionMap.get(questionId)
            );

            const q = document.createElement("div");
            q.style.fontWeight = "bold";
            q.textContent = questionLabel;

            const a = document.createElement("div");
            a.textContent = answerValue;

            row.appendChild(q);
            row.appendChild(a);
            answersList.appendChild(row);
          });
        }

        card.appendChild(answersList);
        formSection.appendChild(card);
      });

      this.replyCardsContainer.appendChild(formSection);
    });
  }

  async loadReplies(formId) {
    try {
      if (this.loadRepliesBtn) {
        this.loadRepliesBtn.disabled = true;
        this.loadRepliesBtn.textContent = "Loading...";
      }

      this.setStatus("Fetching form and replies...");

      const formResp = await fetch(`${config.apiBaseUrl}/api/forms/${formId}`);
      if (!formResp.ok) {
        const errorText = await formResp.text();
        throw new Error(`Form not found: ${formResp.status} ${errorText}`);
      }
      this.formMetadata = await formResp.json();

      const repliesResp = await fetch(
        `${config.apiBaseUrl}/api/forms/${formId}/answers`
      );
      if (!repliesResp.ok) {
        const errorText = await repliesResp.text();
        throw new Error(
          `Failed to load replies: ${repliesResp.status} ${errorText}`
        );
      }

      this.replies = (await repliesResp.json()) || [];

      this.populateRepliesDropdown(this.replies);
      this.renderReplyCards(this.replies);
      this.setStatus(
        this.replies.length === 0
          ? "No replies found for this form yet."
          : `Loaded ${this.replies.length} repl${
              this.replies.length === 1 ? "y" : "ies"
            }.`
      );

      if (this.replyChooser) this.replyChooser.style.display = "block";
    } catch (error) {
      console.error("Error loading replies:", error);
      alert(`Error loading replies: ${error.message}`);
      this.setStatus("Failed to load replies.");
      if (this.replyChooser) this.replyChooser.style.display = "none";
      this.replyCardsContainer.innerHTML = "";
    } finally {
      if (this.loadRepliesBtn) {
        this.loadRepliesBtn.disabled = false;
        this.loadRepliesBtn.textContent = "Load Replies";
      }
    }
  }

  populateRepliesDropdown(replies) {
    if (!this.replySelect) return;
    this.replySelect.innerHTML = "";
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "-- Select a reply --";
    this.replySelect.appendChild(placeholder);

    replies.forEach((reply, idx) => {
      const opt = document.createElement("option");
      const id = this.getReplyId(reply, idx);
      const labelParts = [
        `Reply ${id}`,
        reply.created_at || reply.createdAt
          ? `(${reply.created_at || reply.createdAt})`
          : "",
      ].filter(Boolean);
      opt.value = id;
      opt.textContent = labelParts.join(" ");
      this.replySelect.appendChild(opt);
    });

    this.replySelect.disabled = replies.length === 0;
    if (this.proceedReplyUpdateBtn) this.proceedReplyUpdateBtn.disabled = true;
  }

  renderReplyCards(replies) {
    this.replyCardsContainer.innerHTML = "";

    const title = document.createElement("h2");
    title.textContent = "Replies";
    this.replyCardsContainer.appendChild(title);

    if (!replies || replies.length === 0) {
      const empty = document.createElement("p");
      empty.textContent = "No replies yet for this form.";
      this.replyCardsContainer.appendChild(empty);
      return;
    }

    const questionMap = this.buildQuestionLookup(this.formMetadata);

    replies.forEach((reply, idx) => {
      const card = document.createElement("div");
      card.className = "reply-card";
      card.dataset.replyId = this.getReplyId(reply, idx);
      card.style.border = "1px solid #ddd";
      card.style.borderRadius = "6px";
      card.style.padding = "12px";
      card.style.marginBottom = "12px";
      card.style.background = "#fafafa";

      const header = document.createElement("div");
      header.style.fontWeight = "bold";
      header.textContent = `Reply ${card.dataset.replyId}`;
      const meta = document.createElement("div");
      meta.style.fontSize = "13px";
      meta.style.color = "#666";
      meta.textContent = reply.created_at || reply.createdAt || "";

      card.appendChild(header);
      if (meta.textContent) card.appendChild(meta);

      const answersList = document.createElement("div");
      answersList.style.marginTop = "8px";

      const answers = reply.answers || reply.responses || [];
      if (!answers.length) {
        const noAns = document.createElement("p");
        noAns.textContent = "No answers recorded for this reply.";
        answersList.appendChild(noAns);
      } else {
        answers.forEach((ans) => {
          const row = document.createElement("div");
          row.style.marginBottom = "6px";

          const questionId = ans.question_id || ans.questionId;
          const questionLabel = this.describeQuestion(questionId, questionMap);
          const answerValue = this.describeAnswer(
            ans,
            questionMap.get(questionId)
          );

          const q = document.createElement("div");
          q.style.fontWeight = "bold";
          q.textContent = questionLabel;

          const a = document.createElement("div");
          a.textContent = answerValue;

          row.appendChild(q);
          row.appendChild(a);
          answersList.appendChild(row);
        });
      }

      card.appendChild(answersList);
      this.replyCardsContainer.appendChild(card);
    });
  }

  buildQuestionLookup(formMeta) {
    console.log("🏗️ Building question lookup from form metadata:", formMeta);
    const map = new Map();
    if (!formMeta || !Array.isArray(formMeta.questions)) {
      console.log("⚠️ No questions found in form metadata");
      return map;
    }

    formMeta.questions.forEach((q) => {
      console.log(
        "📝 Processing question:",
        q.question_id || q.id,
        q.question_text
      );
      const optionMap = new Map();
      const options = q.options || [];
      console.log("🎯 Question options:", options);

      options.forEach((opt) => {
        const optionId = opt.option_id || opt.id;
        const optionText = opt.option_text || opt.text;
        optionMap.set(optionId, optionText);
        console.log(`   Option: ${optionId} -> "${optionText}"`);
      });

      const questionEntry = { ...q, optionMap };
      map.set(q.question_id || q.id, questionEntry);
      console.log("✅ Added question to lookup:", q.question_id || q.id);
    });

    console.log("📋 Final question lookup map:", map);
    return map;
  }

  describeQuestion(questionId, questionMap) {
    if (!questionId) return "Unknown question";
    const entry = questionMap.get(questionId);
    if (!entry) return `Question ${questionId}`;
    return entry.question_text || entry.text || `Question ${questionId}`;
  }

  describeAnswer(answer, questionMeta) {
    console.log("🔍 Describing answer:", answer);
    console.log("📋 Question meta:", questionMeta);

    if (!answer) return "No answer";
    if (!questionMeta) return "Unknown question type";

    const questionType = questionMeta.type;
    console.log("🎯 Question type:", questionType);

    // Handle different question types appropriately
    switch (questionType) {
      case "short_answer":
        // For text questions, use answer_text
        const textAnswer = answer.answer_text || answer.answerText;
        console.log("📝 Text answer:", textAnswer);
        return textAnswer || "(no text provided)";

      case "select":
      case "multiselect":
        // For selection questions, resolve option IDs to option text
        const optionIds = answer.answer_options || answer.answerOptions;
        if (Array.isArray(optionIds) && optionIds.length) {
          console.log("🎯 Option IDs to resolve:", optionIds);
          console.log("🗂️ Available option map:", questionMeta?.optionMap);

          const optionMap = questionMeta?.optionMap || new Map();
          const labels = optionIds.map((id) => {
            const label = optionMap.get(id);
            console.log(`   ID ${id} -> Label: ${label}`);
            return label || `Unknown option (${id})`;
          });
          const result = labels.join(", ");
          console.log("✅ Final answer display:", result);
          return result;
        } else {
          console.log("⚠️ No option IDs found for selection question");
          return "(no selection made)";
        }

      default:
        console.log("⚠️ Unknown question type, using fallback logic");
        // Fallback for unknown question types
        if (answer.answer_text || answer.answerText) {
          return answer.answer_text || answer.answerText;
        }
        if (typeof answer === "string") return answer;
        if (typeof answer.value === "string") return answer.value;
        return "(no data)";
    }
  }

  getReplyId(reply, idx) {
    return (
      reply.reply_id ||
      reply.id ||
      reply.submission_id ||
      reply.submissionId ||
      `${idx + 1}`
    );
  }

  scrollToReplyCard(replyId) {
    if (!replyId) return;
    const card = this.replyCardsContainer.querySelector(
      `[data-reply-id="${replyId}"]`
    );
    if (!card) return;
    card.scrollIntoView({ behavior: "smooth", block: "start" });
    card.style.boxShadow = "0 0 0 2px #008cba";
    setTimeout(() => {
      card.style.boxShadow = "";
    }, 1400);
  }

  setStatus(text) {
    if (!this.statusDiv) return;
    this.statusDiv.textContent = text || "";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new ViewFormReplies();
});
