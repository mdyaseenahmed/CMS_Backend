const mongoose = require('mongoose')


const certSchema = new mongoose.Schema({
    
    cert:{type:String,required:true},
    domain: {type: String, required: true},
    email: {type:String,required:true}
    

})

mongoose.model('Cert',certSchema)

