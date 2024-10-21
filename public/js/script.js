// script.js
let conversationCount =
  parseInt(localStorage.getItem("conversationCount")) || 0;
let conversations = JSON.parse(localStorage.getItem("conversations")) || {};
let currentConversationId =
  localStorage.getItem("currentConversationId") || null;

// Function to send the message
async function sendMessage() {
  const input = document.getElementById("message-input");
  const message = input.value.trim();

  if (message) {
    const conversationId = `Convo ${conversationCount}`;
    appendMessage(conversationId, "You: " + message, false); // Append user message
    input.value = ""; // Clear input

    // Send message to the server
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });
      const data = await response.json();
      appendMessage(conversationId, data.response, true); // Append bot response
    } catch (error) {
      console.error("Error:", error);
      appendMessage(conversationId, "Bot: Sorry, something went wrong!", true);
    }
  }
}

// Function to append the message
function appendMessage(conversationId, message, isBot = false) {
  const messagesBox = document.getElementById("messages");
  const messageDiv = document.createElement("div");
  messageDiv.className = isBot ? "bot-message" : "user-message"; // Differentiate bot and user messages

  // If it's the bot's message, parse it as Markdown
  if (isBot) {
    messageDiv.innerHTML = marked.parse(message); // Convert Markdown to HTML
  } else {
    messageDiv.textContent = message; // User message as plain text
  }

  messagesBox.appendChild(messageDiv);
  messagesBox.scrollTop = messagesBox.scrollHeight; // Scroll to the bottom

  // Store messages in the conversation object
  if (!conversations[conversationId]) {
    conversations[conversationId] = [];
  }
  conversations[conversationId].push(message);
}

// Function to start a new conversation
function new_conversation() {
  conversationCount++; // Increment conversation count
  const conversationId = `Convo ${conversationCount}`;
  document.getElementById("messages").innerHTML = ""; // Clear current chat
  appendMessage(conversationId, "New Conversation: " + conversationId, false); // Display conversation name

  // Update conversation list
  updateConversationList(conversationId);
}

// Function to delete all conversations
function delete_conversations() {
  conversationCount = 0; // Reset conversation count
  conversations = {}; // Clear conversations object
  document.getElementById("conversation-list").innerHTML = ""; // Clear conversation list
  new_conversation(); // Start a new conversation
}

// Function to update the conversation list
function updateConversationList(conversationId) {
  const conversationList = document.getElementById("conversation-list");
  const convoItem = document.createElement("div");
  convoItem.textContent = conversationId; // Add conversation name to the list
  convoItem.classList.add("conversation-item");
  convoItem.onclick = function () {
    loadConversation(conversationId); // Load conversation on click
  };
  conversationList.appendChild(convoItem);
}

// Function to load a previous conversation
function loadConversation(conversationId) {
  document.getElementById("messages").innerHTML = ""; // Clear messages
  if (conversations[conversationId]) {
    conversations[conversationId].forEach((msg) => {
      appendMessage(conversationId, msg, msg.startsWith("Bot:")); // Display old messages with correct style
    });
  }
}

// Add event listeners for sending messages
document.getElementById("send-button").addEventListener("click", sendMessage);
document
  .getElementById("message-input")
  .addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      event.preventDefault(); // Prevent new line on Enter
      sendMessage();
    }
  });

function initializeApp() {
  loadConversationsFromStorage();
  if (Object.keys(conversations).length === 0) {
    new_conversation();
  } else {
    updateConversationListUI();
    if (currentConversationId) {
      loadConversation(currentConversationId);
    }
  }
}

function loadConversationsFromStorage() {
  const storedConversations = localStorage.getItem("conversations");
  if (storedConversations) {
    conversations = JSON.parse(storedConversations);
    updateConversationListUI();
  }
}

async function sendMessage() {
  const input = document.getElementById("message-input");
  const message = input.value.trim();

  if (message && currentConversationId) {
    appendMessage(currentConversationId, "You: " + message, false);
    input.value = "";

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });
      const data = await response.json();
      appendMessage(currentConversationId, "Bot: " + data.response, true);
    } catch (error) {
      console.error("Error:", error);
      appendMessage(
        currentConversationId,
        "Bot: Sorry, something went wrong!",
        true
      );
    }
  }
}

function appendMessage(conversationId, message, isBot = false) {
  if (!conversations[conversationId]) {
    conversations[conversationId] = {
      messages: [],
      timestamp: Date.now(),
      title: `Chat ${conversationId}`,
    };
  }

  conversations[conversationId].messages.push({
    text: message,
    isBot: isBot,
    timestamp: Date.now(),
  });

  if (conversationId === currentConversationId) {
    displayMessage(message, isBot);
  }

  saveToLocalStorage();
  updateConversationListUI();
}

