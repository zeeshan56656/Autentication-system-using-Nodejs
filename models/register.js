const mongoose = require('mongoose');
const registerSchema = new mongoose.Schema({
email:{
    type:String,
    required:true
},
username:{
    type:String,
    required:true
},
password:{
    type:String,
    required:true
},
date:{
    type:Date,
    default:Date.now()
}



});


module.exports = new mongoose.model('Registeruser',registerSchema)