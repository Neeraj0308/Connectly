const express = require("express");
const router = express.Router();

const { getMyMatches } = require("../controllers/matchController");

const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, getMyMatches);

module.exports = router;
