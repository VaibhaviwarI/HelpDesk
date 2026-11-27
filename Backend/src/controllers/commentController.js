const mongoose = require('mongoose')
const commentModel = require("../models/commentModel")
const ticketModel = require("../models/ticketModel")

async function addComment(req,res){

    try{
        const {message} = req.body;
        const {ticketId} = req.params;
        const {id:userId,role} = req.user;
        

        const ticket = await ticketModel.findById(ticketId);

        if(!ticket){
            return res.status(404).json({
                message : "TicketId is incorrect, please try with a correct TicketId",
                success : false
            })
        }

       

        if(role === "AGENT"){

            if(!ticket.assignedTo || ticket.assignedTo.toString() !== userId){
                return res.status(403).json({
                    message : "Only assigned Agent can add comment to ticket",
                    success : false
                })
            }

        }

        if(role === "CUSTOMER"){
            if(!ticket.createdBy || ticket.createdBy.toString() !== userId){
                return res.status(403).json({
                    message : "Only ticket Owner can add comment to ticket"
                })
            }
        }


        const newComment = await commentModel.create({
                message,
                author : userId,
                ticketId
            })

            return res.status(201).json({
                message : "Comment Added Successfully",
                success : true,
                data :  newComment
            })  

    }catch(err){
        return res.status(500).json({
            message : err.message,
            success : false,
           
        })
    }


}


async function getComment(req,res){

    try{
        const {ticketId} = req.params;
        const {id:userId,role} = req.user;

        const ticket = await ticketModel.findById(ticketId);

        if(!ticket){
            return res.status(404).json({
                message : "Invalid ticketId, no ticket is associated with this ticket id",
                success : false
            })
        }



        if(role === "AGENT"){
            if(!ticket.assignedTo || ticket.assignedTo.toString() !== userId){
                return res.status(403).json({
                    message : "Forbidden request, Only assigned agent can view the comments",
                    success: false
                })
            }
        }

        if(role === "CUSTOMER"){
            if(!ticket.createdBy || ticket.createdBy.toString() !== userId){
                return res.status(403).json({
                    message : "Forbidden request, only person who created the ticket can view its comment",
                    success : false
                })
            }
        }

        const findAllComments = await commentModel.find({ ticketId: ticketId }).populate("author" , "name email")

        return res.status(200).json({
            message : "All Comments successfully retrieved",
            success : true,
            counts : findAllComments.length,
           comments :  findAllComments
        })
        

    }catch(err){
        return res.status(500).json({
            message : err.message,
            success : false
        })
    }
    


}

module.exports = {
    addComment, getComment
}