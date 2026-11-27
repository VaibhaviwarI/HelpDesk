const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({

    message : {
        type : String,
        required : [true, "Message is required to add a comment"]
    },

    author : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : [true, "Someone must be associated with a ticket"]
    },

    ticketId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Ticket",
        required : [true,"Ticket Id is required for making a comment"]
    }
    

}, {
    timestamps : true
})

const commentModel =  mongoose.model("Comment",commentSchema);

module.exports = commentModel;
