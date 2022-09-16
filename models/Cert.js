const { Binary, Int32 } = require('mongodb')
const mongoose = require('mongoose')


const certSchema = new mongoose.Schema({
    
    cert:{type:String,required:true},
    domain: {type: String, required: true},
    email: {type:String,required:true},
    type:{type:String,required:true},
    conf:{type:String,required:true}
    
    
    

})

mongoose.model('Cert',certSchema)

