import { config } from "../config.js";

class DeleteForm {
  constructor() {
    this.formIdToDeleteInput = document.getElementById("formIdToDelete");
    this.deleteFormBtn = document.getElementById("deleteFormBtn");

    this.formIdForReplyInput = document.getElementById("formIdForReply");
    this.loadRepliesBtn = document.getElementById("loadRepliesBtn");
    this.replyChooser = document.getElementById("replyChooser");
    this.replySelect = document.getElementById("replySelect");
    this.deleteReplyBtn = document.getElementById("deleteReplyBtn");

    this.init();
  }

  init() {
    if (this.deleteFormBtn && this.formIdToDeleteInput) {
      this.deleteFormBtn.addEventListener("click", () => {
        const formId = (this.formIdToDeleteInput.value || "").trim();
        if (!formId) {
          alert("Please enter a Form ID.");
          return;
        }
        this.deleteForm(formId);
      });
    }

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

    if (this.replySelect && this.deleteReplyBtn) {
      this.replySelect.addEventListener("change", () => {
        const selected = this.replySelect.value;
        this.deleteReplyBtn.disabled = !selected;
      });

      this.deleteReplyBtn.addEventListener("click", async () => {
        const formId = (this.formIdForReplyInput.value || "").trim();
        const replyId = this.replySelect?.value;
        if (!formId || !replyId) return;
        await this.deleteReply(formId, replyId);
      });
    }
  }

  async deleteForm(formId) {
    try {
      if (this.deleteFormBtn) {
        this.deleteFormBtn.disabled = true;
        this.deleteFormBtn.textContent = "Deleting...";
      }
      const response = await fetch(`${config.apiBaseUrl}/api/forms/${formId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete form: ${response.status} ${errorText}`);
      }
      alert(`Form ${formId} deleted successfully.`);
      if (this.formIdToDeleteInput) this.formIdToDeleteInput.value = "";
    } catch (error) {
      console.error("Error deleting form:", error);
      alert(`Error deleting form: ${error.message}`);
    } finally {
      if (this.deleteFormBtn) {
        this.deleteFormBtn.disabled = false;
        this.deleteFormBtn.textContent = "Delete Form";
      }
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
    if (this.deleteReplyBtn) this.deleteReplyBtn.disabled = true;
  }

  async deleteReply(formId, replyId) {
    try {
      if (this.deleteReplyBtn) {
        this.deleteReplyBtn.disabled = true;
        this.deleteReplyBtn.textContent = "Deleting...";
      }
      const response = await fetch(`${config.apiBaseUrl}/api/forms/${formId}/replies/${replyId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete reply: ${response.status} ${errorText}`);
      }
      alert(`Reply ${replyId} deleted successfully.`);
      await this.loadReplies(formId);
    } catch (error) {
      console.error("Error deleting reply:", error);
      alert(`Error deleting reply: ${error.message}`);
    } finally {
      if (this.deleteReplyBtn) {
        this.deleteReplyBtn.disabled = false;
        this.deleteReplyBtn.textContent = "Delete Reply";
      }
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new DeleteForm();
});
