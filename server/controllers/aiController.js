const AIChatHistory = require('../models/AIChatHistory');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    console.error("❌ FATAL: GEMINI_API_KEY missing in .env");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// AI persona
const AI_PERSONA =
    "You are CareConnect, an empathetic emotional-support companion. Be warm, supportive, and concise. Never give medical or professional advice.";

// Sentiment tagging
const checkSentiment = (text) => {
    text = text.toLowerCase();
    if (text.includes("sad") || text.includes("lonely") || text.includes("anxious")) return "lonely";
    if (text.includes("happy") || text.includes("good")) return "happy";
    return "neutral";
};

exports.chatWithAI = async (req, res) => {
    try {
        const { message } = req.body;
        const userId = req.user._id;

        if (!message) {
            return res.status(400).json({ message: "Message is required." });
        }

        // Load or create chat history
        let history = await AIChatHistory.findOne({ user: userId });
        if (!history) {
            history = new AIChatHistory({ user: userId, messages: [] });
        }

        // Save user message
        history.messages.push({ role: "user", content: message });

        // ✅ FORMAT FOR GEMINI v1 — SIMPLE ARRAY OF STRINGS
        const chatHistory = history.messages.map((m) =>
            `${m.role}: ${m.content}`
        );

        // ✅ USE THE "flash" MODEL
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash"
        });

        // ✅ Call Gemini using generateContent() CORRECT FORMAT
        const result = await model.generateContent([
            AI_PERSONA,
            ...chatHistory,
            `user: ${message}`
        ]);

        const aiReply = result.response.text().trim();

        // Sentiment detection
        const sentiment = checkSentiment(message);

        // Save AI reply
        history.messages.push({
            role: "ai",
            content: aiReply,
            sentiment
        });

        await history.save();

        res.json({
            response: aiReply,
            sentiment,
            wouldRecommendVolunteer: sentiment === "lonely"
        });

    } catch (error) {
        console.error("🔥 Gemini Error:", error);
        res.status(500).json({
            message: "AI Service unavailable. Check API key or request format."
        });
    }
};
