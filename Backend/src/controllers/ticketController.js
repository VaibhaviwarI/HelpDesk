const ticketModel = require("../models/ticketModel")
const jwt = require("jsonwebtoken");

async function createNewTicket(req,res){

    const {title,description,priority} = req.body;

    if(!title || !description){
        return res.status(400).json({
            message : "Title and Description are required to create a new Ticket"
        })
    }

    const authHeader = req.headers.authorization;
       if (!authHeader || !authHeader.startsWith("Bearer ")) {
       return res.status(401).json({ message: "Not authorized", success: false });
   }

   const token = authHeader.split(" ")[1];


    let decoded;
   try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token", success: false });
    }

    const createdBy = decoded.id;

    if(!createdBy){
        return res.status(401).json({
            message : "Invalid user ID",
            success : false
        })
    }

    let ticket;
    try{

     ticket = await ticketModel.create({
        title,description,priority,createdBy
    })

      }catch(err){
          return res.status(500).json({
        message: "Failed to create ticket",
        error: err.message,
        success: false
     });
      }

    return res.status(201).json({
    message: "Ticket created successfully",
    success: true,
    ticket
});

}


module.exports = {
        createNewTicket
}