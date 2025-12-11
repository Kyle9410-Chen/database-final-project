import "@typespec/http";

using Http;

@service
@route("/api")
namespace API {
  model FormQuestionResponse {
    id: string;
    type: "short_answer" | "select" | "multiple_select";
    is_required: boolean;
    question_text: string;

    @doc("Options for select and multiple_select question types")
    options?: string[];
  }

  model FormQuestionRequest {
    type: "short_answer" | "select" | "multiple_select";
    is_required: boolean;
    question_text: string;

    @doc("Options for select and multiple_select question types")
    options?: string[];
  }

  model FormAnswerRequest {
    question_id: string;
    answer_text?: string;
    answer_options?: numeric[];
  }

  model FormAnswerResponse extends FormQuestionResponse {
    answer_text?: string;
    answer_options?: numeric[];
  }

  @route("/forms")
  @get
  op getAllforms(): FormQuestionResponse[];

  @route("/forms/{id}")
  @get
  op getFormById(id: string): FormQuestionResponse;
  @route("/forms")
  @post
  op createForm(form: FormQuestionRequest): FormQuestionResponse;

  @route("/forms/{id}/responses")
  @get
  op getFormResponses(id: string): FormAnswerResponse[];

  @route("/forms/{id}/responses")
  @post
  op submitFormResponse(id: string, answers: FormAnswerRequest[]): void;
}
