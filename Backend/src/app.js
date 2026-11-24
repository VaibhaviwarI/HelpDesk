const cookieParser = require('cookie-parser');
const express = require('express')
const authRoutes  = require('./routes/authRoutes')
const ticketRoutes = require('./routes/ticketRoutes')




const app = express();


app.use(express.json());
app.use(cookieParser())


app.use("/auth", authRoutes);
app.use("/tickets", ticketRoutes);


app.get("/",(req,res)=>{
    res.send("Hello World");
})


module.exports = app;