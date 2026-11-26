require('dotenv').config();
const app = require('./src/app')
const connectDB = require('./src/config/db')
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

try{
    connectDB();
}catch(err){
    console.log("Error in connecting to Database : " ,err);
}

app.listen(3000,()=>{
    console.log("Server is running on port 3000");
})

