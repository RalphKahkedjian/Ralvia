"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import { apiFetch } from "@/lib/api/client";

type Language = "en" | "ar";

type SpeechRecognitionErrorEventLike = {
  error: string;
  message?: string;
};

type SpeechRecognitionInstance = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror:
    | ((event: SpeechRecognitionErrorEventLike) => void)
    | null;
  onend: (() => void) | null;
  start: () => void;
};

type SpeechRecognitionEventLike = {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
};


type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

type SpeechRecognitionWindow = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

type CustomerActionData = {
  name: string;
  email: string | null;
  phone: string | null;
};

type InvoiceActionData = {
  customer_name: string;
  invoice_number: string;
  amount: number;
  issue_date: string;
  due_date: string;
};

type EmailActionData = {
  customer_name: string;
  customer_email: string;
  subject: string;
  message: string;
};

type FinanceAction =
  | {
      type: "create_customer";
      requires_approval: boolean;
      data: CustomerActionData;
    }
  | {
      type: "create_invoice";
      requires_approval: boolean;
      data: InvoiceActionData;
    }
  | {
      type: "send_email";
      requires_approval: boolean;
      data: EmailActionData;
    };

type ChatMessage = {
  id?: number;
  role: "user" | "assistant";
  content: string;
  action?: FinanceAction | null;
};

type ChatResponse = {
  conversation_id: number;

  message: {
    id: number;
    role: "assistant";
    content: string;
    language: string;
  };

  action: FinanceAction | null;
};

type Conversation = {
  id: number;
  title: string | null;
  created_at: string;
  updated_at: string;
};

type ConversationDetails = {
  id: number;
  title: string | null;

  messages: {
    id: number;
    role: "user" | "assistant";
    content: string;
    language: string;
  }[];

  created_at: string;
  updated_at: string;
};

