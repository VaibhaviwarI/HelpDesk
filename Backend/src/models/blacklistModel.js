const mongoose = require('mongoose')

const blacklistSchema = new mongoose.Schema({

    token : {
        type : String,
        required : [true, "Token is required to blacklist"],
        unique : [true, "Token is already blacklisted"]
    }   

}, {
    timestamps : true
})


blacklistSchema.index({
    createdAt: 1
}, {expireAfterSeconds: 60 * 60 * 24 * 3}) // 3 days

const blacklistModel = mongoose.model("Blacklist",blacklistSchema);

module.exports = blacklistSchema;