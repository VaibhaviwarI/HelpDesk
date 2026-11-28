const ticketModel = require("../models/ticketModel")
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");
const commentModel = require("../models/commentModel");

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
          return next(err);
      }

    return res.status(201).json({
    message: "Ticket created successfully",
    success: true,
    ticket
});

}


async function getTicket(req,res){
    // //old code => without pagination,filtering and search 
//     try{
//     let role = req.user.role;
//     let id = req.user._id;
//     let filter = {}; //No conditions yet

//     if(role === "CUSTOMER"){
//         filter = {createdBy : id}
//     }
//     else if(role === "AGENT"){
//         filter = {assignedTo : id}
//     }
//    else if(role === "ADMIN"){
//         filter = {}; //no condition, all results
//     }

//     const tickets = await ticketModel.find(filter).populate("createdBy", "name email").populate("assignedTo", "name email");

//      if (tickets.length === 0) {
//         return res.status(200).json({
//            message: "No tickets found",
//            success: false
//         });
//      }

//         return res.status(200).json({
//            success: true,
//         count: tickets.length,
//          tickets
//        })

// }catch(err){
//      return res.status(500).json({ message: err.message, success: false });
// }


    //New code => with pagination, filtering and search functionalities

try{
    let role = req.user.role;
    let id = req.user.id;
    let filter = {}; //No conditions yet

    
    
    if(role === "CUSTOMER"){
        filter = {createdBy : id}
    }
    else if(role === "AGENT"){
        filter = {assignedTo : id}
    }
   else if(role === "ADMIN"){
        filter = {}; //no condition, all results
    }

    //Pagination =>
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // search
    let {status, priority, search} = req.query;

    if(status) filter.status = status.toUpperCase();
    if(priority) filter.priority = priority.toUpperCase();

    if(search){
        filter.title = {$regex : search, $options : "i"}  //case insensitive
    }



    const tickets = await ticketModel.find(filter).populate("createdBy", "name email").populate("assignedTo", "name email").skip(skip).limit(limit);

    const totalTickets = await ticketModel.countDocuments(filter);
    const totalPages = Math.ceil(totalTickets / limit);

     if (tickets.length === 0) {
        return res.status(200).json({
           message: "No tickets found",
           success: false
        });
     }

        return res.status(200).json({
           success: true,
        count: tickets.length,
        currentPage : page,
        totalPages : totalPages,
        totalTickets : totalTickets,
         tickets
       })

}catch(err){
     return res.status(500).json({ message: err.message, success: false });
}




}

async function assignTicket(req, res) {
    try {
        const { ticketId } = req.params;
        const { agentId } = req.body;

        if (!agentId) {
            return res.status(400).json({ message: "agentId is required", success: false });
        }

        const agent = await userModel.findOne({ _id: agentId });
        if (!agent) {
            return res.status(404).json({ message: "Agent does not exist", success: false });
        }
        if (agent.role !== "AGENT") {
            return res.status(403).json({ message: "User is not an agent", success: false });
        }

        const updatedTicket = await ticketModel.findByIdAndUpdate(
            ticketId,
            { assignedTo: agentId },
            { new: true }
        );

        if (!updatedTicket) {
            return res.status(404).json({ message: "Ticket not found", success: false });
        }

        return res.status(200).json({
            message: "Ticket assigned to agent",
            success: true,
            ticket: updatedTicket
        });

    } catch (err) {
        return res.status(500).json({ message: err.message, success: false });
    }
}

async function modifyStatus(req,res) {

    try{
        const {ticketId} = req.params;
        const {status} = req.body;

        const { id: userId, role } = req.user;   //  authMiddleware se aaya hua data

        if(!status){
            return res.status(400).json({
                message : "Status is required in the body",
                success : false
            })
        }

        if(role !== "AGENT" && role !== "ADMIN"){
            return res.status(403).json({
                message : "Only Admins and Agent can modify the ticket status",
                success : false
            })
        }

        const ticket = await ticketModel.findById(ticketId);
        if(!ticket){
            return res.status(404).json({
                message : "Ticket not found",
                success : false
            })
        }

        if(role === "AGENT"){
            if(!ticket.assignedTo || ticket.assignedTo.toString() !== userId){
                return res.status(403).json({
                    message : "Only assigned agent can modify the status of ticket",
                    success : false
                })
            }
        }

        ticket.status = status;
        await ticket.save();


        return res.status(200).json({
            message : "Ticket Status successfully Updated",
            success : true,
            ticket
        })

    }catch(err){
        return res.status(500).json({
            message : err.message,
            success : false
        })
    }
}

async function updateTicketInfo(req,res){

    try{
        const {title,description} = req.body;
        const {ticketId} = req.params;
        const{id:userId, role} = req.user;

        if(!title && !description){
            return res.status(400).json({
                message : "Please provide either title or description",
                success : false
            })
        }

        const ticket = await ticketModel.findById(ticketId)

        if(!ticket){
            return res.status(404).json({
                message : "No ticket is associated with this TicketId",
                success : false
            })
        }

        if(role === "AGENT"){
            return res.status(403).json({
                message : "Only Customer or Admin can change the info of the ticket",
                success : false
            })
        }

        if(role === "CUSTOMER"){
            if(!ticket.createdBy || ticket.createdBy.toString() !== userId){
                return res.status(403).json({
                    message : "Only ticket owner can change the ticket information",
                    success : false
                })
            }
        }

        if(title){
            ticket.title = title;
        }
        if(description){
            ticket.description = description;
        }

        await ticket.save();

        return res.status(200).json({
            message : "Ticket Information successfully updated",
            success : true,
            ticket: ticket
        })

    }catch(err){
        return res.status(500).json({
            message : err.message,
            success : false
        })
    }
    

}

async function deleteTicket(req,res){

    try{
        const {ticketId} = req.params;
        const {id:userId,role} = req.user;
        
        const ticket = await ticketModel.findById(ticketId);

        if(!ticket){
            return res.status(404).json({
                message : "Ticket Id is not valid",
                success : false
            })
        }

        if(role === "AGENT"){
            return res.status(403).json({
                message : "Agent are not allowed to delete tickets",
                success : false
            })
        }

        if(role === "CUSTOMER"){
            if(!ticket.createdBy || ticket.createdBy.toString() !== userId){
                return res.status(403).json({
                    message : "Forbidden request, only Customer who created the ticket can delete it",
                    success : false
                })
            }
        }


            //First delete all the comment related to that ticket
         await commentModel.deleteMany({ticketId: ticketId});

          await ticket.deleteOne();


          return res.status(200).json({
            message : "Ticket successfully deleted",
            success : true

         })
       
        

    }catch(err){
        return res.status(500).json({
            message : err.message,
            success : false
        })
    }
}




module.exports = {
        createNewTicket,getTicket,assignTicket, modifyStatus, updateTicketInfo,deleteTicket
}