export default function FinanceChat() {
  const [messages, setMessages] =
    useState<ChatMessage[]>([]);

  const [conversations, setConversations] =
    useState<Conversation[]>([]);

  const [conversationId, setConversationId] =
    useState<number | null>(null);

  const [question, setQuestion] = useState("");

  const [language, setLanguage] =
    useState<Language>("en");

  const [loading, setLoading] = useState(false);

  const [historyLoading, setHistoryLoading] =
    useState(false);

  const [actionLoading, setActionLoading] =
    useState(false);

  const [listening, setListening] =
    useState(false);

  const [speaking, setSpeaking] =
    useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    loadConversations();
  }, []);

  async function loadConversations() {
    try {
      const response = await apiFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/finance-chat/conversations`
      );

      if (!response.ok) {
        throw new Error(
          "Could not load chat history."
        );
      }

      const data: Conversation[] =
        await response.json();

      setConversations(data);
    } catch (error) {
      console.error(error);
    }
  }

  async function confirmEmail(
  messageIndex: number,
  action: Extract<FinanceAction, { type: "send_email" }>
) {
  try {
    setActionLoading(true);

    const response = await apiFetch(
      `${process.env.NEXT_PUBLIC_API_URL}/finance-chat/actions/send-email`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer_name: action.data.customer_name,
          subject: action.data.subject,
          message: action.data.message,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Could not send email.");
    }

    setMessages((currentMessages) =>
      currentMessages.map((message, index) =>
        index === messageIndex
          ? {
              ...message,
              content:
                message.content +
                `\n\n✅ Email sent successfully to ${action.data.customer_email}.`,
              action: null,
            }
          : message
      )
    );
  } catch (error) {
    alert(
      error instanceof Error
        ? error.message
        : "Could not send email."
    );
  } finally {
    setActionLoading(false);
  }
}

  async function openConversation(id: number) {
    if (loading || historyLoading) {
      return;
    }

    setHistoryLoading(true);
    setError("");

    window.speechSynthesis.cancel();
    setSpeaking(false);

    try {
      const response = await apiFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/finance-chat/conversations/${id}`
      );

      if (!response.ok) {
        throw new Error(
          "Could not load this conversation."
        );
      }

      const data: ConversationDetails =
        await response.json();

      setConversationId(data.id);

      setMessages(
        data.messages.map((message) => ({
          id: message.id,
          role: message.role,
          content: message.content,
        }))
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Could not load conversation."
      );
    } finally {
      setHistoryLoading(false);
    }
  }

  function startNewChat() {
    window.speechSynthesis.cancel();

    setConversationId(null);
    setMessages([]);
    setQuestion("");
    setError("");
    setSpeaking(false);
  }

  async function submitQuestion(
    text: string,
    voiceMode: boolean
  ) {
    const trimmedQuestion = text.trim();

    if (!trimmedQuestion || loading) {
      return;
    }

    const userMessage: ChatMessage = {
      role: "user",
      content: trimmedQuestion,
    };

    setMessages((current) => [
      ...current,
      userMessage,
    ]);

    setQuestion("");
    setLoading(true);
    setError("");

    try {
      const response = await apiFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/finance-chat`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            question: trimmedQuestion,
            language,
            conversation_id:
              conversationId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error(
          "Finance chat error:",
          data
        );

        throw new Error(
          data?.message ||
            "Ralvia could not answer your question."
        );
      }

      const chatData = data as ChatResponse;

      setConversationId(
        chatData.conversation_id
      );

      setMessages((current) => [
        ...current,
        {
          id: chatData.message.id,
          role: "assistant",
          content:
            chatData.message.content,
          action: chatData.action,
        },
      ]);

      await loadConversations();

      if (voiceMode) {
        speakAnswer(
          chatData.message.content,
          language
        );
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  async function sendMessage(
    event: FormEvent
  ) {
    event.preventDefault();

    await submitQuestion(
      question,
      false
    );
  }

 function startListening() {
  const speechWindow =
    window as SpeechRecognitionWindow;

  const SpeechRecognition =
    speechWindow.SpeechRecognition ??
    speechWindow.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    setError(
      "Voice input is not supported in this browser."
    );

    return;
  }

  window.speechSynthesis.cancel();
  setSpeaking(false);
  setError("");

  const recognition =
    new SpeechRecognition();

  recognition.lang =
    language === "ar"
      ? "ar-SA"
      : "en-US";

  recognition.interimResults = false;
  recognition.continuous = false;

  recognition.onstart = () => {
    console.log(
      "Speech recognition started"
    );

    setListening(true);
    setError("");
  };

  recognition.onresult = async (
    event: SpeechRecognitionEventLike
  ) => {
    const transcript =
      event.results?.[0]?.[0]?.transcript
        ?.trim();

    console.log(
      "Speech transcript:",
      transcript
    );

    setListening(false);

    if (!transcript) {
      setError(
        "No speech was detected. Please try again."
      );

      return;
    }

    setQuestion(transcript);

    await submitQuestion(
      transcript,
      true
    );
  };

  recognition.onerror = (
    event: SpeechRecognitionErrorEventLike
  ) => {
    console.error(
      "Speech recognition error:",
      event.error,
      event.message
    );

    setListening(false);

    switch (event.error) {
      case "not-allowed":
      case "service-not-allowed":
        setError(
          "Microphone access was blocked. Please allow microphone access for Ralvia."
        );
        break;

      case "audio-capture":
        setError(
          "No microphone was detected or the microphone could not be accessed."
        );
        break;

      case "no-speech":
        setError(
          "No speech was detected. Please speak clearly and try again."
        );
        break;

      case "network":
        setError(
          "Speech recognition could not connect to the speech service. Please try again."
        );
        break;

      case "aborted":
        setError(
          "Voice input was cancelled."
        );
        break;

      default:
        setError(
          `Voice recognition failed: ${event.error}`
        );
    }
  };

  recognition.onend = () => {
    console.log(
      "Speech recognition ended"
    );

    setListening(false);
  };

  try {
    recognition.start();
  } catch (error) {
    console.error(
      "Could not start speech recognition:",
      error
    );

    setListening(false);

    setError(
      "Could not start voice recognition."
    );
  }
}

  function speakAnswer(
    text: string,
    responseLanguage: Language
  ) {
    window.speechSynthesis.cancel();

    const speech =
      new SpeechSynthesisUtterance(text);

    speech.lang =
      responseLanguage === "ar"
        ? "ar-SA"
        : "en-US";

    speech.rate = 1;
    speech.pitch = 1;
    speech.volume = 1;

    speech.onstart = () => {
      setSpeaking(true);
    };

    speech.onend = () => {
      setSpeaking(false);
    };

    speech.onerror = () => {
      setSpeaking(false);
    };

    window.speechSynthesis.speak(
      speech
    );
  }

  function stopSpeaking() {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }

  async function confirmCustomer(
    messageIndex: number,
    action: Extract<
      FinanceAction,
      { type: "create_customer" }
    >
  ) {
    setActionLoading(true);
    setError("");

    try {
      const response = await apiFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/finance-chat/actions/create-customer`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name: action.data.name,
            email: action.data.email,
            phone: action.data.phone,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Could not create customer."
        );
      }

      setMessages((current) =>
        current.map(
          (message, index) =>
            index === messageIndex
              ? {
                  ...message,
                  content:
                    message.content +
                    `\n\n✅ ${data.message}`,
                  action: null,
                }
              : message
        )
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Could not create customer."
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function confirmInvoice(
    messageIndex: number,
    action: Extract<
      FinanceAction,
      { type: "create_invoice" }
    >
  ) {
    setActionLoading(true);
    setError("");

    try {
      const response = await apiFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/finance-chat/actions/create-invoice`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            customer_name:
              action.data.customer_name,

            invoice_number:
              action.data.invoice_number,

            amount:
              action.data.amount,

            issue_date:
              action.data.issue_date,

            due_date:
              action.data.due_date,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Could not create invoice."
        );
      }

      setMessages((current) =>
        current.map(
          (message, index) =>
            index === messageIndex
              ? {
                  ...message,

                  content:
                    message.content +
                    `\n\n✅ ${data.message}`,

                  action: null,
                }
              : message
        )
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Could not create invoice."
      );
    } finally {
      setActionLoading(false);
    }
  }

  function cancelAction(
    messageIndex: number
  ) {
    setMessages((current) =>
      current.map(
        (message, index) =>
          index === messageIndex
            ? {
                ...message,

                content:
                  message.content +
                  "\n\nAction cancelled.",

                action: null,
              }
            : message
      )
    );
  }

  return (
    <div className="flex h-[650px] overflow-hidden rounded-md border border-[#D8DCE3] bg-white">

      {/* HISTORY SIDEBAR */}
      <div className="flex w-64 flex-col border-r border-[#D8DCE3] bg-[#FBFAF8]">

        <div className="p-3">
          <button
            type="button"
            onClick={startNewChat}
            className="w-full rounded-md bg-[#14213D] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1c2d52]"
          >
            + New chat
          </button>
        </div>

        <div className="border-t border-[#D8DCE3] px-3 py-3">
          <p className="text-xs font-medium text-[#5B6472]">
            History
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-3">

          {conversations.length === 0 && (
            <p className="px-2 py-3 text-xs text-[#5B6472]">
              No conversations yet.
            </p>
          )}

          {conversations.map(
            (conversation) => (
              <button
                key={conversation.id}
                type="button"
                onClick={() =>
                  openConversation(
                    conversation.id
                  )
                }
                className={`mb-1 w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                  conversationId ===
                  conversation.id
                    ? "bg-[#14213D]/10 font-medium text-[#14213D]"
                    : "text-[#5B6472] hover:bg-[#14213D]/5 hover:text-[#14213D]"
                }`}
              >
                <p className="truncate">
                  {conversation.title ||
                    "New conversation"}
                </p>
              </button>
            )
          )}

        </div>
      </div>

      {/* CHAT AREA */}
      <div className="flex min-w-0 flex-1 flex-col">

        {/* TOP BAR */}
        <div className="flex items-center justify-between border-b border-[#D8DCE3] p-4">

          <div>
            <p className="font-serif text-lg text-[#14213D]">
              Ralvia Finance Agent
            </p>

            <p className="text-xs text-[#5B6472]">
              Grounded in your company data
            </p>
          </div>

          <div className="flex gap-2">

            <button
              type="button"
              onClick={() =>
                setLanguage("en")
              }
              className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                language === "en"
                  ? "bg-[#14213D] text-white"
                  : "border border-[#D8DCE3] text-[#5B6472]"
              }`}
            >
              English
            </button>

            <button
              type="button"
              onClick={() =>
                setLanguage("ar")
              }
              className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                language === "ar"
                  ? "bg-[#14213D] text-white"
                  : "border border-[#D8DCE3] text-[#5B6472]"
              }`}
            >
              العربية
            </button>

          </div>
        </div>

        {/* MESSAGES */}
        <div className="flex-1 space-y-4 overflow-y-auto p-5">

          {historyLoading && (
            <div className="flex h-full items-center justify-center">

              <p className="text-sm text-[#5B6472]">
                Loading conversation...
              </p>

            </div>
          )}

          {!historyLoading &&
            messages.length === 0 && (

              <div className="flex h-full items-center justify-center">

                <div className="text-center">

                  <p className="font-medium text-[#14213D]">
                    What would you like to know?
                  </p>

                  <p className="mt-1 text-sm text-[#5B6472]">
                    Type a question or speak to Ralvia.
                  </p>

                </div>

              </div>
            )}

          {!historyLoading &&
            messages.map(
              (message, index) => (

                <div
                  key={
                    message.id ?? index
                  }
                  className={`flex ${
                    message.role ===
                    "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >

                  <div className="max-w-[75%]">

                    {/* MESSAGE BUBBLE */}
                    <div
                      className={`whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 ${
                        message.role ===
                        "user"
                          ? "bg-[#14213D] text-white"
                          : "bg-[#F1EFEB] text-[#14213D]"
                      }`}
                    >
                      {message.content}
                    </div>

                    {/* CREATE CUSTOMER */}
                    {message.role ===
                      "assistant" &&
                      message.action
                        ?.type ===
                        "create_customer" && (

                        <div
                          className="mt-3 rounded-md border border-[#D8DCE3] bg-white p-4"
                          style={{ borderLeftColor: "#C08A2E", borderLeftWidth: "3px" }}
                        >

                          <p className="font-semibold text-[#14213D]">
                            Create customer
                          </p>

                          <div className="mt-3 space-y-2 text-sm text-[#14213D]">

                            <p>
                              <span className="font-medium">
                                Name:
                              </span>{" "}
                              {
                                message
                                  .action
                                  .data.name
                              }
                            </p>

                            <p>
                              <span className="font-medium">
                                Email:
                              </span>{" "}
                              {message
                                .action
                                .data
                                .email ||
                                "—"}
                            </p>

                            <p>
                              <span className="font-medium">
                                Phone:
                              </span>{" "}
                              {message
                                .action
                                .data
                                .phone ||
                                "—"}
                            </p>

                          </div>

                          <div className="mt-4 flex gap-2">

                            <button
                              type="button"
                              onClick={() =>
                                cancelAction(
                                  index
                                )
                              }
                              disabled={
                                actionLoading
                              }
                              className="rounded-md border border-[#D8DCE3] px-3 py-2 text-sm text-[#5B6472] transition-colors hover:text-[#14213D] disabled:opacity-50"
                            >
                              Cancel
                            </button>

                            <button
                              type="button"
                                onClick={() =>
                                  confirmCustomer(
                                    index,
                                    message.action as Extract<
                                      FinanceAction,
                                      { type: "create_customer" }
                                    >
                                  )
                                }
                              disabled={
                                actionLoading
                              }
                              className="rounded-md bg-[#14213D] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1c2d52] disabled:opacity-50"
                            >
                              {actionLoading
                                ? "Creating..."
                                : "✓ Confirm create"}
                            </button>

                          </div>

                        </div>
                      )}

                    {/* CREATE INVOICE */}
                    {message.role ===
                      "assistant" &&
                      message.action
                        ?.type ===
                        "create_invoice" && (

                        <div
                          className="mt-3 rounded-md border border-[#D8DCE3] bg-white p-4"
                          style={{ borderLeftColor: "#C08A2E", borderLeftWidth: "3px" }}
                        >

                          <p className="font-semibold text-[#14213D]">
                            Create invoice
                          </p>

                          <div className="mt-3 space-y-2 text-sm text-[#14213D]">

                            <p>
                              <span className="font-medium">
                                Customer:
                              </span>{" "}
                              {
                                message
                                  .action
                                  .data
                                  .customer_name
                              }
                            </p>

                            <p>
                              <span className="font-medium">
                                Invoice #:
                              </span>{" "}
                              {
                                message
                                  .action
                                  .data
                                  .invoice_number
                              }
                            </p>

                            <p>
                              <span className="font-medium">
                                Amount:
                              </span>{" "}
                              $
                              {message
                                .action
                                .data
                                .amount
                                .toLocaleString()}
                            </p>

                            <p>
                              <span className="font-medium">
                                Issue date:
                              </span>{" "}
                              {
                                message
                                  .action
                                  .data
                                  .issue_date
                              }
                            </p>

                            <p>
                              <span className="font-medium">
                                Due date:
                              </span>{" "}
                              {
                                message
                                  .action
                                  .data
                                  .due_date
                              }
                            </p>

                          </div>

                          <div className="mt-4 flex gap-2">

                            <button
                              type="button"
                              onClick={() =>
                                cancelAction(
                                  index
                                )
                              }
                              disabled={
                                actionLoading
                              }
                              className="rounded-md border border-[#D8DCE3] px-3 py-2 text-sm text-[#5B6472] transition-colors hover:text-[#14213D] disabled:opacity-50"
                            >
                              Cancel
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                confirmInvoice(
                                  index,
                                  message.action as Extract<
                                    FinanceAction,
                                    { type: "create_invoice" }
                                  >
                                )
                              }
                              disabled={
                                actionLoading
                              }
                              className="rounded-md bg-[#14213D] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1c2d52] disabled:opacity-50"
                            >
                              {actionLoading
                                ? "Creating..."
                                : "✓ Confirm create"}
                            </button>

                          </div>

                        </div>
                      )}

                    {/* SEND EMAIL */}
                    {message.role ===
                      "assistant" &&
                      message.action
                        ?.type ===
                      "send_email" && (

                        <div
                          className="mt-3 rounded-md border border-[#D8DCE3] bg-white p-4"
                          style={{ borderLeftColor: "#C08A2E", borderLeftWidth: "3px" }}
                        >

                          <p className="font-semibold text-[#14213D]">
                            Email ready for approval
                          </p>

                          <div className="mt-3 space-y-3 text-sm text-[#14213D]">

                            <p>
                              <span className="font-medium">
                                To:
                              </span>{" "}
                              {message.action.data.customer_name} (
                              {message.action.data.customer_email})
                            </p>

                            <p>
                              <span className="font-medium">
                                Subject:
                              </span>{" "}
                              {message.action.data.subject}
                            </p>

                            <div>
                              <p className="font-medium">
                                Message:
                              </p>

                              <div className="mt-1 whitespace-pre-wrap rounded-md bg-[#FBFAF8] p-3">
                                {message.action.data.message}
                              </div>
                            </div>

                          </div>

                          <div className="mt-4 flex gap-2">

                            <button
                              type="button"
                              onClick={() =>
                                cancelAction(
                                  index
                                )
                              }
                              disabled={
                                actionLoading
                              }
                              className="rounded-md border border-[#D8DCE3] px-3 py-2 text-sm text-[#5B6472] transition-colors hover:text-[#14213D] disabled:opacity-50"
                            >
                              Cancel
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                confirmEmail(
                                  index,
                                  message.action as Extract<
                                    FinanceAction,
                                    { type: "send_email" }
                                  >
                                )
                              }
                              disabled={
                                actionLoading
                              }
                              className="rounded-md bg-[#14213D] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1c2d52] disabled:opacity-50"
                            >
                              {actionLoading
                                ? "Sending..."
                                : "✓ Approve & send"}
                            </button>

                          </div>

                        </div>
                      )}

                  </div>
                </div>
              )
            )}

          {loading && (
            <div className="flex justify-start">

              <div className="rounded-2xl bg-[#F1EFEB] px-4 py-3 text-sm text-[#5B6472]">
                Ralvia is thinking...
              </div>

            </div>
          )}

        </div>

        {/* INPUT */}
        <form
          onSubmit={sendMessage}
          className="border-t border-[#D8DCE3] p-4"
        >

          {error && (
            <p className="mb-2 text-sm text-[#B3261E]">
              {error}
            </p>
          )}

          <div className="flex gap-3">

            <input
              value={question}

              onChange={(event) =>
                setQuestion(
                  event.target.value
                )
              }

              placeholder={
                language === "ar"
                  ? "اسأل رالفيا عن أعمالك..."
                  : "Ask Ralvia about your business..."
              }

              dir={
                language === "ar"
                  ? "rtl"
                  : "ltr"
              }

              className="flex-1 rounded-md border border-[#D8DCE3] px-4 py-3 text-sm text-[#14213D] outline-none transition-colors focus:border-[#14213D]"
            />

            <button
              type="button"

              onClick={
                startListening
              }

              disabled={
                loading ||
                listening
              }

              className={`rounded-md border px-4 py-3 text-sm font-medium transition-colors disabled:opacity-50 ${
                listening
                  ? "border-[#E8B4B0] bg-[#FBEAEA] text-[#B3261E]"
                  : "border-[#D8DCE3] text-[#5B6472]"
              }`}
            >
              {listening
                ? "🎤 Listening..."
                : "🎤"}
            </button>

            {speaking && (
              <button
                type="button"

                onClick={
                  stopSpeaking
                }

                className="rounded-md border border-[#D8DCE3] px-4 py-3 text-sm font-medium text-[#5B6472] transition-colors hover:text-[#14213D]"
              >
                🔇 Stop
              </button>
            )}

            <button
              type="submit"

              disabled={
                loading ||
                !question.trim()
              }

              className="rounded-md bg-[#14213D] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#1c2d52] disabled:opacity-50"
            >
              Send
            </button>

          </div>

        </form>

      </div>
    </div>
  );
}