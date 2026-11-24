const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({

    title : {
        type : String,
        maxlength : [60, "Title should not be too large"],
        required : true
    },

    description : {
        type : String,
        minlength : [10, "Description should not be too short"],
        required : true
    },

    status : {
        type : String,
        enum : {
            values : ["OPEN", "IN PROGRESS", "RESOLVED", "CLOSED"],
            message : "Status can be OPEN, IN PROGRESS, RESOLVED or CLOSED"
        },
        required : true,
        default: "OPEN"
    },

    priority : {
        type : String,
        enum : {
            values : ["LOW","MEDIUM","HIGH"],
            message : "Priority can either be LOW, MEDIUM or HIGH"
        },
        default : "MEDIUM"
    },

    createdBy : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required: true
    },

    assignedTo : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    }


}, {
    timestamps : true
})


const ticketModel = new mongoose.model("Ticket",ticketSchema);

module.exports = ticketModel