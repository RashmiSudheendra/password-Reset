const mongoose = require('mongoose')
const validator = require('validator')

const userSchema = new mongoose.Schema({
    name:{type:String,required:true},
    email:{type:String,required:true,validate:(value)=>validator.isEmail(value)},
    password:{type:String,required:true},
    verifyCode:{type:String},
    verificationCode:{type:String},
    createdAt:{type:Date, default:Date.now()}
},
{
    collection:'user',
    versionKey:false
}
)

const userModel = mongoose.model('user',userSchema)
module.exports = {userModel}

