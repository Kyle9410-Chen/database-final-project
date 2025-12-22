import { config } from "../config.js";

class UpdateForm {
  constructor() {
    this.formIdForReplyInput = document.getElementById("formIdForReply");
    this.loadRepliesBtn = document.getElementById("loadRepliesBtn");
    this.replyChooser = document.getElementById("replyChooser");
    this.replySelect = document.getElementById("replySelect");
    this.proceedReplyUpdateBtn = document.getElementById("proceedReplyUpdate");

    this.init();
  }

  init() {
    if (this.loadRepliesBtn && this.formIdForReplyInput) {
      this.loadRepliesBtn.addEventListener("click", async () => {
        const formId = (this.formIdForReplyInput.value || "").trim();
        if (!formId) {
          alert("Please enter a Form ID.");
          return;
        }
        await this.loadReplies(formId);
      });
    }

    if (this.replySelect && this.proceedReplyUpdateBtn) {
      this.replySelect.addEventListener("change", () => {
        const selected = this.replySelect.value;
        this.proceedReplyUpdateBtn.disabled = !selected;
      });

      this.proceedReplyUpdateBtn.addEventListener("click", () => {
        const formId = (this.formIdForReplyInput.value || "").trim();
        const selectedReplyId = this.replySelect?.value;
        if (!selectedReplyId || !formId) return;

        try {
          localStorage.setItem(
            "replyUpdateSelection",
            JSON.stringify({ form_id: formId, reply_id: selectedReplyId })
          );
        } catch {}

        alert(`Selected reply ${selectedReplyId} for form ${formId}.`);
      });
    }
  }

  async loadReplies(formId) {
    try {
      if (this.loadRepliesBtn) {
        this.loadRepliesBtn.disabled = true;
        this.loadRepliesBtn.textContent = "Loading...";
      }

      const formResp = await fetch(`${config.apiBaseUrl}/api/forms/${formId}`);
      if (!formResp.ok) {
        const errorText = await formResp.text();
        throw new Error(`Form not found: ${formResp.status} ${errorText}`);
      }

      const repliesResp = await fetch(`${config.apiBaseUrl}/api/forms/${formId}/replies`);
      if (!repliesResp.ok) {
        const errorText = await repliesResp.text();
        throw new Error(`Failed to load replies: ${repliesResp.status} ${errorText}`);
      }

      const replies = await repliesResp.json();
      this.populateReplies(replies || []);

      if (this.replyChooser) this.replyChooser.style.display = "block";
    } catch (error) {
      console.error("Error loading replies:", error);
      alert(`Error loading replies: ${error.message}`);
      if (this.replyChooser) this.replyChooser.style.display = "none";
    } finally {
      if (this.loadRepliesBtn) {
        this.loadRepliesBtn.disabled = false;
        this.loadRepliesBtn.textContent = "Load Replies";
      }
    }
  }

  populateReplies(replies) {
    if (!this.replySelect) return;
    this.replySelect.innerHTML = "";
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "-- Select a reply --";
    this.replySelect.appendChild(placeholder);

    replies.forEach((r, idx) => {
      const opt = document.createElement("option");
      const id = r.reply_id || r.id || r.submission_id || `${idx + 1}`;
      const labelParts = [
        `Reply ${id}`,
        r.created_at || r.createdAt ? `(${r.created_at || r.createdAt})` : "",
      ].filter(Boolean);
      opt.value = id;
      opt.textContent = labelParts.join(" ");
      this.replySelect.appendChild(opt);
    });

    this.replySelect.disabled = replies.length === 0;
    if (this.proceedReplyUpdateBtn) this.proceedReplyUpdateBtn.disabled = true;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new UpdateForm();
});