function displayMessage(message, isBot) {
  const messagesBox = document.getElementById("messages");
  const messageDiv = document.createElement("div");
  messageDiv.className = isBot ? "bot-message" : "user-message";

  if (isBot) {
    messageDiv.innerHTML = marked.parse(message);
  } else {
    messageDiv.textContent = message;
  }

  messagesBox.appendChild(messageDiv);
  messagesBox.scrollTop = messagesBox.scrollHeight;
}

function new_conversation() {
  conversationCount++;
  const newConvoId = `${conversationCount}`;

  conversations[newConvoId] = {
    messages: [],
    timestamp: Date.now(),
    title: `Chat ${newConvoId}`,
  };

  currentConversationId = newConvoId;

  document.getElementById("messages").innerHTML = "";

  updateConversationListUI();
  saveToLocalStorage();

  appendMessage(newConvoId, "New Conversation Started", false);
}

function createConversationLink(convoId, convoData) {
  const linkContainer = document.createElement("div");
  linkContainer.className = "conversation-link-container";

  // Create the main link
  const link = document.createElement("a");
  link.href = "#";
  link.className = "conversation-link";
  if (convoId === currentConversationId) {
    link.classList.add("active");
  }

  const titleSpan = document.createElement("span");
  titleSpan.className = "conversation-title";
  titleSpan.textContent = convoData.title || `Chat ${convoId}`;

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "delete-btn";
  deleteBtn.innerHTML = "&times;";

  // Add event listeners
  link.onclick = (e) => {
    e.preventDefault();
    loadConversation(convoId);
  };

  deleteBtn.onclick = (e) => {
    e.stopPropagation();
    deleteConversation(convoId);
  };

  // Assemble the link container
  link.appendChild(titleSpan);
  linkContainer.appendChild(link);
  linkContainer.appendChild(deleteBtn);

  return linkContainer;
}

// Function to update the conversation list UI
function updateConversationListUI() {
  const conversationList = document.getElementById("conversation-list");
  conversationList.innerHTML = "";

  // Sort conversations by timestamp (newest first)
  const sortedConversations = Object.entries(conversations).sort(
    ([, a], [, b]) => b.timestamp - a.timestamp
  );

  sortedConversations.forEach(([convoId, convoData]) => {
    const linkContainer = createConversationLink(convoId, convoData);
    conversationList.appendChild(linkContainer);
  });
}

// Function to load a conversation
function loadConversation(conversationId) {
  if (conversations[conversationId]) {
    currentConversationId = conversationId;
    const messagesBox = document.getElementById("messages");
    messagesBox.innerHTML = "";

    // Display all messages from the conversation
    conversations[conversationId].messages.forEach((msg) => {
      if (typeof msg === "string") {
        // Handle old format messages
        const isBot = msg.startsWith("Bot:") || msg.includes("Bot:");
        displayMessage(msg, isBot);
      } else {
        // Handle new format messages
        displayMessage(msg.text, msg.isBot);
      }
    });

    updateConversationListUI();
    saveToLocalStorage();
  }
}

// Function to delete a conversation
function deleteConversation(conversationId) {
  if (
    confirm(
      `Are you sure you want to delete ${conversations[conversationId].title}?`
    )
  ) {
    delete conversations[conversationId];

    if (conversationId === currentConversationId) {
      const remainingConvos = Object.keys(conversations);
      if (remainingConvos.length > 0) {
        loadConversation(remainingConvos[0]);
      } else {
        new_conversation();
      }
    }

    saveToLocalStorage();
    updateConversationListUI();
  }
}

// Function to delete all conversations
function delete_conversations() {
  if (confirm("Are you sure you want to delete all conversations?")) {
    conversations = {};
    conversationCount = 0;
    currentConversationId = null;
    localStorage.clear();
    document.getElementById("conversation-list").innerHTML = "";
    new_conversation();
  }
}

// Function to save state to localStorage
function saveToLocalStorage() {
  localStorage.setItem("conversations", JSON.stringify(conversations));
  localStorage.setItem("conversationCount", conversationCount.toString());
  localStorage.setItem("currentConversationId", currentConversationId);
}

// Add event listeners
document.getElementById("send-button").addEventListener("click", sendMessage);
document
  .getElementById("message-input")
  .addEventListener("keypress", function (event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  });

// Initialize the app when the page loads
document.addEventListener("DOMContentLoaded", initializeApp);
