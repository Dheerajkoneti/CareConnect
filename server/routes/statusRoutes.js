const router = require("express").Router();
const User = require("../models/User");

router.patch("/update-status/:id", async (req, res) => {
  try {
    const { status, customStatus } = req.body;

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      {
        status,
        customStatus: customStatus || "",
        lastActive: Date.now(),
      },
      { new: true }
    );

    res.json({ success: true, user: updated });
  } catch (err) {
    console.error("Status update error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
