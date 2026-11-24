const express = require('express')
const ticketController = require('../controllers/ticketController')

const router = express.Router();

router.post("/",ticketController.createNewTicket);


module.exports = router;