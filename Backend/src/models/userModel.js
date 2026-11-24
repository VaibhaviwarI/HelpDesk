const mongooose =  require('mongoose')
const bcrypt = require('bcryptjs')
const userSchema = new mongooose.Schema({

    name : {
        type : String,
        required : [true, "Name is required for creating a user"]
    },

    email : {
        type : String,
        required : [true,"Email is required for creating an account"],
        unique : true,
        match : /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        trim : true
    }, 

    password : {
        type : String,
        required : [true,"Password is required for creating an account"],
        select : false,
        minlength : [4,"Atleast 4 characters are required for creating a password"]
    },

    role : {
        type : String,
        enum : {
            values : ["CUSTOMER","AGENT","ADMIN"],
            message : "Role must be CUSTOMER, AGENT or ADMIN"
        },
        default : "CUSTOMER"
    }


},{
    timestamps : true
})


userSchema.pre('save', async function(){

    if(!this.isModified("password")){
        return;
    }

    const hash = await bcrypt.hash(this.password,10);
    this.password = hash;
    return;

})


const userModel = new mongooose.model("User",userSchema);

module.exports = userModel;