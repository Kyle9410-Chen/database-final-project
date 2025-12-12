import "@typespec/http";

using Http;

@format("uuid")
scalar uuid extends string;

@service
@route("/api")
namespace API {
  @doc("An option for select and multiple_select questions")
  model Option {
    option_id: uuid;
    option_text: string;
  }

  @doc("A question in a form")
  model QuestionResponse {
    question_id: uuid;
    type: "short_answer" | "select" | "multiple_select";
    is_required: boolean;
    question_text: string;

    @doc("Options for select and multiple_select question types")
    options?: Option[];
  }

  @doc("Request model for creating a new form question")
  model QuestionRequest {
    type: "short_answer" | "select" | "multiple_select";
    is_required: boolean;
    question_text: string;

    @doc("Options for select and multiple_select question types")
    options?: string[];
  }

  @doc("A form with multiple questions")
  model Form {
    title: string;
    form_id: uuid;
    questions: QuestionResponse[];
  }

  @doc("Request model for creating a new form")
  model CreateFormRequest {
    title: string;
    questions: QuestionRequest[];
  }

  @doc("An answer to a form question")
  model AnswerRequest {
    question_id: uuid;
    answer_text?: string;

    @doc("The ids of the selected options")
    answer_options?: uuid[];
  }

  @doc("A user's response to a question in a form")
  model AnswerResponse extends QuestionResponse {
    answer_text?: string;

    @doc("The ids of the selected options")
    answer_options?: uuid[];
  }

  @doc("A user's complete response to a form")
  model FormAnswers {
    answers: AnswerResponse[];
  }

  @doc("Request model for submitting a form response")
  model CreateFormAnswersRequest {
    answers: AnswerRequest[];
  }

  @doc("Get all forms")
  @route("/forms")
  @get
  op getAllforms(): Form[];

  @doc("Get a form by its ID")
  @route("/forms/{id}")
  @get
  op getFormById(id: string): Form;

  @doc("Create a new form")
  @route("/forms")
  @post
  op createForm(@body body: CreateFormRequest): Form;

  @doc("Get all responses for a specific form")
  @route("/forms/{id}/answers")
  @get
  op getFormAnswers(id: string): FormAnswers[];

  @doc("Submit a response to a specific form")
  @route("/forms/{id}/answers")
  @post
  op submitFormAnswer(id: string, @body body: CreateFormAnswersRequest): void;
}
