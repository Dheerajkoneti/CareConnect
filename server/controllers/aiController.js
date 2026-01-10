const AIConversation = require("../models/AIConversation");
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

exports.chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user._id;

    if (!message) {
      return res.status(200).json({
        response: "I'm here with you ❤️. What would you like to talk about?",
      });
    }

    // 🧠 LOAD LAST 10 MESSAGES
    const history = await AIConversation.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const conversationContext = history
      .reverse()
      .map(h => `${h.role === "user" ? "User" : "AI"}: ${h.content}`)
      .join("\n");

    const prompt = `
You are CareConnect, a warm and empathetic AI companion.
Be supportive and emotionally aware.

Conversation so far:
${conversationContext}

User: ${message}
AI:
`;

    // SAVE USER MESSAGE
    await AIConversation.create({
      userId,
      role: "user",
      content: message,
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const aiText = response.text;

    // SAVE AI RESPONSE
    await AIConversation.create({
      userId,
      role: "ai",
      content: aiText,
    });

    return res.status(200).json({ response: aiText });

  } catch (error) {
    console.error("AI ERROR:", error.message);
    return res.status(200).json({
      response: "I'm here with you ❤️. Please give me a moment.",
    });
  }
};
exports.getAIHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    const history = await AIConversation.find({ userId })
      .sort({ createdAt: 1 }) // oldest → newest
      .lean();

    res.status(200).json(history);
  } catch (error) {
    console.error("AI HISTORY ERROR:", error);
    res.status(500).json({ message: "Failed to load AI history" });
  }
};
