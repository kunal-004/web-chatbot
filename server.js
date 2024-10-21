const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Serve the HTML file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "html", "index.html"));
});

// Handle chat requests
app.post("/api/chat", async (req, res) => {
  const { message } = req.body;

  // Initialize the Gemini API
  const genAI = new GoogleGenerativeAI(process.env.API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    const result = await model.generateContent(message);
    const botResponse = result.response.text();

    // Send the response back to the user
    res.json({ response: botResponse });
  } catch (error) {
    console.error("Error generating content:", error);
    res.status(500).send("Error generating content");
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
