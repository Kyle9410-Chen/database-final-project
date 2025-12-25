import { config } from "../config.js";

class ViewFormReplies {
	constructor() {
		this.formIdInput = document.getElementById("formIdForReply");
		this.loadRepliesBtn = document.getElementById("loadRepliesBtn");
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
				`${config.apiBaseUrl}/api/forms/${formId}/replies`
			);
			if (!repliesResp.ok) {
				const errorText = await repliesResp.text();
				throw new Error(`Failed to load replies: ${repliesResp.status} ${errorText}`);
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
				reply.created_at || reply.createdAt ? `(${reply.created_at || reply.createdAt})` : "",
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
					const answerValue = this.describeAnswer(ans, questionMap.get(questionId));

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
		const map = new Map();
		if (!formMeta || !Array.isArray(formMeta.questions)) return map;
		formMeta.questions.forEach((q) => {
			const optionMap = new Map();
			(q.options || []).forEach((opt) => {
				optionMap.set(opt.option_id || opt.id, opt.option_text || opt.text);
			});
			map.set(q.question_id || q.id, { ...q, optionMap });
		});
		return map;
	}

	describeQuestion(questionId, questionMap) {
		if (!questionId) return "Unknown question";
		const entry = questionMap.get(questionId);
		if (!entry) return `Question ${questionId}`;
		return entry.question_text || entry.text || `Question ${questionId}`;
	}

	describeAnswer(answer, questionMeta) {
		if (!answer) return "No answer";

		if (answer.answer_text || answer.answerText) {
			return answer.answer_text || answer.answerText;
		}

		const optionIds = answer.answer_options || answer.answerOptions;
		if (Array.isArray(optionIds) && optionIds.length) {
			const map = questionMeta?.optionMap || new Map();
			const labels = optionIds.map((id) => map.get(id) || id);
			return labels.join(", ");
		}

		if (typeof answer === "string") return answer;
		if (typeof answer.value === "string") return answer.value;

		return "(no data)";
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
