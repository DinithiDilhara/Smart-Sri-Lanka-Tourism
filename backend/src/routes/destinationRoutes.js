
const express = require("express");
const router = express.Router();
const { requireAuth, requireAdmin } = require("../middleware/authMiddleware");
const { requireAllowedOrigin } = require("../middleware/csrfMiddleware");

const {
  createDestination,
  getDestinations,
  getDestinationById,
  updateDestination,
  deleteDestination
} = require("../controllers/destinationController");

router.get("/", getDestinations);
router.get("/:id", getDestinationById);
router.post("/", requireAuth, requireAdmin, requireAllowedOrigin, createDestination);
router.put("/:id", requireAuth, requireAdmin, requireAllowedOrigin, updateDestination);
router.patch("/:id", requireAuth, requireAdmin, requireAllowedOrigin, updateDestination);
router.delete("/:id", requireAuth, requireAdmin, requireAllowedOrigin, deleteDestination);

module.exports = router;
