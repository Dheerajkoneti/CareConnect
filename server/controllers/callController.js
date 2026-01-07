const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_AUTH_TOKEN
);

exports.makeCall = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ message: "Phone number required" });
    }

    const call = await client.calls.create({
      to: phone,
      from: process.env.TWILIO_PHONE,
      url: "https://handler.twilio.com/twiml/EHxxxxxxxxxxxx"
    });

    res.json({
      success: true,
      message: "Call initiated",
      callSid: call.sid
    });
  } catch (error) {
    console.error("CALL ERROR:", error.message);
    res.status(500).json({ message: "Call failed" });
  }
};
