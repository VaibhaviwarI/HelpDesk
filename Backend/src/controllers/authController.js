const express = require('express')
const userModel = require('../models/userModel')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

async function userRegisterController(req,res){

    const {name,email,password,role} = req.body;

    if(!name || !email || !password){
        return res.status(400).json({
            message : "All fields are mandatory to create an account",
            success : false
        })
    }


    const isExists = await userModel.findOne({email})

    if(isExists){
        return res.status(409).json({
            message : "Account with this email already exists",
            success : false
        })
    }

    const user = await userModel.create({
        name,email,password,role
    })


    const token = jwt.sign({ id: user._id, role: user.role , name: user.name},process.env.JWT_SECRET,{expiresIn: '2d'})
    res.cookie("token",token);


    return res.status(201).json({
        message : "Account created Successfully",
        name,
        email,
        role
    })

}

async function userLoginController(req,res){

    const {email,password} = req.body;

    if(!email || !password){
        return res.status(400).json({
            message  : "Email and Password are required for login",
            success: false
        })
    }

    const user = await userModel.findOne({email}).select('+password');

    if(!user){
        return res.status(401).json({
            message : "Email does not exists, please try register first",
            success : false
        })
    }

   const isMatch = await bcrypt.compare(password, user.password);

   if(!isMatch){

    return res.status(401).json({
        message : "Either email or password is incorrect",
        success: false,
    })

   }


    const token = jwt.sign({id:user._id, name : user.name, role: user.role},process.env.JWT_SECRET,{expiresIn : "2d"})

    res.cookie("token",token);

    return res.status(200).json({
        message : "User successfully logged in",
        token
    })

}




module.exports = {
    userRegisterController, userLoginController
}





