const mongoose = require("mongoose")

const imageCode_schema = new mongoose.Schema({
    imageName : {
        type : String,
        unique : true
    },

    imageUrl : {
        type : String,
        unique : true
    }, 

    statusCode : {
        type : Number,
        unique : true
    }
}, {timestamps:true})

module.exports=mongoose.model('imageCode', imageCode_schema)