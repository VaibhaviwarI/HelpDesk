require('dotenv').config();
const app = require('./src/app')
const connectDB = require('./src/config/db')

try{
    connectDB();
}catch(err){
    console.log("Error in connecting to Database : " ,err);
}

app.listen(3000,()=>{
    console.log("Server is running on port 3000");
})

