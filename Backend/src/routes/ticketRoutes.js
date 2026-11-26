const express = require('express')
const ticketController = require('../controllers/ticketController')
const authMiddleware = require("../middlewares/authMiddleware")
const router = express.Router();

router.post("/create",authMiddleware.authMiddleware,ticketController.createNewTicket);
router.get("/get",authMiddleware.authMiddleware,ticketController.getTicket);
router.patch("/:ticketId/assign",authMiddleware.authAdminMiddleware, ticketController.assignTicket);
router.patch("/:ticketId/status",authMiddleware.authMiddleware,ticketController.modifyStatus);

module.exports = router;