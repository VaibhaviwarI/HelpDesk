const mongooose = require('mongoose')


async function connectDB(){
    try{
        await mongooose.connect(process.env.MONGODB_URI);
        console.log("Successfully Connected to Database");
    }catch(err){
        console.log("Error in connecting to DB",err);
    }
}

module.exports = connectDB;