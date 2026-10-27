
const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/authMiddleware");
const { requireAllowedOrigin } = require("../middleware/csrfMiddleware");

const {
  createDestination,
  getDestinations,
  getDestinationById,
  updateDestination,
  deleteDestination
} = require("../controllers/destinationController");

router.use(requireAuth);
router.post("/", requireAllowedOrigin, createDestination);
router.get("/", getDestinations);
router.get("/:id", getDestinationById);
router.put("/:id", requireAllowedOrigin, updateDestination);
router.delete("/:id", requireAllowedOrigin, deleteDestination);

module.exports = router;
