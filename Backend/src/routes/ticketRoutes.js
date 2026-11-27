const express = require('express')
const ticketController = require('../controllers/ticketController')
const authMiddleware = require("../middlewares/authMiddleware")
const commentController = require("../controllers/commentController")
const router = express.Router();

router.post("/create",authMiddleware.authMiddleware,ticketController.createNewTicket);
router.get("/get",authMiddleware.authMiddleware,ticketController.getTicket);
router.patch("/:ticketId/assign",authMiddleware.authAdminMiddleware, ticketController.assignTicket);
router.patch("/:ticketId/status",authMiddleware.authMiddleware,ticketController.modifyStatus);
router.post("/:ticketId/comments",authMiddleware.authMiddleware,commentController.addComment);
router.get("/:ticketId/comments",authMiddleware.authMiddleware,commentController.getComment);

module.exports = router;