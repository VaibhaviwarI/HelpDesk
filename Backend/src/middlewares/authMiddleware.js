const userModel = require("../models/userModel")
const jwt = require('jsonwebtoken')
const blacklistModel = require("../models/blacklistModel")

async function authMiddleware(req,res,next){


    const token = req.cookies.token || req.headers.authorization?.split(" ")[1]

    if(!token){
        return res.status(401).json({
            message : "Unauthorized access! token is missing or you are logged out"
        })
    }

    const isBlacklisted = await blacklistModel.findOne({token:token});
         if(isBlacklisted){
            return res.status(401).json({
                message : "You are logged out",
                success : false
            })
        }

    try{

        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.id);
        if(!user){
            return res.status(401).json({
                message : "Token is not associated with any user account"
            })
        }
        req.user = user //name,email,password,role
        return next();
    }catch(err){
        return res.status(401).json({
            message : "Unauthorized access! token is missing"
        })
    }

}

async function authAdminMiddleware(req,res,next){

    const token = req.cookies.token ||  req.headers.authorization?.split(" ")[1];



    if(!token){
        return res.status(401).json({
            message : "Unauthorized access! token is missing"
        })
    }
    

    const isBlacklisted = await blacklistModel.findOne({token:token});
         if(isBlacklisted){
            return res.status(401).json({
                message : "You are logged out",
                success : false
            })
        }


    try{

        const decoded =  jwt.verify(token,process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.id);

         if(!user){
            return res.status(401).json({
                message : "Token is not associated with any user account"
            })
        }

        if(user.role !== "ADMIN"){
            return res.status(403).json({
                message : "Only Admins are allowed to view/modify this content",
                success : false
            })
        }

        req.user = user;
        return next();


    }catch(err){
         return res.status(401).json({
            message : err.message,
            success : false
        })
    }



}

module.exports ={
     authMiddleware, authAdminMiddleware
}