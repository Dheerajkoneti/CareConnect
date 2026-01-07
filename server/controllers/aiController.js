const { GoogleGenAI } = require("@google/genai");

// Initialize the Gemini client using the environment variable
const ai = new GoogleGenAI({ 
    apiKey: process.env.GEMINI_API_KEY 
});

exports.chatWithAI = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(200).json({
                response: "I'm here with you ❤️. What would you like to talk about?",
            });
        }

        // --- GEMINI API CALL ---
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash", // A fast and powerful model for chat
            contents: message, 
            config: {
                // System instructions for CareConnect
                systemInstruction: "You are CareConnect, a warm and empathetic AI companion. Be supportive and ask gentle questions. Keep your responses concise and helpful.",
            },
        });
        // --- END GEMINI API CALL ---

        // Gemini response structure (uses .text property)
        const aiResponseText = response.text;

        return res.status(200).json({
            response: aiResponseText,
        });

    } catch (error) {
        console.error("GEMINI API ERROR:", error.message);
        
        // Safe, user-friendly fallback
        return res.status(200).json({
            response:
                "I'm here with you ❤️. It seems my system is busy right now, but you’re not alone.",
        });
    }
};