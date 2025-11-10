// server/routes/profileRoutes.js
const express = require("express");
const { getProfile, updateProfile, getUserPosts } = require("../controllers/profileController");

const router = express.Router();

router.get("/:id", getProfile);
router.put("/update/:id", updateProfile);
router.get("/posts/:userId", getUserPosts);

module.exports = router;
