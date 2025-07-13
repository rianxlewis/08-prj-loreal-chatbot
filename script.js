/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Conversation state
let userName = "";
let messages = [
  {
    role: "system",
    content:
      "You are a helpful assistant for the company L'Oreal. You will only answer questions related to L'Oreal and their products or routines related to L'Oreal products. If users ask for recommendations, you will only recommend L'Oreal products. You have a bright, positive, tone and are passionate about the company. Always use the user's name if you know it.",
  },
];

// Set initial message
chatWindow.textContent = "👋 Hello! How can I help you today?";

// Function to get response from OpenAI API
async function getOpenAIResponse() {
  // Prepare the API request to the Cloudflare Worker
  const url = "https://lorealbot-worker.rianxlewis.workers.dev/";
  const headers = {
    "Content-Type": "application/json",
  };
  const body = JSON.stringify({
    messages: messages,
    max_tokens: 600,
  });

  // Make the API request using fetch and await the response
  const response = await fetch(url, {
    method: "POST",
    headers: headers,
    body: body,
  });

  // Parse the JSON response
  const data = await response.json();

  // Get the assistant's reply
  const reply =
    data.choices &&
    data.choices[0] &&
    data.choices[0].message &&
    data.choices[0].message.content
      ? data.choices[0].message.content
      : "Sorry, I couldn't get a response from OpenAI.";

  return reply;
}

// Helper to render the chat history
function renderChat() {
  let html = "";
  for (let i = 1; i < messages.length; i++) {
    const msg = messages[i];
    if (msg.role === "user") {
      html += `<div class="msg user"><b>${userName || "You"}:</b> ${
        msg.content
      }</div>`;
    } else if (msg.role === "assistant") {
      html += `<div class="msg ai"><b>Assistant:</b> ${msg.content}</div>`;
    }
  }
  // Add a placeholder for thinking text if needed
  if (window.isThinking) {
    html += `<div style="margin-top:6px;"><i>Thinking...</i></div>`;
  }
  chatWindow.innerHTML = html || "👋 Hello! What's your name?";
}

// Handle form submit
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const message = userInput.value.trim();
  if (!message) return;

  // Add user message to history
  messages.push({ role: "user", content: message });
  window.isThinking = true;
  renderChat();

  // Get response from OpenAI API
  const reply = await getOpenAIResponse();
  window.isThinking = false;
  messages.push({ role: "assistant", content: reply });
  renderChat();
  userInput.value = "";
});
